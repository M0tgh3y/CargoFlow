const API_BASE = "http://localhost:3000/api";

const form = document.getElementById("driverSetupForm");
const errorMsg = document.getElementById("errorMsg");

const accountEmail = localStorage.getItem("email");
if (!accountEmail) {
  window.location.href = "login.html";
}

const companyMap = {
  "": null,
  company1: 1,
  company2: 2,
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.style.display = "none";

  const payload = {
    admin_id: 1, // demo admin from seed.sql — replace with real assignment logic later
    company_id: companyMap[document.getElementById("company").value] ?? null,
    full_name: document.getElementById("fullname").value,
    phone: document.getElementById("phone").value,
    username: document.getElementById("username").value,
    password: Math.random().toString(36).slice(-10), // driver table requires a password; not collected on this form
    email: accountEmail,
    city: document.getElementById("city").value,
    street: document.getElementById("street").value,
    alley: document.getElementById("alley").value,
    house_number: document.getElementById("house-number").value,
    birth_date: document.getElementById("birthdate").value || null,
    work_experience: document.getElementById("experience").value || 0,
    license_number: document.getElementById("license").value || null,
    disease: document.getElementById("disease").value,
    gender: document.getElementById("gender").value,
    longitude: 0,
    latitude: 0,
    status: "available",
  };

  try {
    const response = await fetch(`${API_BASE}/driver`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      errorMsg.textContent = data.message || "Could not create driver profile";
      errorMsg.style.display = "block";
      return;
    }

    localStorage.setItem("driverId", data.id);

    await fetch(`${API_BASE}/auth/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: localStorage.getItem("userId"),
        role: "driver",
      }),
    });

    window.location.href = "driver-dashboard.html";
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Could not connect to the server. Is the backend running?";
    errorMsg.style.display = "block";
  }
});
