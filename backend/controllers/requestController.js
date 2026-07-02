const Request = require("../models/Request");

const Cargo = require("../models/Cargo");

const Rule = require("../models/Rule");

const PricingService = require("../services/pricingService");

const LocationService = require("../services/locationService");

const TimeService = require("../services/timeService");

const Driver = require("../models/Driver");

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.getAll();

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.getById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAvailableRequests = async (req, res) => {
  try {
    const requests = await Request.getAvailable();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRequestsBySender = async (req, res) => {
  try {
    const requests = await Request.getBySenderId(req.params.senderId);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const distanceKm = LocationService.calculateDistance(
      req.body.origin_latitude,
      req.body.origin_longitude,

      req.body.destination_latitude,
      req.body.destination_longitude,
    );

    const estimatedTime = TimeService.calculateEstimatedTime(distanceKm);

    const cargo = await Cargo.getWeight(req.body.cargo_id);

    const rule = await Rule.getRates(req.body.rule_id);

    const calculatedPrice = PricingService.calculatePrice(
      cargo.weight,

      distanceKm,

      estimatedTime,

      rule.weight_rate,

      rule.distance_rate,

      rule.time_rate,

      rule.company_percent,
    );

    const deliveryDatetime = TimeService.calculateDeliveryDate(
      req.body.loading_datetime,

      estimatedTime,
    );

    const result = await Request.create({
      ...req.body,

      distance_km: distanceKm,

      estimated_time: estimatedTime,

      delivery_datetime: deliveryDatetime,

      price: calculatedPrice,
    });

    await Driver.updateStatus(req.body.driver_id, "loading");

    await Cargo.updateStatus(req.body.cargo_id, "loading");

    res.status(201).json({
      message: "Request created",

      request_id: result.insertId,

      distance_km: distanceKm,

      estimated_time: estimatedTime,

      price: calculatedPrice,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { driver_id } = req.body;

    const request = await Request.getById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }

    await Request.assignDriver(requestId, driver_id);
    await Request.updateStatus(requestId, "accepted");
    await Driver.updateStatus(driver_id, "loading");
    await Cargo.updateStatus(request.cargo_id, "loading");

    res.json({ message: "Request accepted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.startTrip = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await Request.getById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.status !== "accepted") {
      return res.status(400).json({
        message: "Request is not accepted",
      });
    }

    // 1. Update request
    await Request.updateStatus(requestId, "on_route");

    // 2. Update driver
    await Driver.updateStatus(request.driver_id, "on_route");

    // 3. Update cargo
    await Cargo.updateStatus(request.cargo_id, "on_route");

    res.json({
      message: "Trip started successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deliverTrip = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await Request.getById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.status !== "on_route") {
      return res.status(400).json({
        message: "Trip is not in progress",
      });
    }

    // 1. update request
    await Request.updateStatus(requestId, "delivered");

    // 2. free driver
    await Driver.updateStatus(request.driver_id, "available");

    // 3. finalize cargo
    await Cargo.updateStatus(request.cargo_id, "delivered");

    res.json({
      message: "Trip delivered successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getRequestsByDriver = async (req, res) => {
  try {
    const requests = await Request.getByDriverId(req.params.driverId);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRequestDetail = async (req, res) => {
  try {
    const request = await Request.getDetail(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
