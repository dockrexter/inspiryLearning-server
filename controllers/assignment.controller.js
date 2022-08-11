require("dotenv").config;
var db = require("../models");
const multer = require("multer");
var response = require("../utils/response");

/**
 * Multer configuration
 */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + datime + "-" + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

/**
 * Buisness logic
 */

const getUserAssignments = async (req, res) => {
  const assignments = await db.Assignment.findAll(
    { where: { id: req.user.id } }
  );
  return res
    .status(200)
    .json(response(200, "ok", "", assignments));
};

const createUserAssignment = async (req, res) => {
  const assignment = await db.Assignment.create(req.body);
  return res.status(200).json(response(200, "ok", "", assignments));
};

module.exports = {
  getUserAssignments,
  createUserAssignment,
};
