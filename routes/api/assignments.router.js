var express = require("express");
var router = express.Router();
const { uploadMultiple } = require("../../middleware/multer");
const {
  validateAssignmentData,
} = require("../../middleware/validateAssingment");

const assignmentController = require("../../controllers/assignment.controller");

const auth = require("../../middleware/auth");

router.post("/updateStatus", auth, assignmentController.updateStatus);
router.post("/updateAssignee", auth, assignmentController.updateAssignee);
router.post("/getAttachments", auth, assignmentController.getAttachments);
router.post("/deleteassignment", auth, assignmentController.deleteAssignment);

router.get(
  "/getUserAssignments",
  auth,
  assignmentController.getUserAssignments
);
router.post("/getAssignmentById",auth, assignmentController.getAssignmentById);

router.post(
  "/createUserAssignment",
  auth,
  uploadMultiple,
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
