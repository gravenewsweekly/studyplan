const binId = "67e064ec8561e97a50f17061";
const apiKey = "$2a$10$9lovVKvnl4Bu3l2cw0/.6Osl604XMjJ14bPtG3EHFU8OUAOdhwJ0C";
const apiUrl = `https://api.jsonbin.io/v3/b/${binId}`;

// Fetch users from database
async function getUsers() {
    try {
        let response = await fetch(apiUrl, { headers: { "X-Master-Key": apiKey } });
        let data = await response.json();
        return data.record.users || [];
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

// Save users back to the database
async function saveUsers(users) {
    try {
        await fetch(apiUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "X-Master-Key": apiKey },
            body: JSON.stringify({ users })
        });
    } catch (error) {
        console.error("Error saving users:", error);
    }
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
            location.reload();
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
        // Ensure plans array exists
        if (!userData.plans) {
            userData.plans = [];
        }

        userData.plans.push({ subject, time });
        await saveUsers(users);
        alert("Study plan added successfully!");

        // Reload page to reflect new study plan
        location.reload();
    }
});

// DISPLAY STUDY PLANS
async function displayStudyPlans() {
    let user = localStorage.getItem("loggedInUser");
    if (!user) return;

    let users = await getUsers();
    let userData = users.find(u => u.username === user);

    if (userData?.plans?.length) {
        let planList = document.getElementById("studyPlans");
        planList.innerHTML = "";
        userData.plans.forEach(plan => {
            let li = document.createElement("li");
            li.textContent = `${plan.subject} - ${plan.time}`;
            planList.appendChild(li);
        });
    }
}

window.onload = displayStudyPlans;
