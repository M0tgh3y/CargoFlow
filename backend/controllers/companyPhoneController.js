const CompanyPhone = require("../models/CompanyPhone");

exports.getPhones = async (req, res) => {
  try {
    const phones = await CompanyPhone.getPhones(req.params.companyId);

    res.json(phones);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.addPhone = async (req, res) => {
  try {
    const result = await CompanyPhone.addPhone(
      req.params.companyId,
      req.body.phone,
    );

    res.status(201).json({
      message: "Phone added",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deletePhone = async (req, res) => {
  try {
    await CompanyPhone.deletePhone(req.params.phoneId);

    res.json({
      message: "Phone deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
