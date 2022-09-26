require("dotenv").config;
const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const response = require("../utils/response");

const register = async (req, res) => {
  try {
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
      active: 1,
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
  } catch (error) {
    return res.status(500).json(response(500, "error", "Something Went Wrong"));
  }
};

const login = async (req, res) => {
  try {
    let user = await db.User.findOne({ where: { email: req.body.email } });
    if (!user)
      return res
        .status(401)
        .json(response(401, "error", "no user found with this email", {}));

    if (req.user.active === 0) return res
      .status(404)
      .json(response(404, "error", "user not active", {}));

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
  } catch (error) {
    return res.status(500).json(response(500, "error", "Somrthing went wrong"));
  }
};

const changePassword = async (req, res) => {
  try {
    const isValid = await bcrypt.compare(
      req.body.oldPassword,
      req.user.password
    );
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
  } catch (error) {
    return res.status(500).json(response(500, "error", "Something Went Wrong"));
  }
};

const updateUser = async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).json(response(500, "error", "Something Went Wrong"));
  }
};

const sendResetPasswordPage = async (req, res) => {
  return res.end(`<html><body><form action="/api/users/resetPassword" method="post">
  <input type="text" name="token" style="display:none" value="${req.query.token}" />
  <input type="password" name="password" placeholder="Enter new Password" required><br>
  <input type="submit" value="Reset Password">
  </form></body></html>`);
};

const resetPassword = async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).json(response(500, "error", "SomeThing Went Wrong"));
  }
};

const sendPasswordResetLink = async (req, res) => {
  try {
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
    // const link = `${process.env.FRONTEND_URL}/api/users/resetPassword?token=${token}`;
    const link = `https://inspirylearning.com/resetPassword?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Password Reset Link",
      html: `<p>Click on the link to reset your password</p><a href="${link}">${link}</a>`,
    };
    const transporter = await nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "resetlink.inspirylearning@gmail.com",
        pass: "xgdcpsyletzokduo",
      },
    });
    const info = await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json(response(200, "ok", "password reset link sent successfully", {}));
  } catch (error) {
    return res.status(500).json(response(500, "Error", "SomeThing Went Wrong"));
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const notifications = await db.Notification.findAll({
      where: { userID: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    return res
      .status(200)
      .json(
        response(200, "ok", "notifications fetched successfully", notifications)
      );
  } catch (error) {
    return res.status(500).json(response(500, "error", "Something Went Wrong"));
  }
};

const updateReadNotifications = async (req, res) => {
  try {
    await db.Notification.update(
      {
        isRead: 1,
      },
      { where: { userID: req.body.userId } }
    );
    return res.status(200).json(response(200, "ok", "Readed"));
  } catch (error) {
    console.log("Error in Read Notifications=>", error);
    return res
      .status(500)
      .json(response(500, "error", "Something Went Wrong", error));
  }
};
const updateSingleReadNotifications = async (req, res) => {
  try {
    await db.Notification.update(
      {
        isRead: 1,
      },
      { where: { id: req.body.id } }
    );
    return res.status(200).json(response(200, "ok", "Readed"));
  } catch (error) {
    return res
      .status(500)
      .json(response(500, "error", "Something Went Wrong", error));
  }
};

const removeUser = async (req, res) => {
  try {
    const isValid = await bcrypt.compare(req.body.password, req.user.password);
    if (!isValid)
      return res
        .status(401)
        .json(response(401, "error", "password is incorrect", {}));

    await db.User.update(
      { active: 0, },
      { where: { id: req.user.id } },
    );
    return res
      .status(200)
      .json(response(200, "ok", "user removed successfully", user));
  } catch (error) {
    return res.status(500).json(response(500, "error", "Something Went Wrong"));
  }
};

module.exports = {
  removeUser,
  sendPasswordResetLink,
  sendResetPasswordPage,
  getAllNotifications,
  updateReadNotifications,
  updateSingleReadNotifications,
  changePassword,
  resetPassword,
  updateUser,
  register,
  login,
};
