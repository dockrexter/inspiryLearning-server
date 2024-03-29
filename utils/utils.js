const fs = require("fs");
const db = require("../models");
const admin = require("firebase-admin");
const mkdir = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

const addNotification = async (userId, message, title, assignmentId) => {
  const dbnotification = await db.Notification.create({
    userID: userId,
    message: message,
    title: title,
    assignmentID: assignmentId,
    isRead: false,
  });
};

const getUserRole = async (id) => {
  const user = await db.User.findOne({
    where: { id },
  });
  return user.role;
};

const getUserIdByAssignmentId = async (assignmentId) => {
  const assignment = await db.Assignment.findOne({
    where: { id: assignmentId },
  });
  return assignment.userId;
};

const getTokensByUserId = async (assignmentId) => {
  const userId = await getUserIdByAssignmentId(assignmentId);
  var tokens = [];
  const token = await db.FCMToken.findAll({
    where: { userId },
  });
  if (token.length > 0) {
    for (t of token) {
      tokens.push(t.token);
    }
  }
  return tokens;
};

const getAllAdminIds = async () => {
  const users = await db.User.findAll({
    where: { role: "admin" },
  });
  return users.map((user) => user.id);
};

const getAllAdminTokens = async () => {
  try {
    const admins = await db.User.findAll({
      where: { role: "admin" },
    });

    var tokens = [];
    for (let i = 0; i < admins.length; i++) {
      const token = await db.FCMToken.findAll({
        where: { userId: admins[i].id },
      });
      if (token.length > 0) {
        for (t of token) {
          tokens.push(t.token);
        }
      }
      return tokens;
    }
  } catch (error) {
    console.error("Token: ", error);
  }
};

const sendFcmMessage = async (title, body, tokens, assignmentId) => {
  const message = {
    data: {
      title: title,
      body: body,
      assignmentId: assignmentId ? String(assignmentId) : "",
    },

    tokens: tokens,
  };
  try {
    admin
      .messaging()
      .sendMulticast(message)
      .then((response) => {})
      .catch((error) => {});
  } catch (error) {
    console.error("FCM: ", error);
  }
};

module.exports = {
  mkdir,
  getUserRole,
  sendFcmMessage,
  getAllAdminIds,
  addNotification,
  getAllAdminTokens,
  getTokensByUserId,
  getUserIdByAssignmentId,
};
