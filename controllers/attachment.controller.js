const response = require("../utils/response");

const upload = (req, res) => {
  try {
  return res.status(200).json(
    response(200, "ok", "attachment uploded successfully", {
      fileName: req.file.originalname,
      fileSize: req.file.size,
      url: `/${req.file.path.replace(/\\/g, "/")}`,
    })
  );
} catch (error) {
  return res.status(500).json(
    response(500, "error", "Something went Wrong"))
}};

module.exports = { upload };
