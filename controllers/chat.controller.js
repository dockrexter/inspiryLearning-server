const db = require("../models");

const getChat = async (assignmentId) => {
  const chat = await db.chat.findAll({
    where: { assignmentId: assignmentId },
  });
  return chat;
};

const postChat = async ({
  user_type,
  assignment_id,
  user_id,
  admin_id,
  message,
  time_stamp,
  attachment,
  amount,
  type,
  status,
  file_name,
  file_size,
  download_url,
}) => {
  return {
    status: "Ok",
  };
};

module.exports = {
  getChat,
  postChat
}