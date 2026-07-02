const express = require("express");

const router = express.Router();

const ratingController = require("../controllers/ratingController");

router.get("/", ratingController.getAllRatings);

router.get("/:senderId/:driverId/:requestId", ratingController.getRating);

router.post("/", ratingController.createRating);

router.put("/:senderId/:driverId/:requestId", ratingController.updateRating);

router.delete("/:senderId/:driverId/:requestId", ratingController.deleteRating);

module.exports = router;
