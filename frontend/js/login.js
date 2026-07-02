const API_BASE = "http://localhost:3000/api";

const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.style.display = "none";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      errorMsg.textContent = data.message || "Login failed";
      errorMsg.style.display = "block";
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("role", data.role || "");
    localStorage.setItem("email", email);

    if (data.role === "sender") {
      const senderRes = await fetch(`${API_BASE}/sender/by-email/${encodeURIComponent(email)}`);
      if (senderRes.ok) {
        const sender = await senderRes.json();
        localStorage.setItem("senderId", sender.sender_id);
      }
      window.location.href = "sender-dashboard.html";
    } else if (data.role === "driver") {
      const driverRes = await fetch(`${API_BASE}/driver/by-email/${encodeURIComponent(email)}`);
      if (driverRes.ok) {
        const driver = await driverRes.json();
        localStorage.setItem("driverId", driver.driver_id);
      }
      window.location.href = "driver-dashboard.html";
    } else {
      window.location.href = "choose-your-role.html";
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Could not connect to the server. Is the backend running?";
    errorMsg.style.display = "block";
  }
});
