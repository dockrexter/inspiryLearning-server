var express = require("express");
var router = express.Router();

var userController = require("../../controllers/user.controller");

const auth = require("../../middleware/auth");
const { validateUserData } = require("../../middleware/validateUser");
const { validateUserLoginData } = require("../../middleware/validateUser");
const { validateUserDetailsData } = require("../../middleware/validateUser");

router.post("/login", validateUserLoginData, userController.login);
router.post("/register", validateUserData, userController.register);

router.post("/changePassword", auth, userController.changePassword);
router.post("/updateUser", auth, validateUserDetailsData, userController.updateUser);
router.delete("/userdelete", auth, userController.deleteUser);

router.get("/getAllNotifications", auth, userController.getAllNotifications);
router.post("/notificationReaded", auth, userController.updateReadNotifications);
router.post("/notificationReaded", auth, userController.updateReadNotifications);
router.post("/resetNotification", auth, userController.notifySync);
router.post("/resetChat", auth, userController.chatSync);



router.post("/resetPassword", userController.resetPassword);
router.get("/resetPassword", userController.sendResetPasswordPage);
router.post("/sendPasswordResetLink", userController.sendPasswordResetLink);

router.post("/removeUser", auth, userController.removeUser);

module.exports = router;
