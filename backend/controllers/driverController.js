const Driver = require("../models/Driver");

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.getAll();

    res.json(drivers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.getById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    res.json(driver);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getDriverByEmail = async (req, res) => {
  try {
    const driver = await Driver.getByEmail(req.params.email);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDriver = async (req, res) => {
  try {
    const result = await Driver.create(req.body);

    res.status(201).json({
      message: "Driver created",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    await Driver.update(req.params.id, req.body);

    res.json({
      message: "Driver updated",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteDriver = async (req, res) => {
  try {
    await Driver.delete(req.params.id);

    res.json({
      message: "Driver deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
