document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent default form submission

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        // Clear previous error messages
        clearErrorMessages();

        let isValid = true;

        // Validate email format
        if (!validateEmail(email)) {
            isValid = false;
            displayError("email", "Invalid email format.");
        }

        // Validate password presence
        if (!password) {
            isValid = false;
            displayError("password", "Password cannot be empty.");
        }

        if (isValid) {
            handleLogin(email, password);
        }
    });

    /**
     * Validate email format using regex.
     * @param {string} email - Email address to validate.
     * @returns {boolean} True if valid, false otherwise.
     */
    function validateEmail(email) {
        return /\S+@\S+\.\S+/.test(email);
    }

    /**
     * Clear all previous error messages from the form.
     */
    function clearErrorMessages() {
        const errorMessages = document.querySelectorAll(".form-text.text-danger");
        errorMessages.forEach((error) => error.remove());
    }

    /**
     * Display an error message below the input field.
     * @param {string} fieldId - The input field ID where the error occurred.
     * @param {string} message - The error message to display.
     */
    function displayError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.createElement("div");
        errorDiv.className = "form-text text-danger mt-1";
        errorDiv.textContent = message;
        field.after(errorDiv);
    }

    /**
     * Handle the login process via API.
     * @param {string} email - User email.
     * @param {string} password - User password.
     */
    function handleLogin(email, password) {
        const spinner = document.getElementById("loadingSpinner");
        spinner.classList.remove("d-none"); // Show spinner


        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Abort after 10 seconds

        fetch("http://localhost:1200/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        if (text.trim().startsWith("<!DOCTYPE")) {
                            throw new Error("Unexpected HTML response. Check server configuration.");
                        }
                        throw new Error("Login failed: " + text);
                    });
                }
                return response.json();
            })
            .then((data) => {
                clearTimeout(timeoutId);
                spinner.classList.add("d-none");

                if (data.success && data.token) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("Role", data.role);

                    const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
                    localStorage.setItem("userId", tokenPayload.userId);

                    console.log("Decoded token payload:", tokenPayload);
                    console.log("User ID stored:", localStorage.getItem("userId"));


                    console.log("User joined with ID:", localStorage.getItem("userId"));
                    alert("Login successful!");
                    if (data.role === "admin") {
                        window.location.href = "/admin";
                    } else {
                        window.location.href = `/dashboard?userId=${localStorage.getItem("userId")}`;
                    }
                } else {
                    throw new Error(data.message || "Invalid server response.");
                }
            })
            .catch((error) => {
                clearTimeout(timeoutId);
                spinner.classList.add("d-none");
                console.error("Error during login:", error);
                alert(`Login failed: ${error.message}`);
            });
    };

});
