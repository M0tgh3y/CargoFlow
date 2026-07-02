require("dotenv").config();

const express = require("express");
const cors = require("cors");

require("./config/db");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Cargo System API Running");
});

const PORT = process.env.PORT || 3000;

const authRoutes = require("./routes/authRoutes");

const adminRoutes = require("./routes/adminRoutes");

const senderRoutes = require("./routes/senderRoutes");

const driverRoutes = require("./routes/driverRoutes");

const vehicleRoutes = require("./routes/vehicleRoutes");

const companyRoutes = require("./routes/companyRoutes");

const companyPhoneRoutes = require("./routes/companyPhoneRoutes");

const cargoRoutes = require("./routes/cargoRoutes");

const ruleRoutes = require("./routes/ruleRoutes");

const requestRoutes = require("./routes/requestRoutes");

const ratingRoutes = require("./routes/ratingRoutes");

app.use("/api/admin", adminRoutes);

app.use("/api/sender", senderRoutes);

app.use("/api/driver", driverRoutes);

app.use("/api/vehicle", vehicleRoutes);

app.use("/api/company", companyRoutes);

app.use("/api/cargo", cargoRoutes);

app.use("/api/company-phone", companyPhoneRoutes);

app.use("/api/rule", ruleRoutes);

app.use("/api/request", requestRoutes);

app.use("/api/rating", ratingRoutes);

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});
