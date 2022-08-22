const db = require("../models");
const response = require("../utils/response");

const add = (req, res) => {
  const token = db.FCMToken.create({
    token: req.body.token,
    userId: req.user.userId,
  });
  return res.status(200).json(
    response(200, "ok", "Token register successfully", {
      token: req.body.token,
    })
  );
};

const remove = (req, res) => {
  const token = db.FCMToken.destroy({
    where: {
      token: req.body.token,
      userId: req.user.userId,
    },
  });
  return res.status(200).json(
    response(200, "ok", "Token removed successfully", {
      token: req.body.token,
    })
  );
};

module.exports = { add, remove };
