const API_BASE = "http://localhost:3000/api";
const senderId = localStorage.getItem("senderId");

if (!senderId) {
  window.location.href = "login.html";
}

const editableFields = [
  "fullName", "phone", "email", "username",
  "city", "street", "alley", "houseNumber",
];

const fieldEls = {};
editableFields.forEach((id) => (fieldEls[id] = document.getElementById(id)));

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const msg = document.getElementById("profileMsg");
const logoutBtn = document.getElementById("logoutBtn");

let originalSender = null; // full record as returned by the API (kept for safe PUT + cancel)

function showMessage(text, type) {
  msg.textContent = text;
  msg.className = type; // "success" or "error"
}

function fillForm(sender) {
  fieldEls.fullName.value = sender.full_name || "";
  fieldEls.phone.value = sender.phone || "";
  fieldEls.email.value = sender.email || "";
  fieldEls.username.value = sender.username || "";
  fieldEls.city.value = sender.city || "";
  fieldEls.street.value = sender.street || "";
  fieldEls.alley.value = sender.alley || "";
  fieldEls.houseNumber.value = sender.house_number || "";

  document.getElementById("profileName").textContent = sender.full_name || "Sender";
  document.getElementById("profileEmail").textContent = sender.email || "";
  document.getElementById("avatarInitial").textContent = (sender.full_name || "S")
    .trim()
    .charAt(0)
    .toUpperCase();
}

function setEditing(isEditing) {
  editableFields.forEach((id) => {
    fieldEls[id].readOnly = !isEditing;
  });

  editBtn.style.display = isEditing ? "none" : "inline-block";
  saveBtn.style.display = isEditing ? "inline-block" : "none";
  cancelBtn.style.display = isEditing ? "inline-block" : "none";
}

// Load sender data
fetch(`${API_BASE}/sender/${senderId}`)
  .then((res) => {
    if (!res.ok) throw new Error("Could not load profile");
    return res.json();
  })
  .then((sender) => {
    originalSender = sender;
    fillForm(sender);
  })
  .catch((err) => {
    console.error(err);
    showMessage("Could not load your profile.", "error");
  });

editBtn.addEventListener("click", () => setEditing(true));

cancelBtn.addEventListener("click", () => {
  fillForm(originalSender);
  setEditing(false);
  msg.className = "";
});

saveBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  msg.className = "";

  // Merge: start from the original full record, override only the edited fields.
  const payload = {
    admin_id: originalSender.admin_id,
    full_name: fieldEls.fullName.value,
    phone: fieldEls.phone.value,
    username: fieldEls.username.value,
    password: originalSender.password,
    email: fieldEls.email.value,
    city: fieldEls.city.value,
    street: fieldEls.street.value,
    alley: fieldEls.alley.value,
    house_number: fieldEls.houseNumber.value,
  };

  try {
    const res = await fetch(`${API_BASE}/sender/${senderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Could not save changes");
    }

    // Refresh the local copy of the record so Cancel/next edit works off fresh data
    const refreshed = await fetch(`${API_BASE}/sender/${senderId}`).then((r) => r.json());
    originalSender = refreshed;
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
  localStorage.removeItem("senderId");
  window.location.href = "login.html";
});