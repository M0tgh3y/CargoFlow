const express = require("express");

const router = express.Router();

const requestController = require("../controllers/requestController");

router.get("/", requestController.getAllRequests);

router.get("/available", requestController.getAvailableRequests);

router.get("/sender/:senderId", requestController.getRequestsBySender);

router.get("/driver/:driverId", requestController.getRequestsByDriver);

router.get("/:id/detail", requestController.getRequestDetail);

router.get("/:id", requestController.getRequestById);

router.post("/", requestController.createRequest);

router.put("/:id/accept", requestController.acceptRequest);

router.put("/:id/start", requestController.startTrip);

router.put("/:id/deliver", requestController.deliverTrip);

router.post("/preview-price", requestController.previewPrice);

router.put("/:id", requestController.updateRequest);

router.delete("/:id", requestController.deleteRequest);

module.exports = router;
