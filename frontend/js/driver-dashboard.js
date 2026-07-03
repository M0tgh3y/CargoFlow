const API_BASE = "http://localhost:3000/api";
const driverId = localStorage.getItem("driverId");   // به جای "userId"

if (!driverId) {
  window.location.href = "login.html";
} else {
  fetch(`${API_BASE}/driver/${driverId}`)
    .then((res) => res.json())
    .then((driver) => {
      document.getElementById("welcomeName").textContent = `Hello, ${driver.full_name}`;
      document.getElementById("userCity").textContent = driver.city || "";
    })
    .catch((err) => console.error("Could not load driver info:", err));

  fetch(`${API_BASE}/vehicle/driver/${driverId}`)
  .then((res) => {
    if (!res.ok) return null;
    return res.json();
  })
  .then((vehicle) => {
      if (!vehicle) return;

      const card = document.getElementById("vehicleCard");
      card.classList.add("filled");
      card.innerHTML = `
        <div class="vehicle-card-header">
          <h3>${vehicle.plate_number}</h3>
          <span class="vehicle-type-badge">${vehicle.vehicle_type}</span>
        </div>
        <div class="vehicle-detail-grid">
          <div class="vehicle-detail">
            <span class="vehicle-detail-label">Dimensions</span>
            <span class="vehicle-detail-value">${vehicle.cargo_dimensions || "-"}</span>
          </div>
          <div class="vehicle-detail">
            <span class="vehicle-detail-label">Refrigerator</span>
            <span class="vehicle-detail-value ${vehicle.refrigerator ? "yes" : ""}">${vehicle.refrigerator ? "Yes" : "No"}</span>
          </div>
          <div class="vehicle-detail">
            <span class="vehicle-detail-label">Depreciation</span>
            <span class="vehicle-detail-value">${vehicle.depreciation ?? "-"}%</span>
          </div>
        </div>
      `;
    })
  .catch((err) => console.error("Could not load vehicle info:", err));

  fetch(`${API_BASE}/request/driver/${driverId}`)
    .then(res => res.json())
    .then(requests => {
        const container = document.getElementById("requestsContainer");

        container.innerHTML = requests.map(r => `
          <div class="request-item">
              <h3>Request #${r.request_id}</h3>
              <p>${r.sender_name}</p>
              <p>${r.status}</p>
          </div>
        `).join("");
    });
}