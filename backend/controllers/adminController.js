const Admin = require("../models/Admin");

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.getAll();

    res.json(admins);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.getById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const result = await Admin.create(req.body);

    res.status(201).json({
      message: "Admin created",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    await Admin.update(req.params.id, req.body);

    res.json({
      message: "Admin updated",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    await Admin.delete(req.params.id);

    res.json({
      message: "Admin deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
