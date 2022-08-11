'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attachments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Attachments.belongsTo(models.Assignment, {
        foreignKey: 'userId',
        onDelete: 'CASCADE'
      })
    }
  }
  Attachments.init({
    assignmentId: DataTypes.INTEGER,
    fileName: DataTypes.STRING,
    fileSize: DataTypes.INTEGER,
    url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Attachments',
  });
  return Attachments;
};