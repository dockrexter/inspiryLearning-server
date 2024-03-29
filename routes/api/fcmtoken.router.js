var express = require("express");
var router = express.Router();

const auth = require("../../middleware/auth");

const fcmtokenController = require("../../controllers/fcmtoken.controller");

router.post("/add", auth, fcmtokenController.add);
router.post("/remove", auth, fcmtokenController.remove);

module.exports = router;
