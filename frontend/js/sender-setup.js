const API_BASE = "http://localhost:3000/api";

const form = document.getElementById("senderSetupForm");
const errorMsg = document.getElementById("errorMsg");

// Guard: if the user landed here without registering/logging in first, send them back
const email = localStorage.getItem("email");
if (!email) {
  window.location.href = "login.html";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.style.display = "none";

  const payload = {
    admin_id: 1, // demo admin from seed.sql — replace with real assignment logic later
    full_name: document.getElementById("fullname").value,
    phone: document.getElementById("phone").value,
    username: document.getElementById("username").value,
    password: Math.random().toString(36).slice(-10), // sender table requires a password; not collected on this form
    email: email,
    city: document.getElementById("city").value,
    street: document.getElementById("street").value,
    alley: document.getElementById("alley").value,
    house_number: document.getElementById("house-number").value,
  };

  try {
    const response = await fetch(`${API_BASE}/sender`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      errorMsg.textContent = data.message || "Could not create sender profile";
      errorMsg.style.display = "block";
      return;
    }

    localStorage.setItem("senderId", data.id);

    await fetch(`${API_BASE}/auth/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: localStorage.getItem("userId"),
        role: "sender",
      }),
    });

    window.location.href = "sender-dashboard.html";
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Could not connect to the server. Is the backend running?";
    errorMsg.style.display = "block";
  }
});
