const express = require("express");

const router = express.Router();

const companyPhoneController = require("../controllers/companyPhoneController");

router.get("/:companyId", companyPhoneController.getPhones);

router.post("/:companyId", companyPhoneController.addPhone);

router.delete("/:phoneId", companyPhoneController.deletePhone);

module.exports = router;
