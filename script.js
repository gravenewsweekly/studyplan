const API_KEY = "$2a$10$9lovVKvnl4Bu3l2cw0/.6Osl604XMjJ14bPtG3EHFU8OUAOdhwJ0C";
const BIN_ID = "67e064ec8561e97a50f17061";
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

let loggedInUser = null;

// Fetch user data from JSONBin
async function fetchUserData() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: { "X-Master-Key": API_KEY }
        });
        const data = await response.json();
        return data.record.users || [];
    } catch (error) {
        console.error("Error fetching user data:", error);
        return [];
    }
}

// Update user data in JSONBin
async function updateUserData(users) {
    try {
        const response = await fetch(API_URL, {
            method: "PUT",
            headers: {
                "X-Master-Key": API_KEY,
                "Content-Type": "application/json",
                "X-Bin-Versioning": "false"
            },
            body: JSON.stringify({ users })
        });
        if (!response.ok) throw new Error("Failed to update data.");
    } catch (error) {
        console.error("Error updating user data:", error);
    }
}

// User Login
async function login() {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    const users = await fetchUserData();
    const user = users.find(u => u.username === username);

    if (!user) {
        alert("Username not found. Please sign up.");
        return;
    }

    if (user.password !== password) {
        alert("Incorrect password.");
        return;
    }

    loggedInUser = user;
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    window.location.href = "dashboard.html"; // Redirect to dashboard
}

// User Signup
async function signup() {
    const username = document.getElementById("signup-username").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const nickname = document.getElementById("signup-nickname").value.trim();
    const bio = document.getElementById("signup-bio").value.trim();

    if (!username || !password || !nickname || !bio) {
        alert("All fields are required.");
        return;
    }

    const users = await fetchUserData();
    const existingUser = users.find(u => u.username === username);

    if (existingUser) {
        alert("Username already taken. Try another.");
        return;
    }

    const newUser = { username, password, nickname, bio, plans: [] };
    users.push(newUser);

    await updateUserData(users);
    localStorage.setItem("loggedInUser", JSON.stringify(newUser));
    window.location.href = "index.html"; // Redirect to login page
}

// Display Study Plans on Dashboard
function displayStudyPlans() {
    if (!loggedInUser) {
        loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    }

    if (!loggedInUser) {
        alert("No user logged in. Redirecting to login page.");
        window.location.href = "index.html";
        return;
    }

    const plansTable = document.getElementById("plans-table-body");
    plansTable.innerHTML = "";

    loggedInUser.plans.forEach((plan, index) => {
        const row = `<tr>
            <td>${plan.subject}</td>
            <td>${plan.time}</td>
            <td><button onclick="deleteStudyPlan(${index})">Delete</button></td>
        </tr>`;
        plansTable.innerHTML += row;
    });
}

// Add Study Plan
async function addStudyPlan() {
    const subject = document.getElementById("subject").value.trim();
    const time = document.getElementById("time").value.trim();

    if (!subject || !time) {
        alert("Please enter both subject and time.");
        return;
    }

    if (!loggedInUser) {
        loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    }
    if (!loggedInUser) return;

    loggedInUser.plans.push({ subject, time });

    let users = await fetchUserData();
    let updatedUsers = users.map(user => 
        user.username === loggedInUser.username ? loggedInUser : user
    );

    await updateUserData(updatedUsers);
    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    displayStudyPlans();
}

// Delete Study Plan
async function deleteStudyPlan(index) {
    if (!loggedInUser) {
        loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    }
    if (!loggedInUser) return;

    loggedInUser.plans.splice(index, 1);

    let users = await fetchUserData();
    let updatedUsers = users.map(user => 
        user.username === loggedInUser.username ? loggedInUser : user
    );

    await updateUserData(updatedUsers);
    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    displayStudyPlans();
}

// Auto-load study plans on dashboard page
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("dashboard.html")) {
        displayStudyPlans();
    }
});
