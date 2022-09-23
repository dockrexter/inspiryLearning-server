const db = require("../models");
const response = require("../utils/response");

const add = async (req, res) => {
  try {
    await db.FCMToken.create({
      token: req.body.token,
      userId: req.user.id,
    });
    return res.status(200).json(
      response(200, "ok", "Token register successfully", {
        token: req.body.token,
      })
    )
  } catch (error) {
    console.log(error)
    return res.status(500).json(
      response(500, "error", "Something went Wrong"))
  }
};

const remove = async (req, res) => {
  try {
    await db.FCMToken.destroy({
      where: {
        token: req.body.token,
        userId: req.user.id,
      },
    });
    // if (row) {
    //   await row.destroy();
    // }
    return res.status(200).json(
      response(200, "ok", "Token removed successfully", {
        token: req.body.token,
      })
    )
  } catch (error) {
    return res.status(500).json(
      response(500, "error", "Something went Wrong"))
  }
};

module.exports = { add, remove };
