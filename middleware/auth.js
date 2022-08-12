const jwt = require("jsonwebtoken");
require("dotenv").config;
const db = require("../models");
var response = require("../utils/response")

async function auth(req, res, next) {
    let token = req.header("token");
    if (!token) return res.status(400).json(response(401, "error", "Token not found", {}));
    try {
        let user = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        req.user = await db.User.findOne({ where: { id: user._id } });
        if (!req.user) return res
          .status(404)
          .json(response(404, "error", "user not found", {}));
    } catch (error) {
        return res.status(400).json(response(401, "error", "Token invalid", {}));
    }
    next();
}

module.exports = auth;