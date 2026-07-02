const express = require("express");

const router = express.Router();

const ruleController = require("../controllers/ruleController");

router.get("/", ruleController.getAllRules);
router.get("/:id", ruleController.getRuleById);

router.post("/", ruleController.createRule);

router.put("/:id", ruleController.updateRule);

router.delete("/:id", ruleController.deleteRule);

module.exports = router;
