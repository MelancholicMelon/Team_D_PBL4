const loginform = document.getElementById("login_form");
const loginButton = document.getElementById("login-form-submit");
const loginerrormsg = document.getElementById("login_error_msg");


const user_credential_json_api = "https://api.jsonbin.io/v3/b/677e41bfe41b4d34e471c5be";

function validate_login() {
    loginButton.addEventListener("click", (e) => {
        e.preventDefault();

        const username = loginform.username.value;
        const password = loginform.password.value;

        // Fetch the credentials from the JSON API
        fetch(user_credential_json_api, {
            method: "GET",
            headers: {
                "X-Master-Key": "$2a$10$eaLfBzS96u7D/mrTuyOiqOEkAFr6nLwT2OPGfu99Lj9uzvLGq0GKS"
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                const credentials = data.record; // Adjust if API response structure differs
                
                // Check if the entered credentials match any in the fetched data
                const user = Object.values(credentials).find(
                    (cred) => cred.Username === username && cred.password === password
                );

                if (user) {
                    //alert("Login successful!");
                    sessionStorage.setItem("user", username);
                    //username_from_local_storage = localStorage.getItem("user");
                    //console.log(username_from_local_storage);
                    location.assign("./join_or_create.html");
                } else {
                    loginerrormsg.textContent = "Invalid username or password.";
                    loginerrormsg.style.opacity = 1;
                }
            })
            .catch((error) => {
                console.error("Error fetching credentials:", error);
                loginerrormsg.textContent = "An error occurred. Please try again later.";
                loginerrormsg.style.opacity = 1;
            });
    });
}

validate_login();