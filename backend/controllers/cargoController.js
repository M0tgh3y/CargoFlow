const Cargo = require("../models/Cargo");

exports.getAllCargo = async (req, res) => {
  try {
    const cargo = await Cargo.getAll();

    res.json(cargo);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getCargoById = async (req, res) => {
  try {
    const cargo = await Cargo.getById(req.params.id);

    if (!cargo) {
      return res.status(404).json({
        message: "Cargo not found",
      });
    }

    res.json(cargo);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.createCargo = async (req, res) => {
  try {
    const result = await Cargo.create(req.body);

    res.status(201).json({
      message: "Cargo created",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateCargo = async (req, res) => {
  try {
    await Cargo.update(req.params.id, req.body);

    res.json({
      message: "Cargo updated",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteCargo = async (req, res) => {
  try {
    await Cargo.delete(req.params.id);

    res.json({
      message: "Cargo deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
