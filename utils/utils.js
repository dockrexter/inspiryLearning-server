const fs = require("fs");
const db = require("../models");
const admin = require("firebase-admin");
const serviceAccount = require("./inspiry-learning-fcm.json");

const mkdir = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
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

const getTokensByUserId = async (userId) => {
  const tokens = await db.FCMToken.findAll({
    where: { userId },
  });
  return tokens;
};

const getAllAdminTokens = async () => {
  const admins = await db.User.findAll({
    where: { role: "admin" },
  });
  const tokens = [];
  for (let i = 0; i < admins.length; i++) {
    const token = await db.FCMToken.findAll({
      where: { userId: admins[i].id },
    });
    if (token) tokens.push(token);
  }
  return tokens;
};

const sendFcmMessage = async (title, body, tokens) => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  const message = {
    data: { title: title, body: body },
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
    .finally(() => {
      admin.app().delete();
    });
};

module.exports = {
    mkdir,
    getUserRole,
    sendFcmMessage,
    getAllAdminTokens,
    getTokensByUserId,
    getUserIdByAssignmentId,
};
