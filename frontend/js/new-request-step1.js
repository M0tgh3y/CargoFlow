const API_BASE = "http://localhost:3000/api";
const form = document.getElementById("step1Form");
const errorMsg = document.getElementById("errorMsg");

const senderId = localStorage.getItem("senderId");
if (!senderId) window.location.href = "login.html";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.style.display = "none";

  const payload = {
    sender_id: senderId,
    weight: document.getElementById("weight").value,
    cargo_type: document.getElementById("cargoType").value,
    refrigerator_required: document.getElementById("refrigeratorRequired").checked,
    status: "waiting",
  };

  try {
    const response = await fetch(`${API_BASE}/cargo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      errorMsg.textContent = data.message || "Could not save cargo details";
      errorMsg.style.display = "block";
      return;
    }
    localStorage.setItem("cargoId", data.id);
    window.location.href = "new-request-step2.html";
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Could not connect to the server. Is the backend running?";
    errorMsg.style.display = "block";
  }
});