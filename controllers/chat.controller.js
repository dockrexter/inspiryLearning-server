const db = require("../models");

const getChat = async (assignmentId) => {
  const chat = await db.Chat.findAll({
    where: { assignmentId: assignmentId },
  });
  return chat;
};

const postChat = async (payload) => {
  const chat = await db.Chat.create(payload);
  if (chat) {
    return { response: chat };
  } else {
    return { error: "error while saving message in db" };
  }
};

module.exports = { getChat, postChat };
