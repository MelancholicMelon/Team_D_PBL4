const loginform = document.getElementById("login_form");
const loginButton = document.getElementById("login-form-submit");
const loginerrormsg = document.getElementById("login_error_msg");

function validate_login() {
    loginButton.addEventListener("click", (e) => {
        e.preventDefault();

        const username = loginform.username.value;
        const password = loginform.password.value;

        // Fetch the credentials from the JSON API
        fetch("https://api.jsonbin.io/v3/b/675abe1aad19ca34f8d9e50e", {
            method: "GET",
            headers: {
                "X-Master-Key": "$2a$10$g9c/NsUlzr1mXyNGjQBKWu4/5kVhHan0Z7TWFqyRlBOpvOjXz4J6i"
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
                    location.assign("/views/login_succesful.html");
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