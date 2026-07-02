const API_BASE = "http://localhost:3000/api";
const driverId = localStorage.getItem("driverId");  

if (!driverId) {
  window.location.href = "login.html";
} else {
  loadAvailableRequests();
}

function loadAvailableRequests() {
  fetch(`${API_BASE}/request/available`)
    .then((res) => res.json())
    .then((requests) => {
      const container = document.getElementById("requestsContainer");

      if (!requests || requests.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <p>No matching requests available</p>
          </div>
        `;
        return;
      }

      container.innerHTML = requests
        .map(
          (r) => `
            <div class="request-item">
              <div class="request-item-header">
                <p>Sender: ${r.sender_name} (${r.sender_phone || "-"}) · ${r.sender_city || "-"}</p>
                <span class="request-id">Request #${r.request_id}</span>
                <span class="request-status status-${r.status}">${r.status}</span>
              </div>
              <p>Cargo: ${r.cargo_type} · ${r.weight ?? "-"} kg</p>
              <p>To: ${r.receiver_name} (${r.receiver_phone})</p>
              <p>Distance: ${r.distance_km ?? "-"} km · Price: $${r.price ?? "-"}</p>
              <button class="accept-btn" data-id="${r.request_id}">Accept</button>
            </div>
          `
        )
        .join("");

      container.querySelectorAll(".accept-btn").forEach((btn) => {
        btn.addEventListener("click", () => acceptRequest(btn.dataset.id));
      });
    })
    .catch((err) => console.error("Could not load available requests:", err));
}

function acceptRequest(requestId) {
  fetch(`${API_BASE}/request/${requestId}/accept`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ driver_id: driverId }),
  })
    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) {
        alert(data.message || "Could not accept request");
        return;
      }
      window.location.href = "driver-dashboard.html";
    })
    .catch((err) => console.error("Could not accept request:", err));
}