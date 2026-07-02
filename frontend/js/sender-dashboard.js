const API_BASE = "http://localhost:3000/api";
const senderId = localStorage.getItem("senderId");

if (!senderId) {
  window.location.href = "login.html";
} else {
  fetch(`${API_BASE}/sender/${senderId}`)
    .then((res) => res.json())
    .then((sender) => {
      document.getElementById("welcomeName").textContent = `Hello, ${sender.full_name}`;
      document.getElementById("userCity").textContent = sender.city || "";
    })
    .catch((err) => console.error("Could not load sender info:", err));

  fetch(`${API_BASE}/request/sender/${senderId}`)
    .then((res) => res.json())
    .then((requests) => {
      if (!requests || requests.length === 0) return;

      const container = document.getElementById("requestsContainer");
      container.classList.remove("empty-card");
      container.innerHTML = requests
        .map(
          (r) => `
            <div class="request-item" data-id="${r.request_id}" style="cursor:pointer;">
              <div class="request-item-header">
                <span class="request-id">Request #${r.request_id}</span>
                <span class="request-status status-${r.status}">${r.status}</span>
              </div>
              <p>To: ${r.receiver_name} (${r.receiver_phone})</p>
              <p>Distance: ${r.distance_km ?? "-"} km · Price: $${r.price ?? "-"}</p>
            </div>
          `
        )
        .join("");

      container.querySelectorAll(".request-item").forEach((item) => {
        item.addEventListener("click", () => {
          window.location.href = `request-detail.html?id=${item.dataset.id}`;
        });
      });
    })
    .catch((err) => console.error("Could not load requests:", err));
}