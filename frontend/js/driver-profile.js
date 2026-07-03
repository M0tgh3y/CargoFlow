const API_BASE = "http://localhost:3000/api";
const driverId = localStorage.getItem("driverId");

if (!driverId) {
  window.location.href = "login.html";
}

// Fields the user is allowed to edit from this page.
// Everything else (admin_id, company_id, status, password, location...)
// is kept as-is and sent back unchanged so we don't wipe it out.
const editableFields = [
  "fullName", "phone", "email", "username",
  "gender", "city", "street", "alley", "houseNumber",
  "birthDate", "workExperience", "licenseNumber", "disease",
];

const fieldEls = {};
editableFields.forEach((id) => (fieldEls[id] = document.getElementById(id)));

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const msg = document.getElementById("profileMsg");
const logoutBtn = document.getElementById("logoutBtn");

let originalDriver = null; // full record as returned by the API (kept for safe PUT + cancel)

function showMessage(text, type) {
  msg.textContent = text;
  msg.className = type; // "success" or "error"
}

function fillForm(driver) {
  fieldEls.fullName.value = driver.full_name || "";
  fieldEls.phone.value = driver.phone || "";
  fieldEls.email.value = driver.email || "";
  fieldEls.username.value = driver.username || "";
  fieldEls.gender.value = driver.gender || "male";
  fieldEls.city.value = driver.city || "";
  fieldEls.street.value = driver.street || "";
  fieldEls.alley.value = driver.alley || "";
  fieldEls.houseNumber.value = driver.house_number || "";
  fieldEls.birthDate.value = driver.birth_date
    ? driver.birth_date.split("T")[0]
    : "";
  fieldEls.workExperience.value = driver.work_experience ?? "";
  fieldEls.licenseNumber.value = driver.license_number || "";
  fieldEls.disease.value = driver.disease || "";

  document.getElementById("profileName").textContent = driver.full_name || "Driver";
  document.getElementById("profileEmail").textContent = driver.email || "";
  document.getElementById("avatarInitial").textContent = (driver.full_name || "D")
    .trim()
    .charAt(0)
    .toUpperCase();
}

function setEditing(isEditing) {
  editableFields.forEach((id) => {
    const el = fieldEls[id];
    if (el.tagName === "SELECT") {
      el.disabled = !isEditing;
    } else {
      el.readOnly = !isEditing;
    }
  });

  editBtn.style.display = isEditing ? "none" : "inline-block";
  saveBtn.style.display = isEditing ? "inline-block" : "none";
  cancelBtn.style.display = isEditing ? "inline-block" : "none";
}

// Parses the "POINT(lon lat)" text MySQL/GIS returns so we can send the
// driver's existing location back unchanged on save.
function parseLocation(locationText) {
  if (!locationText) return { longitude: 0, latitude: 0 };
  const match = /POINT\(([-\d.]+)\s+([-\d.]+)\)/.exec(locationText);
  if (!match) return { longitude: 0, latitude: 0 };
  return { longitude: parseFloat(match[1]), latitude: parseFloat(match[2]) };
}

// Load driver data
fetch(`${API_BASE}/driver/${driverId}`)
  .then((res) => {
    if (!res.ok) throw new Error("Could not load profile");
    return res.json();
  })
  .then((driver) => {
    originalDriver = driver;
    fillForm(driver);
  })
  .catch((err) => {
    console.error(err);
    showMessage("Could not load your profile.", "error");
  });

editBtn.addEventListener("click", () => setEditing(true));

cancelBtn.addEventListener("click", () => {
  fillForm(originalDriver);
  setEditing(false);
  msg.className = "";
});

saveBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  msg.className = "";

  const { longitude, latitude } = parseLocation(originalDriver.location_text);

  // Merge: start from the original full record, override only the edited fields.
  const payload = {
    admin_id: originalDriver.admin_id,
    company_id: originalDriver.company_id,
    full_name: fieldEls.fullName.value,
    phone: fieldEls.phone.value,
    username: fieldEls.username.value,
    password: originalDriver.password,
    email: fieldEls.email.value,
    city: fieldEls.city.value,
    street: fieldEls.street.value,
    alley: fieldEls.alley.value,
    house_number: fieldEls.houseNumber.value,
    birth_date: fieldEls.birthDate.value || null,
    work_experience: fieldEls.workExperience.value || 0,
    license_number: fieldEls.licenseNumber.value || null,
    disease: fieldEls.disease.value,
    gender: fieldEls.gender.value,
    longitude,
    latitude,
    status: originalDriver.status,
  };

  try {
    const res = await fetch(`${API_BASE}/driver/${driverId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Could not save changes");
    }

    // Refresh the local copy of the record so Cancel/next edit works off fresh data
    const refreshed = await fetch(`${API_BASE}/driver/${driverId}`).then((r) => r.json());
    originalDriver = refreshed;
    fillForm(refreshed);
    setEditing(false);
    showMessage("Profile updated successfully.", "success");
  } catch (err) {
    console.error(err);
    showMessage(err.message || "Could not save changes.", "error");
  }
});

// ---------------------------------------------------------------
// Vehicle section
// ---------------------------------------------------------------

const vehicleEditableFields = [
  "vehicleType", "plateNumber", "vehicleLength", "vehicleWidth",
  "vehicleHeight", "vehicleDepreciation",
];

const vehicleFieldEls = {};
vehicleEditableFields.forEach((id) => (vehicleFieldEls[id] = document.getElementById(id)));
const refrigeratorEl = document.getElementById("vehicleRefrigerator");

const editVehicleBtn = document.getElementById("editVehicleBtn");
const saveVehicleBtn = document.getElementById("saveVehicleBtn");
const cancelVehicleBtn = document.getElementById("cancelVehicleBtn");
const vehicleMsg = document.getElementById("vehicleMsg");
const vehicleForm = document.getElementById("vehicleForm");
const noVehicleMsg = document.getElementById("noVehicleMsg");

let originalVehicle = null; // full vehicle record as returned by the API

function showVehicleMessage(text, type) {
  vehicleMsg.textContent = text;
  vehicleMsg.className = type; // "success" or "error"
}

// cargo_dimensions is stored as "LxWxH", e.g. "5x2x2.5"
function parseDimensions(dimensions) {
  if (!dimensions) return { length: "", width: "", height: "" };
  const [length, width, height] = dimensions.split("x");
  return { length: length || "", width: width || "", height: height || "" };
}

function fillVehicleForm(vehicle) {
  const { length, width, height } = parseDimensions(vehicle.cargo_dimensions);
  vehicleFieldEls.vehicleType.value = vehicle.vehicle_type || "truck";
  vehicleFieldEls.plateNumber.value = vehicle.plate_number || "";
  vehicleFieldEls.vehicleLength.value = length;
  vehicleFieldEls.vehicleWidth.value = width;
  vehicleFieldEls.vehicleHeight.value = height;
  vehicleFieldEls.vehicleDepreciation.value = vehicle.depreciation ?? "";
  refrigeratorEl.checked = !!vehicle.refrigerator;
}

function setVehicleEditing(isEditing) {
  vehicleEditableFields.forEach((id) => {
    const el = vehicleFieldEls[id];
    if (el.tagName === "SELECT") {
      el.disabled = !isEditing;
    } else {
      el.readOnly = !isEditing;
    }
  });
  refrigeratorEl.disabled = !isEditing;

  editVehicleBtn.style.display = isEditing ? "none" : "inline-block";
  saveVehicleBtn.style.display = isEditing ? "inline-block" : "none";
  cancelVehicleBtn.style.display = isEditing ? "inline-block" : "none";
}

// Load vehicle data
fetch(`${API_BASE}/vehicle/driver/${driverId}`)
  .then((res) => {
    if (!res.ok) return null; // driver has no vehicle yet
    return res.json();
  })
  .then((vehicle) => {
    if (!vehicle) {
      vehicleForm.style.display = "none";
      editVehicleBtn.style.display = "none";
      noVehicleMsg.style.display = "flex";
      return;
    }
    originalVehicle = vehicle;
    fillVehicleForm(vehicle);
  })
  .catch((err) => {
    console.error(err);
    showVehicleMessage("Could not load your vehicle.", "error");
  });

editVehicleBtn.addEventListener("click", () => setVehicleEditing(true));

cancelVehicleBtn.addEventListener("click", () => {
  fillVehicleForm(originalVehicle);
  setVehicleEditing(false);
  vehicleMsg.className = "";
});

saveVehicleBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  vehicleMsg.className = "";

  const length = vehicleFieldEls.vehicleLength.value || 0;
  const width = vehicleFieldEls.vehicleWidth.value || 0;
  const height = vehicleFieldEls.vehicleHeight.value || 0;

  const payload = {
    driver_id: driverId,
    cargo_dimensions: `${length}x${width}x${height}`,
    vehicle_type: vehicleFieldEls.vehicleType.value,
    refrigerator: refrigeratorEl.checked,
    depreciation: vehicleFieldEls.vehicleDepreciation.value || 0,
    plate_number: vehicleFieldEls.plateNumber.value,
  };

  try {
    const res = await fetch(`${API_BASE}/vehicle/${originalVehicle.vehicle_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Could not save vehicle changes");
    }

    const refreshed = await fetch(`${API_BASE}/vehicle/driver/${driverId}`).then((r) => r.json());
    originalVehicle = refreshed;
    fillVehicleForm(refreshed);
    setVehicleEditing(false);
    showVehicleMessage("Vehicle updated successfully.", "success");
  } catch (err) {
    console.error(err);
    showVehicleMessage(err.message || "Could not save vehicle changes.", "error");
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("driverId");
  window.location.href = "login.html";
});