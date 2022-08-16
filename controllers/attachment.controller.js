const response = require("../utils/response");

const upload = (req, res) => {
  return res.status(200).json(
    response(200, "Uploaded", "attachment uploded successfully", {
      fileName: req.files[0].originalname,
      fileSize: req.files[0].size,
      url: `/${req.files[0].path.replace(/\\/g, "/")}`,
    })
  );
};

module.exports = { upload };
