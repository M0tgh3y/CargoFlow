const API_BASE = "http://localhost:3000/api";
const form = document.getElementById("step2Form");
const errorMsg = document.getElementById("errorMsg");
const calcPriceBtn = document.getElementById("calcPriceBtn");
const deliveryDatetimeInput = document.getElementById("deliveryDatetime");

const senderId = localStorage.getItem("senderId");
const cargoId = localStorage.getItem("cargoId");

if (!senderId || !cargoId) window.location.href = "new-request-step1.html";

function buildPayload() {
  return {
    sender_id: senderId,
    driver_id: null,
    rule_id: 1,
    cargo_id: cargoId,
    origin_latitude: document.getElementById("originLat").value,
    origin_longitude: document.getElementById("originLng").value,
    destination_latitude: document.getElementById("destLat").value,
    destination_longitude: document.getElementById("destLng").value,
    loading_datetime: document.getElementById("loadingDatetime").value,
    receiver_name: document.getElementById("receiverName").value,
    receiver_phone: document.getElementById("receiverPhone").value,
  };
}

calcPriceBtn.addEventListener("click", async () => {
  errorMsg.style.display = "none";
  const payload = buildPayload();

  if (!payload.origin_latitude || !payload.origin_longitude ||
      !payload.destination_latitude || !payload.destination_longitude ||
      !payload.loading_datetime) {
    errorMsg.textContent = "Please fill in origin, destination and loading time first.";
    errorMsg.style.display = "block";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/request/preview-price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      errorMsg.textContent = data.message || "Could not calculate price";
      errorMsg.style.display = "block";
      return;
    }
    document.getElementById("estimatedPrice").textContent = `$${data.price}`;
    if (!deliveryDatetimeInput.value) {
      deliveryDatetimeInput.value = new Date(data.delivery_datetime).toISOString().slice(0, 16);
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Could not connect to the server. Is the backend running?";
    errorMsg.style.display = "block";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.style.display = "none";

  const payload = {
    ...buildPayload(),
    delivery_datetime: deliveryDatetimeInput.value || null,
  };

  try {
    const response = await fetch(`${API_BASE}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      errorMsg.textContent = data.message || "Could not submit the request";
      errorMsg.style.display = "block";
      return;
    }
    document.getElementById("estimatedPrice").textContent = `$${data.price}`;

    localStorage.removeItem("cargoId");

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Request Submitted ✓";

    const backBtn = form.querySelector('button[type="button"]');
    backBtn.textContent = "Go to Dashboard";
    backBtn.onclick = () => (window.location.href = "sender-dashboard.html");
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Could not connect to the server. Is the backend running?";
    errorMsg.style.display = "block";
  }
});