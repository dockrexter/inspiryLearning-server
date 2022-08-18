"use strict";
const { Model } = require("sequelize");
const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  class FCMToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      FCMToken.belongsTo(models.User, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });
    }
  }
  FCMToken.init(
    {
      userId: DataTypes.INTEGER,
      token: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "FCMToken",
    }
  );
  return FCMToken;
};
