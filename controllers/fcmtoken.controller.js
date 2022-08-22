const db = require("../models");
const response = require("../utils/response");

const add = async (req, res) => {
  const token = await db.FCMToken.create({
    token: req.body.token,
    userId: req.user.id,
  });
  return res.status(200).json(
    response(200, "ok", "Token register successfully", {
      token: req.body.token,
    })
  );
};

const remove = async (req, res) => {
  const row = await db.FCMToken.findOne({
    where: {
      token: req.body.token,
      userId: req.user.id,
    },
  });
  if (row) {
    await row.destroy();
  }
  return res.status(200).json(
    response(200, "ok", "Token removed successfully", {
      token: req.body.token,
    })
  );
};

module.exports = { add, remove };
