var express = require("express");
var router = express.Router();

const assignmentController = require("../../controllers/assignment.controller");

const auth = require("../../middleware/auth");

router.get("/getUserAssignments", auth, assignmentController.getUserAssignments);
router.post("/createUserAssignment", auth, assignmentController.createUserAssignment);

module.exports = router;