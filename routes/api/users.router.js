var express = require("express");
var router = express.Router();

var userController = require("../../controllers/user.controller");

const auth = require("../../middleware/auth");
const { validateUserData } = require("../../middleware/validateUser")
const { validateUserLoginData } = require("../../middleware/validateUser")
const { validateUserDetailsData } = require("../../middleware/validateUser")


router.post("/login", validateUserLoginData, userController.login)
router.post("/register", validateUserData, userController.register)

router.post("/changePassword", auth, userController.changePassword);
router.post("/updateUser", auth, validateUserDetailsData, userController.updateUser);

module.exports = router;