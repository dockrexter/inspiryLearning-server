const response = require("../utils/response");

const upload = (req, res) => {
  return res.status(200).json(
    response(200, "ok", "attachment uploded successfully", {
      fileName: req.file.originalname,
      fileSize: req.file.size,
      url: `/${req.file.path.replace(/\\/g, "/")}`,
    })
  );
};

module.exports = { upload };
