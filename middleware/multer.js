const path = require("path");
const multer = require("multer");

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
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

module.exports.upload = multer({ storage: storage }).array("files", 10);