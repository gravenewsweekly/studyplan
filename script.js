const API_KEY = "$2a$10$9lovVKvnl4Bu3l2cw0/.6Osl604XMjJ14bPtG3EHFU8OUAOdhwJ0C";
const BIN_ID = "67e064ec8561e97a50f17061";
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Store logged-in user
let loggedInUser = null;

// Function to fetch user data from JSONBin
async function fetchUserData() {
    try {
        let response = await fetch(API_URL, {
            method: "GET",
            headers: { "X-Master-Key": API_KEY }
        });
        let data = await response.json();
        return data.record.users || [];
    } catch (error) {
        console.error("Error fetching user data:", error);
        return [];
    }
}

// Function to update JSONBin with new data
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

// Function to handle user login
async function login() {
    let username = document.getElementById("login-username").value.trim();
    let password = document.getElementById("login-password").value.trim();

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    let users = await fetchUserData();
    let user = users.find(u => u.username === username);

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

// Function to handle user signup
async function signup() {
    let username = document.getElementById("signup-username").value.trim();
    let password = document.getElementById("signup-password").value.trim();

    if (!username || !password) {
        alert("Username and password are required.");
        return;
    }

    let users = await fetchUserData();
    let existingUser = users.find(u => u.username === username);

    if (existingUser) {
        alert("Username already taken. Try another.");
        return;
    }

    let newUser = { username, password, plans: [] };
    users.push(newUser);

    await updateUserData(users);
    localStorage.setItem("loggedInUser", JSON.stringify(newUser));
    window.location.href = "index.html"; // Redirect to home after signup
}

// Function to display study plans in a table
function displayStudyPlans() {
    if (!loggedInUser) {
        loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    }
    if (!loggedInUser) return;

    let plansTable = document.getElementById("plans-table-body");
    plansTable.innerHTML = "";

    loggedInUser.plans.forEach((plan, index) => {
        let row = plansTable.insertRow();
        row.insertCell(0).innerText = plan.subject;
        row.insertCell(1).innerText = plan.time;
    });
}

// Function to add a new study plan
async function addStudyPlan() {
    let subject = document.getElementById("subject").value.trim();
    let time = document.getElementById("time").value.trim();

    if (!subject || !time) {
        alert("Please fill in both subject and time.");
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
    displayStudyPlans();
}

// Function to logout
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
}

// Load study plans on dashboard
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("dashboard.html")) {
        loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        displayStudyPlans();
    }
});
