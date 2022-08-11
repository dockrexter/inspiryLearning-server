var express = require('express');
var router = express.Router();

router.get("/", async (req, res, next) => {
  res.status(200).send("😎 Welcome to Inspiry Learning 😎");
})

module.exports = router;