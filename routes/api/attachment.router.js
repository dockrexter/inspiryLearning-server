var express = require("express");
var router = express.Router();

const auth = require("../../middleware/auth");
const { uploadSingle } = require("../../middleware/multer");

const attachmentController = require("../../controllers/attachment.controller");

router.post("/upload", auth, uploadSingle, attachmentController.upload);

module.exports = router;