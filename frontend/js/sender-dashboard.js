const API_BASE = "http://localhost:3000/api";
const senderId = localStorage.getItem("senderId");

if (!senderId) {
  window.location.href = "login.html";
} else {
  fetch(`${API_BASE}/sender/${senderId}`)
    .then((res) => res.json())
    .then((sender) => {
        document.getElementById("welcomeName").textContent = `Hello, ${sender.full_name}`;
        
        // اصلاح این بخش:
        const avgRating = sender.avg_rating ? (parseFloat(sender.avg_rating) / 2).toFixed(1) : "No rating";
        document.getElementById("welcomeName").innerHTML += ` <span style="font-size:0.5em; color:#f1c40f;">★ ${avgRating}</span>`;

        document.getElementById("userCity").textContent = sender.city || "";
    })

  fetch(`${API_BASE}/request/sender/${senderId}`)
    .then((res) => res.json())
    .then((requests) => {
      if (!requests || requests.length === 0) return;
      const activeCount = requests.filter(r => ['accepted', 'on_route', 'pending'].includes(r.status)).length;
      const deliveredCount = requests.filter(r => r.status === 'delivered').length;
      document.getElementById('activeCount').textContent = activeCount;
      document.getElementById('deliveredCount').textContent = deliveredCount;


      const container = document.getElementById("requestsContainer");
      container.classList.remove("empty-card");
        container.innerHTML = requests
        .map((r) => {
          // 1. Logic to check if already rated
            const ratingHtml = r.status === 'delivered' 
                ? (r.sender_rating 
                    ? `<div class="rating-status">Rated: <span class="stars-display">★ ${r.sender_rating/2}</span></div>` 
                    : `<button class="btn-rate" id="rateBtn-${r.request_id}" onclick="event.stopPropagation(); openRatingModal(${r.request_id}, ${r.sender_id}, ${r.driver_id}, 'sender')">Rate Driver</button>`)
                : '';


          // 2. The Card HTML
          return `
            <div class="request-item" data-id="${r.request_id}" style="cursor:pointer;">
              <div class="request-item-header">
                <span class="request-id">Request #${r.request_id}</span>
                <span class="request-status status-${r.status}">${r.status}</span>
              </div>
              <p>To: ${r.receiver_name} (${r.receiver_phone})</p>
              <p>Distance: ${r.distance_km ?? "-"} km · Price: $${r.price ?? "-"}</p>
              <div class="card-actions">${ratingHtml}</div>
            </div>
          `;
        })
        .join("");


      container.querySelectorAll(".request-item").forEach((item) => {
        item.addEventListener("click", () => {
          window.location.href = `request-detail.html?id=${item.dataset.id}`;
        });
      });
    })
    .catch((err) => console.error("Could not load requests:", err));
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
