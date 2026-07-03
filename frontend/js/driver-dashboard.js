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

        const activeCount = requests.filter(r => r.status === "accepted" || r.status === "on_route").length;
        const completedCount = requests.filter(r => r.status === "delivered").length;
        document.getElementById("activeCount").textContent = activeCount;
        document.getElementById("completedCount").textContent = completedCount;

        if (!requests || requests.length === 0) {
          container.classList.add("empty-card");
          container.innerHTML = `<p>No trips yet</p>`;
          return;
        }

        container.classList.remove("empty-card");
        container.innerHTML = requests.map(r => `
          <div class="request-item" data-id="${r.request_id}" data-status="${r.status}" style="${r.status === 'accepted' || r.status === 'on_route' ? 'cursor:pointer;' : ''}">
              <div class="request-item-header">
                <span class="request-id">Request #${r.request_id}</span>
                <span class="request-status status-${r.status}">${r.status}</span>
              </div>
              <p>Sender: ${r.sender_name}</p>
              <p>To: ${r.receiver_name} (${r.receiver_phone})</p>
              ${r.status === 'accepted' ? '<p><em>Tap to mark as loaded →</em></p>' : ''}
              ${r.status === 'on_route' ? '<p><em>Tap to enter delivery code →</em></p>' : ''}
          </div>
        `).join("");

        container.querySelectorAll(".request-item").forEach(item => {
          const status = item.dataset.status;
          if (status === "accepted" || status === "on_route") {
            item.addEventListener("click", () => openActionModal(item.dataset.id, status));
          }
        });
    })
    .catch(err => console.error("Could not load trips:", err));
}

function openActionModal(requestId, status) {
  const modal = document.getElementById("actionModal");
  const title = document.getElementById("modalTitle");
  const text = document.getElementById("modalText");
  const codeInput = document.getElementById("deliveryCodeInput");
  const errorEl = document.getElementById("modalError");
  const confirmBtn = document.getElementById("modalConfirmBtn");
  const cancelBtn = document.getElementById("modalCancelBtn");

  errorEl.style.display = "none";
  codeInput.value = "";

  if (status === "accepted") {
    title.textContent = `Request #${requestId}`;
    text.textContent = "Have you loaded this cargo?";
    codeInput.style.display = "none";
    confirmBtn.textContent = "I've loaded it";
    confirmBtn.onclick = () => {
      fetch(`${API_BASE}/request/${requestId}/start`, { method: "PUT" })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) {
            errorEl.textContent = data.message || "Could not update trip";
            errorEl.style.display = "block";
            return;
          }
          window.location.reload();
        })
        .catch(err => {
          console.error(err);
          errorEl.textContent = "Could not connect to the server.";
          errorEl.style.display = "block";
        });
    };
  } else if (status === "on_route") {
    title.textContent = `Request #${requestId}`;
    text.textContent = "Enter the delivery code the receiver gives you to complete this trip.";
    codeInput.style.display = "block";
    confirmBtn.textContent = "Mark as Delivered";
    confirmBtn.onclick = () => {
      const code = codeInput.value.trim();
      if (!code) {
        errorEl.textContent = "Please enter the delivery code.";
        errorEl.style.display = "block";
        return;
      }
      fetch(`${API_BASE}/request/${requestId}/deliver`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delivery_code: code }),
      })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) {
            errorEl.textContent = data.message || "Incorrect delivery code";
            errorEl.style.display = "block";
            return;
          }
          alert("Delivered successfully!");
          window.location.reload();
        })
        .catch(err => {
          console.error(err);
          errorEl.textContent = "Could not connect to the server.";
          errorEl.style.display = "block";
        });
    };
  }

  cancelBtn.onclick = () => { modal.style.display = "none"; };
  modal.style.display = "flex";
}