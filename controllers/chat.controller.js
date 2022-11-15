const db = require("../models");

const getChat = async (assignmentId) => {
  try{
  const chat = await db.Chat.findAll({
    where: { assignmentId: assignmentId },
  });
  return chat;
} catch (error) {
  console.error("Error in getChat => chat.controllers", error)
}
};

const postChat = async (payload) => {
  try{
  const chat = await db.Chat.create(payload);
  if (chat) {
    return { response: chat };
  } else {
    return { error: "error while saving message in db" };
  }
} catch (error) {
  console.error("Error in postChat => chat.controllers", error)
}
};


module.exports = { getChat, postChat };
