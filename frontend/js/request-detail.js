const API_BASE = "http://localhost:3000/api";
const params = new URLSearchParams(window.location.search);
const requestId = params.get("id");

const STAGES = ["pending", "accepted", "on_route", "delivered"];
const STAGE_LABELS = {
  pending: "Pending",
  accepted: "Loading",
  on_route: "On Route",
  delivered: "Delivered",
};

if (!requestId) {
  window.location.href = "sender-dashboard.html";
} else {
  loadDetail();
}

function loadDetail() {
  fetch(`${API_BASE}/request/${requestId}/detail`)
    .then((res) => {
      if (!res.ok) throw new Error("Request not found");
      return res.json();
    })
    .then(renderDetail)
    .catch((err) => {
      console.error("Could not load request detail:", err);
      document.getElementById("detailContainer").innerHTML = `<p>Could not load this request.</p>`;
    });
}

function renderDetail(r) {
  document.getElementById("pageTitle").textContent = `Request #${r.request_id}`;

  const currentIndex = STAGES.indexOf(r.status);
  const stepsHtml = STAGES.map((stage, i) => {
    const state = i < currentIndex ? "done" : i === currentIndex ? "active" : "";
    return `
      <div class="trip-step ${state}">
        <span class="trip-step-dot"></span>
        <span class="trip-step-label">${STAGE_LABELS[stage]}</span>
      </div>
    `;
  }).join("");

  const driverSection = r.driver_id
    ? `
      <div class="detail-section">
        <h3>Driver</h3>
        <p>${r.driver_name} · ${r.driver_phone || "-"}</p>
        <p>Current location: ${formatPoint(r.driver_location)}</p>
      </div>
    `
    : `
      <div class="detail-section">
        <h3>Driver</h3>
        <p>No driver has accepted this request yet.</p>
      </div>
    `;

  document.getElementById("detailContainer").innerHTML = `
    <div class="request-item-header">
      <span class="request-status status-${r.status}">${r.status}</span>
    </div>

    <div class="trip-progress">${stepsHtml}</div>

    ${driverSection}

    <div class="detail-section">
      <h3>Cargo</h3>
      <p>${r.cargo_type} · ${r.weight ?? "-"} kg · status: ${r.cargo_status || "-"}</p>
      <p>Refrigerator required: ${r.refrigerator_required ? "Yes" : "No"}</p>
    </div>

    <div class="detail-section">
      <h3>Trip</h3>
      <p>From: ${formatPoint(r.origin)}</p>
      <p>To: ${formatPoint(r.destination)}</p>
      <p>Distance: ${r.distance_km ?? "-"} km · Estimated time: ${r.estimated_time ?? "-"} min</p>
      <p>Loading: ${r.loading_datetime ?? "-"}</p>
      <p>Delivery: ${r.delivery_datetime ?? "-"}</p>
    </div>

    <div class="detail-section">
      <h3>Receiver</h3>
      <p>${r.receiver_name} · ${r.receiver_phone}</p>
    </div>

    <div class="detail-section">
      <h3>Price</h3>
      <p>$${r.price ?? "-"}</p>
    </div>
  `;
}

function formatPoint(text) {
  if (!text) return "-";
  const match = text.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
  if (!match) return text;
  return `${match[2]}, ${match[1]}`;
}