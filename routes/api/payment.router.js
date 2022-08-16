var express = require("express");
var router = express.Router();

const auth = require("../../middleware/auth");

const paymentController = require("../../controllers/payment.controller");

router.post("/pay", auth, paymentController.initiatePayment);

router.get("/success", paymentController.onSuccess);

router.get("/cancel", paymentController.onCancel);

module.exports = router;
