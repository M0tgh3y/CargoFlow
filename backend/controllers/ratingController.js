const Rating = require("../models/Rating");

exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.getAll();

    res.json(ratings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getRating = async (req, res) => {
  try {
    const rating = await Rating.getByIds(
      req.params.senderId,
      req.params.driverId,
      req.params.requestId,
    );

    if (!rating) {
      return res.status(404).json({
        message: "Rating not found",
      });
    }

    res.json(rating);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.createRating = async (req, res) => {
  try {
    await Rating.create(req.body);

    res.status(201).json({
      message: "Rating created",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateRating = async (req, res) => {
  try {
    await Rating.update(
      req.params.senderId,
      req.params.driverId,
      req.params.requestId,

      req.body,
    );

    res.json({
      message: "Rating updated",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteRating = async (req, res) => {
  try {
    await Rating.delete(
      req.params.senderId,
      req.params.driverId,
      req.params.requestId,
    );

    res.json({
      message: "Rating deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
