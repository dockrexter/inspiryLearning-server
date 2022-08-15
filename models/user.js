'use strict';
const {
  Model
} = require('sequelize');
var Joi = require("joi");
var bcrypt = require("bcryptjs");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    userName: DataTypes.STRING,
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    token: DataTypes.STRING,
    role: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',

  });

  User.beforeCreate(async (user, options) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt)
    user.password = hashedPassword;
  });

  return User;
};

const validateUser = (data) => {
  var schema = Joi.object({
    firstName: Joi.string().min(3).max(12).required(),
    lastName: Joi.string().min(3).max(12).empty(),
    role: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow(""),
    password: Joi.string().min(6).max(14).required(),
  });
  return schema.validate(data);
}

const validateUserLogin = (data) => {
  var schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
  });
  return schema.validate(data);
}

const validateUserDetails = (data) => {
  var schema = Joi.object({
    firstName: Joi.string().min(3).max(12).required(),
    lastName: Joi.string().min(3).max(12).empty(),
    phone: Joi.string().allow(""),
  });
  return schema.validate(data);
}

module.exports.validateUser = validateUser;
module.exports.validateUserLogin = validateUserLogin;
module.exports.validateUserDetails = validateUserDetails;