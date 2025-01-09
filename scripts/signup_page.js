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
            fetch("https://api.jsonbin.io/v3/b/677e41bfe41b4d34e471c5be", {
                method: "GET",
                headers: {
                    "X-Master-Key": "$2a$10$eaLfBzS96u7D/mrTuyOiqOEkAFr6nLwT2OPGfu99Lj9uzvLGq0GKS",
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
                    return fetch("https://api.jsonbin.io/v3/b/677e41bfe41b4d34e471c5be", {
                        method: "PUT",
                        headers: {
                            "X-Master-Key": "$2a$10$eaLfBzS96u7D/mrTuyOiqOEkAFr6nLwT2OPGfu99Lj9uzvLGq0GKS",
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
                    location.assign("./main.html")
                })
                .catch((error) => {
                    console.error("Error updating JSONBin:", error);
                    alert("An error occurred. Please try again later.");
                
                });
        }
})
    };


sign_up();