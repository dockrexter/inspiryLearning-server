var express = require('express');
var router = express.Router();
var models = require("../models")
router.get("/", async (req, res, next) => {
    const jane = await models.User.findAll();
    console.log("Jane's auto-generated ID:", jane);
    res.status(200).send(jane)
})

module.exports = router;