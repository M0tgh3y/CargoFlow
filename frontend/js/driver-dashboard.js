const API_BASE = "http://localhost:3000/api";
const driverId = localStorage.getItem("driverId");   // به جای "userId"

if (!driverId) {
  window.location.href = "login.html";
} else {
fetch(`${API_BASE}/driver/${driverId}`)
    .then((res) => res.json())
    .then((driver) => {
        document.getElementById("welcomeName").textContent = `Hello, ${driver.full_name}`;
        
        // اصلاح این بخش:
        const avgRating = driver.avg_rating ? (parseFloat(driver.avg_rating) / 2).toFixed(1) : "No rating";
        document.getElementById("welcomeName").innerHTML += ` <span style="font-size:0.5em; color:#f1c40f;">★ ${avgRating}</span>`;

        document.getElementById("userCity").textContent = driver.city || "";
    })


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
                container.innerHTML = requests.map(r => {
                const ratingHtml = r.status === 'delivered' 
                    ? (r.driver_rating 
                        ? `<div class="rating-status">Rated: <span class="stars-display">★ ${r.driver_rating/2}</span></div>` 
                        : `<button class="btn-rate" id="rateBtn-${r.request_id}" onclick="event.stopPropagation(); openRatingModal(${r.request_id}, ${r.sender_id}, ${r.driver_id}, 'driver')">Rate Sender</button>`)
                    : '';


          // 2. The Card HTML
          return `
            <div class="request-item" data-id="${r.request_id}" data-status="${r.status}" style="${r.status === 'accepted' || r.status === 'on_route' ? 'cursor:pointer;' : ''}">
                <div class="request-item-header">
                  <span class="request-id">Request #${r.request_id}</span>
                  <span class="request-status status-${r.status}">${r.status}</span>
                </div>
                <p>Sender: ${r.sender_name}</p>
                <p>To: ${r.receiver_name} (${r.receiver_phone})</p>
                ${r.status === 'accepted' ? '<p><em>Tap to mark as loaded →</em></p>' : ''}
                ${r.status === 'on_route' ? '<p><em>Tap to enter delivery code →</em></p>' : ''}
                <div class="card-actions">${ratingHtml}</div>
            </div>
          `;
        }).join("");


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
          // Inside the mark as delivered success block
          alert("Delivered successfully!");
          openRatingModal(requestId, data.sender_id, driverId, 'driver'); // You may need to ensure sender_id is in the response

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

function openRatingModal(requestId, senderId, driverId, role) {
    const modal = document.createElement('div');
    modal.className = 'modal'; // Reusing your existing modal class
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.zIndex = '2000';
    modal.style.background = 'rgba(0,0,0,0.6)';
    modal.style.top = '0'; modal.style.left = '0'; modal.style.width = '100%'; modal.style.height = '100%';
    modal.style.justifyContent = 'center'; modal.style.alignItems = 'center';

    modal.innerHTML = `
        <div style="background:white; padding:30px; border-radius:15px; text-align:center; width:300px;">
            <h3>Rate your experience</h3>
            <div id="starContainer" style="font-size:30px; cursor:pointer; margin:20px 0; color:#ddd;">
                <span data-v="1">★</span><span data-v="2">★</span><span data-v="3">★</span><span data-v="4">★</span><span data-v="5">★</span>
            </div>
            <button id="submitRate" class="btn-primary" style="width:100%">Submit Rating</button>
        </div>
    `;
    document.body.appendChild(modal);

    let selectedScore = 0;
    const stars = modal.querySelectorAll('#starContainer span');
    stars.forEach(s => {
        s.onclick = () => {
            selectedScore = s.dataset.v;
            stars.forEach(star => star.style.color = star.dataset.v <= selectedScore ? '#f1c40f' : '#ddd');
        };
    });

    modal.querySelector('#submitRate').onclick = () => {
        if(selectedScore === 0) return alert("Please select stars");
        
        fetch(`${API_BASE}/rating`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sender_id: senderId,
                driver_id: driverId,
                request_id: requestId,
                score: selectedScore * 2, // Backend expects 1-10, we show 1-5
                rated_by: role,
                rated_user: role === 'sender' ? 'driver' : 'sender'
            })
        }).then(() => {
            modal.remove();
            alert("Thank you for your rating!");
            window.location.reload();
        });
    };
}
