const Vehicle = require("../models/Vehicle");

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.getAll();

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.getById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getVehicleByDriver = async (req, res) => {
  try {
    const vehicle = await Vehicle.getByDriverId(req.params.driverId);
    if (!vehicle) {
      return res.status(404).json({ message: "No vehicle found for this driver" });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const result = await Vehicle.create(req.body);

    res.status(201).json({
      message: "Vehicle created",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    await Vehicle.update(req.params.id, req.body);

    res.json({
      message: "Vehicle updated",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    await Vehicle.delete(req.params.id);

    res.json({
      message: "Vehicle deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
