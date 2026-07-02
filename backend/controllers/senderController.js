const Sender = require("../models/Sender");

exports.getAllSenders = async (req, res) => {
  try {
    const senders = await Sender.getAll();

    res.json(senders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getSenderById = async (req, res) => {
  try {
    const sender = await Sender.getById(req.params.id);

    if (!sender) {
      return res.status(404).json({
        message: "Sender not found",
      });
    }

    res.json(sender);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getSenderByEmail = async (req, res) => {
  try {
    const sender = await Sender.getByEmail(req.params.email);
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }
    res.json(sender);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSender = async (req, res) => {
  try {
    const result = await Sender.create(req.body);

    res.status(201).json({
      message: "Sender created",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateSender = async (req, res) => {
  try {
    await Sender.update(req.params.id, req.body);

    res.json({
      message: "Sender updated",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteSender = async (req, res) => {
  try {
    await Sender.delete(req.params.id);

    res.json({
      message: "Sender deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
