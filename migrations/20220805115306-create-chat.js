'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Chats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      assignmentId: {
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      message: {
        type: Sequelize.STRING
      },
      fileName: {
        type: Sequelize.STRING
      },
      fileSize: {
        type: Sequelize.INTEGER
      },
      url: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.INTEGER
      },
      amount: {
        type: Sequelize.REAL
      },
      paymentStatus: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Chats');
  }
};