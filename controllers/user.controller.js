var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var db = require("../models");
require("dotenv").config;
var response = require("../utils/response");

const register = async (req, res) => {
    var email = req.body.email;
    let user_email = await db.User.findOne({
        where: { email: email },
    });
    if (user_email) return res.status(400).json(response(401, "error", "user with this email already exit", {}));
    const newUser = await db.User.create(
        {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
            role: req.body.role,
        });
    var token = jwt.sign(
        {
            _id: newUser.id,
            email: newUser.email,
            role: newUser.role,
        },
        process.env.JWT_PRIVATE_KEY
    );
    var userObj = newUser
    userObj.token = token
    res
        .status(200)
        .json(response(200, "ok", "user registerd successfully", userObj));
}

const login = async (req, res) => {
    let user = await db.User.findOne({ where: { email: req.body.email } });
    if (!user) return res.status(401).json(response(401, "error", "no user found with this email", {}));
    const isValid = await bcrypt.compare(req.body.password, user.password);

    if (!isValid) return res.status(401).json(response(401, "error", "password is incorrect", {}));
    var token = jwt.sign(
        {
            _id: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_PRIVATE_KEY
    );
    user.token = token

    res
        .status(200)
        .json(response(200, "ok", "user logged in successfully", user));
}

module.exports = {
    register,
    login
}