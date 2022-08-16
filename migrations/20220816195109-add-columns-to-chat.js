"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Chats", "fileName", Sequelize.STRING);
    await queryInterface.addColumn("Chats", "fileSize", Sequelize.INTEGER);
    await queryInterface.addColumn("Chats", "url", Sequelize.STRING);
    await queryInterface.addColumn("Chats", "message", Sequelize.STRING);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Chats", "fileName");
    await queryInterface.removeColumn("Chats", "fileSize");
    await queryInterface.removeColumn("Chats", "url");
    await queryInterface.removeColumn("Chats", "message");
  },
};
