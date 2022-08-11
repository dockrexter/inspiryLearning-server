'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Assignment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Assignment.belongsTo(models.User,
        {
          foreignKey: 'userId',
          onDelete: 'CASCADE'
        }
      )
    }
  }
  Assignment.init({
    userId: DataTypes.INTEGER,
    subject: DataTypes.STRING,
    summary: DataTypes.STRING,
    assignee: DataTypes.STRING,
    status: DataTypes.INTEGER,
    deadline: DataTypes.STRING,
    paymentStatus: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Assignment',
  });
  return Assignment;
};

const validateAssignment = (data) => {
  var schema = Joi.object({
    subject: Joi.string().required(),
    summary: Joi.string().required(),
    assignee: Joi.string().min(3).max(25).empty(),
    status: Joi.int().required(),
  });
  return schema.validate(data);
};

module.export = {
  validateAssignment
};