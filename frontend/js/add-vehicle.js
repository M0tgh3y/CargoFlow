const API_BASE = "http://localhost:3000/api";
const form = document.getElementById("addVehicleForm");
const errorMsg = document.getElementById("errorMsg");

const driverId = localStorage.getItem("driverId");
if (!driverId) window.location.href = "login.html";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.style.display = "none";

  const length = document.getElementById("length").value || 0;
  const width = document.getElementById("width").value || 0;
  const height = document.getElementById("height").value || 0;

  const payload = {
    driver_id: driverId,
    cargo_dimensions: `${length}x${width}x${height}`,
    vehicle_type: document.getElementById("vehicleType").value,
    refrigerator: document.getElementById("refrigerator").checked,
    depreciation: document.getElementById("depreciation").value || 0,
    plate_number: document.getElementById("plateNumber").value,
  };

  try {
    const response = await fetch(`${API_BASE}/vehicle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      errorMsg.textContent = data.message || "Could not add vehicle";
      errorMsg.style.display = "block";
      return;
    }
    window.location.href = "driver-dashboard.html";
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Could not connect to the server. Is the backend running?";
    errorMsg.style.display = "block";
  }
});