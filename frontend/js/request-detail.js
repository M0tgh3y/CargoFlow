const API_BASE = "http://localhost:3000/api";
const params = new URLSearchParams(window.location.search);
const requestId = params.get("id");

const modalStyles = `
.modal { display:none; position:fixed; z-index:1000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.5); overflow-y:auto; }
.modal-content { background:#fff; margin:5% auto; padding:30px; border-radius:12px; width:90%; max-width:600px; }
.form-grid { display:grid; grid-template-columns: 1fr 1fr; gap:15px; }
.full-width { grid-column: span 2; }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = modalStyles;
document.head.appendChild(styleSheet);

// Add Star Modal CSS
const style = document.createElement('style');
style.innerHTML = `
    .star-rating { font-size: 30px; color: #ddd; cursor: pointer; margin: 15px 0; }
    .star-rating span.active { color: #f1c40f; }
`;
document.head.appendChild(style);

function openRatingModal(r, role) {
    const modal = document.createElement('div');
    modal.className = 'modal'; modal.style.display = 'flex'; modal.style.position = 'fixed';
    modal.style.zIndex = '2000'; modal.style.background = 'rgba(0,0,0,0.6)';
    modal.style.top = '0'; modal.style.left = '0'; modal.style.width = '100%'; modal.style.height = '100%';
    modal.style.justifyContent = 'center'; modal.style.alignItems = 'center';

    modal.innerHTML = `
        <div style="background:white; padding:30px; border-radius:15px; text-align:center; width:300px;">
            <h3>Rate ${role === 'sender' ? 'Driver' : 'Sender'}</h3>
            <div class="star-rating" id="starContainer">
                <span data-v="1">★</span><span data-v="2">★</span><span data-v="3">★</span><span data-v="4">★</span><span data-v="5">★</span>
            </div>
            <button id="submitRate" class="btn-primary" style="width:100%">Submit Rating</button>
            <button onclick="this.closest('.modal').remove()" class="btn-outline" style="width:100%; margin-top:10px;">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);

    let score = 0;
    const stars = modal.querySelectorAll('#starContainer span');
    stars.forEach(s => s.onclick = () => {
        score = s.dataset.v;
        stars.forEach(st => st.classList.toggle('active', st.dataset.v <= score));
    });

    modal.querySelector('#submitRate').onclick = () => {
        if(!score) return alert("Select stars!");
        fetch(`${API_BASE}/rating`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sender_id: r.sender_id, driver_id: r.driver_id, request_id: r.request_id,
                score: score * 2, rated_by: role, rated_user: role === 'sender' ? 'driver' : 'sender'
            })
        }).then(() => { modal.remove(); loadDetail(); });
    };
}



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

  const codeHtml = (r.status === "accepted" || r.status === "on_route")
    ? `
      <div class="detail-section">
        <h3>Delivery Code</h3>
        <p>Give this code to the driver once your cargo is delivered: <strong>${r.delivery_code ?? "-"}</strong></p>
      </div>
    `
    : "";

  const actionsHtml = r.status === "pending"
    ? `
      <div class="detail-section2">
        <button id="editBtn" class="btn-outline">Edit Request</button>
        <button id="deleteBtn" class="btn-outline" style="color:#c0392b; border-color:#c0392b;">Delete Request</button>
      </div>
    `
    : "";

  document.getElementById("detailContainer").innerHTML = `
    <div class="request-item-header">
      <span class="request-status status-${r.status}">${r.status}</span>
    </div>

    <div class="trip-progress">${stepsHtml}</div>

    ${driverSection}

    ${codeHtml}

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

    ${actionsHtml}
  `;

  if (r.status === "pending") {
    document.getElementById("editBtn").addEventListener("click", () => openEditForm(r));
    document.getElementById("deleteBtn").addEventListener("click", () => deleteRequest(r.request_id));
  }
}

function openEditForm(r) {
  // Create Modal HTML
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'block';
  
  // Extract lat/lng from POINT strings
  const getCoords = (str) => {
    const m = str.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
    return m ? { lng: m[1], lat: m[2] } : { lng: 0, lat: 0 };
  };
  const origin = getCoords(r.origin);
  const dest = getCoords(r.destination);

  modal.innerHTML = `
    <div class="modal-content">
      <h2 style="margin-bottom:20px">Edit Request #${r.request_id}</h2>
      <form id="editForm" class="form-grid">
        <div class="form-group"><label>Weight (kg)</label><input type="number" id="editWeight" value="${r.weight}" required></div>
        <div class="form-group"><label>Cargo Type</label><select id="editType">
          <option value="food" ${r.cargo_type==='food'?'selected':''}>Food</option>
          <option value="furniture" ${r.cargo_type==='furniture'?'selected':''}>Furniture</option>
          <option value="construction_material" ${r.cargo_type==='construction_material'?'selected':''}>Construction</option>
        </select></div>
        <div class="form-group full-width"><label><input type="checkbox" id="editRef" ${r.refrigerator_required?'checked':''}> Refrigerator Required</label></div>
        
        <div class="form-group"><label>Origin Lat</label><input type="number" step="any" id="editOLat" value="${origin.lat}"></div>
        <div class="form-group"><label>Origin Lng</label><input type="number" step="any" id="editOLng" value="${origin.lng}"></div>
        <div class="form-group"><label>Dest Lat</label><input type="number" step="any" id="editDLat" value="${dest.lat}"></div>
        <div class="form-group"><label>Dest Lng</label><input type="number" step="any" id="editDLng" value="${dest.lng}"></div>
        
        <div class="form-group"><label>Loading Time</label><input type="datetime-local" id="editLoad" value="${r.loading_datetime ? r.loading_datetime.slice(0, 16) : ''}"></div>
        <div class="form-group"><label>Delivery Time</label><input type="datetime-local" id="editDeliv" value="${r.delivery_datetime ? r.delivery_datetime.slice(0, 16) : ''}"></div>
        
        <div class="form-group"><label>Receiver Name</label><input type="text" id="editRName" value="${r.receiver_name}"></div>
        <div class="form-group"><label>Receiver Phone</label><input type="text" id="editRPhone" value="${r.receiver_phone}"></div>
        
        <div class="full-width" style="margin-top:20px; display:flex; gap:10px;">
          <button type="submit" class="btn-primary" style="flex:1">Save Changes</button>
          <button type="button" class="btn-outline" onclick="this.closest('.modal').remove()" style="flex:1">Cancel</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('editForm').onsubmit = (e) => {
    e.preventDefault();
    const payload = {
      weight: parseFloat(document.getElementById('editWeight').value),
      cargo_type: document.getElementById('editType').value,
      refrigerator_required: document.getElementById('editRef').checked ? 1 : 0,
      origin_latitude: parseFloat(document.getElementById('editOLat').value),
      origin_longitude: parseFloat(document.getElementById('editOLng').value),
      destination_latitude: parseFloat(document.getElementById('editDLat').value),
      destination_longitude: parseFloat(document.getElementById('editDLng').value),
      loading_datetime: document.getElementById('editLoad').value,
      delivery_datetime: document.getElementById('editDeliv').value,
      receiver_name: document.getElementById('editRName').value,
      receiver_phone: document.getElementById('editRPhone').value
    };

    fetch(`${API_BASE}/request/${r.request_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    .then(res => res.json())
    .then(data => {
      modal.remove();
      loadDetail();
    })
    .catch(err => alert("Error updating request"));
  };
}


function deleteRequest(requestId) {
  if (!confirm("Are you sure you want to delete this request? This cannot be undone.")) return;

  fetch(`${API_BASE}/request/${requestId}`, { method: "DELETE" })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) {
        alert(data.message || "Could not delete request");
        return;
      }
      window.location.href = "sender-dashboard.html";
    })
    .catch(err => {
      console.error(err);
      alert("Could not connect to the server.");
    });
}

function formatPoint(pointStr) {
  if (!pointStr) return "-";
  const match = pointStr.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
  if (match) {
    const lng = parseFloat(match[1]).toFixed(4);
    const lat = parseFloat(match[2]).toFixed(4);
    return `${lat}, ${lng}`;
  }
  return pointStr;
}
