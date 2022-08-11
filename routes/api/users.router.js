var express = require("express");
var router = express.Router();

var userController = require("../../controllers/user.controller");

var { validateUserData } = require("../../middleware/validateUser")
var { validateUserLogin } = require("../../middleware/validateUser")


router.post("/register", validateUserData, userController.register)
router.post("/login", validateUserLogin, userController.login)

module.exports = router;