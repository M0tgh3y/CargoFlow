const Rule = require("../models/Rule");

exports.getAllRules = async (req, res) => {
  try {
    const rules = await Rule.getAll();

    res.json(rules);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getRuleById = async (req, res) => {
  try {
    const rule = await Rule.getById(req.params.id);

    if (!rule) {
      return res.status(404).json({
        message: "Rule not found",
      });
    }

    res.json(rule);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.createRule = async (req, res) => {
  try {
    const result = await Rule.create(req.body);

    res.status(201).json({
      message: "Rule created",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateRule = async (req, res) => {
  try {
    await Rule.update(req.params.id, req.body);

    res.json({
      message: "Rule updated",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    await Rule.delete(req.params.id);

    res.json({
      message: "Rule deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
