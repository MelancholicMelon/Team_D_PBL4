  // Configuration - verified working with JSONBin
  const JSONBIN_CONFIG = {
    URL: "https://api.jsonbin.io/v3/b/677e41bfe41b4d34e471c5be",
    KEY: "$2a$10$eaLfBzS96u7D/mrTuyOiqOEkAFr6nLwT2OPGfu99Lj9uzvLGq0GKS",
    TEST_GROUP_ID: sessionStorage.getItem("groupID"),//test_group_123 for an already tested group and how the o/p looks like
    TEST_USER_ID: sessionStorage.getItem("user")
    /*
    This is the expected JSONBin structure for each group:
    {
    "test_group_ID": {
    "split_votes": {},         // Stores votes from each user
    "total_members": number,   // Total number of group members
    "bill_inputs": {},         // Stores bill details entered by users
    "final_split_method": null // Final split method decided by the group
     }
    }
    */

};

// Show status/error messages with color coding
function showMessage(message, isError = false) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.style.backgroundColor = isError ? '#ffe6e6' : '#e8f4f2';
    statusElement.textContent = message;
    console.log(`${isError ? 'Error' : 'Status'}: ${message}`); // For testing
}

// Save user's vote
async function saveVote(splitMethod) {
    try {
        showMessage('Saving your vote...', false);
        
        // Get current data
        const response = await fetch(JSONBIN_CONFIG.URL, {
            method: "GET",
            headers: {
                "X-Master-Key": JSONBIN_CONFIG.KEY,
                "X-Bin-Meta": "false"
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch current data');

        let data = await response.json();
        // Update vote
        data[JSONBIN_CONFIG.TEST_GROUP_ID].group_info.split_votes[JSONBIN_CONFIG.TEST_USER_ID] = splitMethod;

        // Save updated data
        const updateResponse = await fetch(JSONBIN_CONFIG.URL, {
            method: "PUT",
            headers: {
                "X-Master-Key": JSONBIN_CONFIG.KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!updateResponse.ok) throw new Error('Failed to save vote');

        showMessage('Vote saved! Checking status...', false);
        await checkVoteStatus();

    } catch (error) {
        console.error('Error:', error);
        showMessage('Error saving vote. Please try again.', true);
    }
}

// Check current voting status
async function checkVoteStatus() {
    try {
        showMessage('Checking status...', false);
        // Fetch the current data from JSONBin
        const response = await fetch(JSONBIN_CONFIG.URL, {
            method: "GET",
            headers: {
                "X-Master-Key": JSONBIN_CONFIG.KEY,
                "X-Bin-Meta": "false"
            }
        });

        if (!response.ok) throw new Error("Failed to fetch vote status");

        const data = await response.json();
        console.log(data);
        const groupData = data[JSONBIN_CONFIG.TEST_GROUP_ID];

        // If the group data does not exist, initialize it
        if (!groupData) {
            throw new Error(
                `Group ${JSONBIN_CONFIG.TEST_GROUP_ID} does not exist. Please ensure the group is created in JSONBin.`
            );
        }

        // Ensure all necessary fields are initialized
        groupData.group_info.split_votes = groupData.group_info.split_votes || {};
        groupData.group_info.bill_inputs = groupData.group_info.bill_inputs || {};
        groupData.group_info.final_split_method = groupData.group_info.final_split_method || null;

        const votes = groupData.group_info.split_votes;
        const totalVotes = Object.keys(votes).length;
        const totalMembers = groupData.group_info.number_of_members;

        if (totalVotes === 0) {
            showMessage('No votes yet. Waiting for group members to decide...', false);
            return;
        }

        if (totalVotes === totalMembers) {
            const voteCounts = {
                equal: 0,
                individual: 0
            };
            Object.values(votes).forEach(vote => voteCounts[vote]++);

            const winningMethod = voteCounts.equal >= voteCounts.individual ? 'equal' : 'individual';

            // Save the final decision
            groupData.group_info.final_split_method = winningMethod;
            await saveFinalDecision(data);

            showMessage('All votes in! Proceeding to input page...', false);
            setTimeout(() => window.location.href = 'input.html', 1500);
        } else {
            showMessage(`Waiting for other members to vote... (${totalVotes}/${totalMembers})`, false);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Could not check vote status. Please try again.', true);
    }
}


// Save the final split method decision
async function saveFinalDecision(data) {
    try {
        const response = await fetch(JSONBIN_CONFIG.URL, {
            method: "PUT",
            headers: {
                "X-Master-Key": JSONBIN_CONFIG.KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to save final decision');
        
    } catch (error) {
        console.error('Error saving final decision:', error);
        showMessage('Error saving final decision. Please try again.', true);
    }
}

// Handle continue button click
function continueToBillInput() {
    const selectedMethod = document.querySelector('input[name="split-method"]:checked');
    if (!selectedMethod) {
        showMessage('Please select a split method!', true);
        return;
    }
    saveVote(selectedMethod.value);
}

// Check status when page loads
window.onload = checkVoteStatus;