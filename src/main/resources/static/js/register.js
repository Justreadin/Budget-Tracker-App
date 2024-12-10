document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission

    console.log("Register form submitted"); // Debugging log

    // Retrieve and sanitize form values
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    console.log({ username, email, password, confirmPassword }); // Log user input

    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    let valid = true;

    // Utility function for displaying errors
    function displayError(element, message) {
        const error = document.createElement('div');
        error.className = 'form-text text-danger error-message';
        error.textContent = message;
        element.after(error);
    }

    // Validate username
    if (username === '') {
        valid = false;
        displayError(document.getElementById('username'), 'Username is required.');
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
        valid = false;
        displayError(document.getElementById('email'), 'Invalid email format.');
    }

    // Validate password presence
    if (password === '') {
        valid = false;
        displayError(document.getElementById('password'), 'Password is required.');
    }

    // Validate password strength
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        valid = false;
        displayError(document.getElementById('password'), 'Password must be at least 8 characters long, include a number and an uppercase letter.');
    }

    // Validate password match
    if (password !== confirmPassword) {
        valid = false;
        displayError(document.getElementById('confirmPassword'), 'Passwords do not match.');
    }

    // Proceed only if all validations pass
    if (valid) {
        console.log("Validation successful, sending data to the server...");

        // Show loading spinner and disable button
        const spinner = document.getElementById('loadingSpinner');
        const submitButton = document.querySelector('#registerForm button[type="submit"]');
        spinner.classList.remove('d-none');
        submitButton.disabled = true;

        // Send registration request to the server
        fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: username, email, password })
        })
            .then(response => response.json())
            .then(data => {
                spinner.classList.add('d-none');
                submitButton.disabled = false;

                if (data.success) {
                    alert('Registration successful!');
                    window.location.href = '/login';
                } else {
                    displayError(document.getElementById('registerForm'), data.message);
                }
            })
            .catch(error => {
                spinner.classList.add('d-none');
                submitButton.disabled = false;
                console.error('Error:', error);
                alert('An error occurred while processing your request.');
            });
    }
});
