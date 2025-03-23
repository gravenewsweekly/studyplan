const binId = "67e064ec8561e97a50f17061";
const apiKey = "$2a$10$qjojQGEEZY/70dYrLzZt7.TPkF8J1vn3.wz4VlKQW7Npy1XYXZeo2";
const apiUrl = `https://api.jsonbin.io/v3/b/${binId}`;

// Fetch users from database
async function getUsers() {
    let response = await fetch(apiUrl, { headers: { "X-Master-Key": apiKey } });
    let data = await response.json();
    return data.record.users || [];
}

// Save users back to the database
async function saveUsers(users) {
    await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Master-Key": apiKey },
        body: JSON.stringify({ users })
    });
}

// SIGNUP FUNCTION
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let users = await getUsers();

    // Check if the username already exists
    if (users.some(user => user.username === username)) {
        alert("Username already taken. Try another one.");
        return;
    }

    // Add new user to the database
    users.push({ username, password, bio: "", plans: [] });
    await saveUsers(users);

    localStorage.setItem("loggedInUser", username);
    window.location.href = "index.html"; // Redirect to homepage
});

// AUTO UPDATE NAVBAR WHEN LOGGED IN
window.onload = async () => {
    let user = localStorage.getItem("loggedInUser");
    let userNav = document.getElementById("userNav");

    if (user) {
        userNav.innerHTML = `
            <div class="dropdown">
                <button class="dropbtn">${user}</button>
                <div class="dropdown-content">
                    <a href="dashboard.html">Dashboard</a>
                    <a href="profile.html">Profile</a>
                    <a href="#" id="logout">Log Out</a>
                </div>
            </div>
        `;

        // LOGOUT FUNCTION
        document.getElementById("logout").addEventListener("click", () => {
            localStorage.removeItem("loggedInUser");
            window.location.href = "index.html";
        });
    }
};

// STUDY PLAN FUNCTION
document.getElementById("studyForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    let subject = document.getElementById("subject").value;
    let time = document.getElementById("time").value;
    let user = localStorage.getItem("loggedInUser");

    if (!user) {
        alert("Please log in first!");
        return;
    }

    let users = await getUsers();
    let userData = users.find(u => u.username === user);
    
    if (userData) {
        userData.plans.push({ subject, time });
        await saveUsers(users);
        alert("Study plan added successfully!");
    }
});
