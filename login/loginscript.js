function validateLogin(event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get the username and password values from the form
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Define correct username and password
    const correctUsername = 'user';
    const correctPassword = 'pass';

    // Check if the entered values are correct
    if (username === correctUsername && password === correctPassword) {
        // Redirect to gameindex.html if credentials are correct
        window.location.href = "index.html"
    } else {
        // Show an alert if credentials are incorrect
        alert('Incorrect username or password');
    }
}