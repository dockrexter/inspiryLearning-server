let { validateUser } = require("../models/user");
let { validateUserLogin } = require("../models/user");
var response = require("../utils/response");

//middleware to check data if it passes joi validation or not

function validateUserData(req, res, next) {
    let { error } = validateUser(req.body);
    if (error) return res.status(400).json(response(401, "error", error.details[0].message, {}));
    next();
}


function validateUserLoginData(req, res, next) {
    let { error } = validateUserLogin(req.body);
    if (error) return res.status(400).json(response(401, "error", error.details[0].message, {}));
    next();
}

module.exports.validateUserData = validateUserData;
module.exports.validateUserLogin = validateUserLoginData;