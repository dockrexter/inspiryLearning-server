var response = require("../utils/response");
const { validateAssignment } = require("../models/assignment");

//middleware to check data if it passes joi validation or not

function validateAssignmentData(req, res, next) {
  let { error } = validateAssignment(req.body);
  if (error)
    return res
      .status(400)
      .json(response(401, "error", error.details[0].message, {}));
  next();
}

module.exports.validateAssignmentData = validateAssignmentData;
