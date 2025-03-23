const API_KEY = "$2a$10$9lovVKvnl4Bu3l2cw0/.6Osl604XMjJ14bPtG3EHFU8OUAOdhwJ0C";
const BIN_ID = "67e064ec8561e97a50f17061";
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Store logged-in user
let loggedInUser = null;

// Fetch user data from JSONBin
async function fetchUserData() {
    try {
        let response = await fetch(API_URL, {
            method: "GET",
            headers: { "X-Master-Key": API_KEY }
        });
        let data = await response.json();
        return data.record.users;
    } catch (error) {
        console.error("Error fetching user data:", error);
        return [];
    }
}

// Update JSONBin with new user data
async function updateUserData(users) {
    try {
        let response = await fetch(API_URL, {
            method: "PUT",
            headers: {
                "X-Master-Key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ users })
        });

        if (!response.ok) throw new Error("Failed to update data.");
    } catch (error) {
        console.error("Error updating user data:", error);
    }
}

// User Signup
async function signup() {
    let username = document.getElementById("signup-username").value;
    let password = document.getElementById("signup-password").value;
    let nickname = document.getElementById("signup-nickname").value;
    let bio = document.getElementById("signup-bio").value;

    let users = await fetchUserData();

    if (users.some(user => user.username === username)) {
        alert("Username already exists. Please choose another one.");
        return;
    }

    let newUser = {
        username,
        password,
        nickname,
        bio,
        plans: []
    };

    users.push(newUser);
    await updateUserData(users);
    alert("Signup successful! You can now log in.");
    window.location.href = "login.html"; // Redirect to login page
}

// User Login
async function login() {
    let username = document.getElementById("login-username").value;
    let password = document.getElementById("login-password").value;
    
    let users = await fetchUserData();
    let user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        loggedInUser = user;
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        window.location.href = "dashboard.html"; // Redirect to dashboard
    } else {
        alert("Invalid username or password.");
    }
}

// Logout Function
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

// Display Study Plans in a Table
function displayStudyPlans() {
    loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) return;

    let plansTable = document.getElementById("plans-table-body");
    plansTable.innerHTML = "";

    loggedInUser.plans.forEach((plan, index) => {
        let row = plansTable.insertRow();
        row.insertCell(0).innerText = plan.subject;
        row.insertCell(1).innerText = plan.time;
    });
}

// Add a New Study Plan
async function addStudyPlan() {
    let subject = document.getElementById("subject").value;
    let time = document.getElementById("time").value;

    loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
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

// Load Study Plans on Dashboard
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("dashboard.html")) {
        displayStudyPlans();
    }
});
