const signupform = document.getElementById("signup_form");
const signupButton = document.getElementById("signup-form-submit");
const signuperrormsg = document.getElementById("signup_error_msg");

function sign_up() {
    signupButton.addEventListener("click", (e) => {
        e.preventDefault();

        const username = signupform.username.value;
        const password = signupform.password.value;
        if (username == "" && password == "") {
            alert("Enter username and password for registration");

        }
        else {

            // Step 1: Fetch the current bin data
            fetch("https://api.jsonbin.io/v3/b/675abe1aad19ca34f8d9e50e", {
                method: "GET",
                headers: {
                    "X-Master-Key": "$2a$10$g9c/NsUlzr1mXyNGjQBKWu4/5kVhHan0Z7TWFqyRlBOpvOjXz4J6i",
                    "Content-Type": "application/json"
                }
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    // Step 2: Update the JSON data with the new user
                    const currentData = data.record; // JSONBin stores the data inside `record`
                    const userExists = Object.values(currentData).some(user => user.Username === username);

                    if (userExists) {
                        signuperrormsg.textContent = "Username already exists. Please choose another.";
                        signuperrormsg.style.opacity = 1;
                        return; // Stop further execution if user already exists
                    }
                    const newUserKey = `User${Object.keys(currentData).length + 1}`;
                
                    currentData[newUserKey] = { Username: username, password: password };
                

                    // Step 3: Send the updated data back to the bin
                    return fetch("https://api.jsonbin.io/v3/b/675abe1aad19ca34f8d9e50e", {
                        method: "PUT",
                        headers: {
                            "X-Master-Key": "$2a$10$g9c/NsUlzr1mXyNGjQBKWu4/5kVhHan0Z7TWFqyRlBOpvOjXz4J6i",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(currentData)
                    });
                })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Successfully updated JSONBin data:", data);
                    alert("Sign-up successful!");
                    location.assign("/views/login_page.html")
                })
                .catch((error) => {
                    console.error("Error updating JSONBin:", error);
                    alert("An error occurred. Please try again later.");
                
                });
        }
})
    };


sign_up();