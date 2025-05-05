let users = [];
const group_info_json_api = "Secret";
const apiMasterKey = "Secret";

// Common headers for all requests
const commonHeaders = {
    "X-Master-Key": apiMasterKey,
    "X-Bin-Meta": "false",
    "Content-Type": "application/json"
};

document.addEventListener("DOMContentLoaded", () => {
    // Initialize elements
    const loggedInUser = sessionStorage.getItem("user");
    const userGreetingElement = document.getElementById("user_greetings");
    const groupNameInput = document.getElementById("group_name");
    const memberInput = document.getElementById("member_input");
    const addMemberButton = document.getElementById("add_member");
    const createGroupButton = document.getElementById("create_group");
    const memberList = document.getElementById("member_list");

    // Display user greeting
    userGreetingElement.textContent = loggedInUser 
        ? `Welcome, ${loggedInUser}!` 
        : "Welcome, Guest!";

    // Helper function to validate group name
    async function validateGroupName() {
        const groupName = groupNameInput.value.trim();
        const errorElement = document.getElementById("group_name_error");
        
        if (!groupName) {
            errorElement.textContent = "Please enter a group name.";
            return false;
        }

        try {
            const response = await fetch(group_info_json_api, {
                method: "GET",
                headers: commonHeaders
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const existingGroups = await response.json();
            
            const exists = Object.values(existingGroups).some(group => {
                return group && 
                       group.group_info && 
                       group.group_info.groupname && 
                       group.group_info.groupname.toLowerCase() === groupName.toLowerCase();
            });

            if (exists) {
                errorElement.textContent = "This group name already exists. Please choose another.";
                return false;
            }

            errorElement.textContent = "";
            return true;
        } catch (error) {
            console.error("Error checking group name:", error);
            errorElement.textContent = "Error checking group name. Please try again.";
            return false;
        }
    }

    // Helper function to validate user
    async function validateUser(username) {
        try {
            const response = await fetch(group_info_json_api, {
                method: "GET",
                headers: commonHeaders
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Check if user exists in any UserN object
            return Object.keys(data).some(key => {
                return key.startsWith("User") && 
                       data[key] &&
                       data[key].Username && 
                       data[key].Username.toLowerCase() === username.toLowerCase();
            });
        } catch (error) {
            console.error("Error checking user:", error);
            return false;
        }
    }

    // Update create button state
    function updateCreateButtonState() {
        createGroupButton.disabled = users.length === 0 || !groupNameInput.value.trim();
    }

    // Add member to the list
    function addMemberToList(username) {
        const memberItem = document.createElement("div");
        memberItem.className = "member-item";
        
        const memberName = document.createElement("span");
        memberName.textContent = username;
        
        const removeButton = document.createElement("button");
        removeButton.className = "remove-member";
        removeButton.textContent = "×";
        removeButton.onclick = () => {
            users = users.filter(user => user !== username);
            memberItem.remove();
            updateCreateButtonState();
        };
        
        memberItem.appendChild(memberName);
        memberItem.appendChild(removeButton);
        memberList.appendChild(memberItem);
    }

    // Event Listeners
    groupNameInput.addEventListener("input", () => {
        validateGroupName();
        updateCreateButtonState();
    });

    addMemberButton.addEventListener("click", async () => {
        const username = memberInput.value.trim();
        const errorElement = document.getElementById("member_error");
        
        if (!username) {
            errorElement.textContent = "Please enter a username.";
            return;
        }

        if (users.includes(username)) {
            errorElement.textContent = "This user is already in the group.";
            return;
        }

        const userExists = await validateUser(username);
        if (!userExists) {
            errorElement.textContent = "User does not exist.";
            return;
        }

        errorElement.textContent = "";
        users.push(username);
        addMemberToList(username);
        memberInput.value = "";
        updateCreateButtonState();
    });

    createGroupButton.addEventListener("click", async () => {
        const groupName = groupNameInput.value.trim();
        
        if (!(await validateGroupName())) {
            return;
        }

        try {
            // Fetch current data
            const getResponse = await fetch(group_info_json_api, {
                method: "GET",
                headers: commonHeaders
            });
            
            if (!getResponse.ok) {
                throw new Error(`HTTP error! status: ${getResponse.status}`);
            }
            
            const currentData = await getResponse.json();

            // Add new group
            const newGroupId = `group_${Object.keys(currentData).length + 1}`;
            //Save group ID to session storage
            sessionStorage.setItem("groupID", newGroupId);
            const newGroupData = {
                group_info: {
                    groupname: groupName,
                    number_of_members: users.length,
                    members: users,
                    preferred_restaurant: [],
                    split_votes: {},
                    bill_inputs: {},
                    final_split_method: null

                }
            };

            currentData[newGroupId] = newGroupData;

            // Update JSONBin
            const updateResponse = await fetch(group_info_json_api, {
                method: "PUT",
                headers: commonHeaders,
                body: JSON.stringify(currentData)
            });

            if (!updateResponse.ok) {
                throw new Error(`HTTP error! status: ${updateResponse.status}`);
            }

            // Save group name to sessionStorage
            localStorage.setItem("groupName", groupName);
            sessionStorage.setItem("groupName", groupName);
            

            console.log(localStorage.getItem("group"));
            console.log(sessionStorage.getItem("group"));
            alert("Group successfully created!");
            location.assign("./restaurant_and_voting.html");
        } catch (error) {
            console.error("Error creating group:", error);
            alert("An error occurred while creating the group. Please try again.");
        }
    });
});