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
    userId: userId,
    message: message,
    title: title,
    assignmentID: assignmentId
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
  var tokens = []
  const token = await db.FCMToken.findAll({
    where: { userId },
  });
  if (token.length > 0) {
    for (t of token) {
      tokens.push(t.token);
    }
  }
  else {
    console.log("I am in else");
  }
  console.log(tokens);
  return tokens;
};

const getAllAdminIds = async () => {
  const users = await db.User.findAll({
    where: { role: "admin" },
  });
  return users.map((user) => user.id);
};

const getAllAdminTokens = async () => {
  const admins = await db.User.findAll({
    where: { role: "admin" },
  });

  var tokens = [];
  for (let i = 0; i < admins.length; i++) {
    const token = await db.FCMToken.findAll({
      where: { userId: admins[i].id },
    });
    console.log(tokens);
    if (token.length > 0) {
      for (t of token) {
        tokens.push(t.token);
      }
    }
    else {
      console.log("I am in else");
    }
  }
  return tokens;
};

const sendFcmMessage = async (title, body, tokens) => {

  const message = {

    data: {
      title: title,
      body: body,
    },

    tokens: tokens,
  };
  admin
    .messaging()
    .sendMulticast(message)
    .then((response) => {
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    })

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
