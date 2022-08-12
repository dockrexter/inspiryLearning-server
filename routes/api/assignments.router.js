var express = require("express");
var router = express.Router();
const { upload } = require("../../middleware/multer");
const {
  validateAssignmentData,
} = require("../../middleware/validateAssingment");

const assignmentController = require("../../controllers/assignment.controller");

const auth = require("../../middleware/auth");

router.post("/updateStatus", auth, assignmentController.updateStatus);
router.post("/updateAssignee", auth, assignmentController.updateAssignee);
router.post("/getAttachments", auth, assignmentController.getAttachments);

router.get(
  "/getUserAssignments",
  auth,
  assignmentController.getUserAssignments
);

router.post(
  "/createUserAssignment",
  auth,
  upload,
  validateAssignmentData,
  assignmentController.createUserAssignment
);

router.post(
  "/getCurrentMonthAssignments",
  auth,
  assignmentController.getCurrentMonthAssignments
);

router.post(
  "/getAllDueAssignments",
  auth,
  assignmentController.getAllDueAssignments
);

module.exports = router;
