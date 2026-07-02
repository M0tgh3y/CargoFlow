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

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("driverId");
  window.location.href = "login.html";
});