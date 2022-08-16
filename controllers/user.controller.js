require("dotenv").config;
const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const response = require("../utils/response");

const register = async (req, res) => {
  var email = req.body.email;
  let user_email = await db.User.findOne({
    where: { email: email },
  });
  if (user_email)
    return res
      .status(400)
      .json(response(401, "error", "user with this email already exit", {}));
  const newUser = await db.User.create({
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
  var userObj = newUser;
  userObj.token = token;
  res
    .status(200)
    .json(response(200, "ok", "user registerd successfully", userObj));
};

const login = async (req, res) => {
  let user = await db.User.findOne({ where: { email: req.body.email } });
  if (!user)
    return res
      .status(401)
      .json(response(401, "error", "no user found with this email", {}));
  const isValid = await bcrypt.compare(req.body.password, user.password);

  if (!isValid)
    return res
      .status(401)
      .json(response(401, "error", "password is incorrect", {}));

  if (user.role !== req.body.role)
    return res
      .status(401)
      .json(
        response(
          401,
          "error",
          user.role === "admin"
            ? "Admin cannot be login as User"
            : "User cannot be login as Admin",
          {}
        )
      );

  var token = jwt.sign(
    {
      _id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_PRIVATE_KEY
  );
  user.token = token;

  res
    .status(200)
    .json(response(200, "ok", "user logged in successfully", user));
};

const changePassword = async (req, res) => {
  const isValid = await bcrypt.compare(req.body.oldPassword, req.user.password);
  if (!isValid)
    return res
      .status(401)
      .json(response(401, "error", "password is incorrect", {}));
  const salt = await bcrypt.genSalt(10);
  const newPassword = await bcrypt.hash(req.body.newPassword, salt);
  await db.User.update(
    { password: newPassword },
    { where: { id: req.user.id } }
  );
  return res
    .status(200)
    .json(response(200, "ok", "password changed successfully", {}));
};

const updateUser = async (req, res) => {
  await db.User.update(
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
    },
    { where: { id: req.user.id } }
  );
  return res.status(200).json(
    response(200, "ok", "user updated successfully", {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
    })
  );
};

module.exports = {
  changePassword,
  updateUser,
  register,
  login,
};
