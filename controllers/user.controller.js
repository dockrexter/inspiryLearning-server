require("dotenv").config;
const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
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
  const user = await db.User.update(
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
    },
    { where: { id: req.user.id } }
  );
  return res
    .status(200)
    .json(response(200, "ok", "user updated successfully", user));
};

const sendResetPasswordPage = async (req, res) => {
  return res.end(`<html><body><form action="/api/users/resetPassword" method="post">
  <input type="text" name="token" style="display:none" value="${req.query.token}" />
  <input type="password" name="password" placeholder="Enter new Password" required><br>
  <input type="submit" value="Reset Password">
  </form></body></html>`);
};

const resetPassword = async (req, res) => {
  const token = req.body.token;
  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  if (decoded.expiry < Date.now())
    return res.status(401).json(response(401, "error", "token expired", {}));
  const salt = await bcrypt.genSalt(10);
  const newPassword = await bcrypt.hash(req.body.password, salt);
  await db.User.update(
    { password: newPassword },
    { where: { id: decoded._id } }
  );
  return res
    .status(200)
    .json(response(200, "ok", "password changed successfully", {}));
};

const sendPasswordResetLink = async (req, res) => {
  const user = await db.User.findOne({ where: { email: req.body.email } });
  if (!user)
    return res
      .status(401)
      .json(response(401, "error", "no user found with this email", {}));
  const token = jwt.sign(
    {
      _id: user.id,
      email: user.email,
      role: user.role,
      expiry: Date.now() + 600000,
    },
    process.env.JWT_PRIVATE_KEY
  );
  const link = `${process.env.FRONTEND_URL}/api/users/resetPassword?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Password Reset Link",
    html: `<p>Click on the link to reset your password</p><a href="${link}">${link}</a>`,
  };
  const transporter = await nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const info = await transporter.sendMail(mailOptions);
  return res
    .status(200)
    .json(response(200, "ok", "password reset link sent successfully", {}));
};

const getAllNotifications = async (req, res) => {
  const notifications = await db.Notification.findAll({
    where: { userId: req.user.id },
    order: [
      ["createdAt", "DESC"],
    ],
  });
  return res
    .status(200)
    .json(response(200, "ok", "notifications fetched successfully", notifications));
}

module.exports = {
  sendPasswordResetLink,
  sendResetPasswordPage,
  getAllNotifications,
  changePassword,
  resetPassword,
  updateUser,
  register,
  login,
};
