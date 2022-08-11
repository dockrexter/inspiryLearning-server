'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Users',
      'token',
      Sequelize.STRING
    );
    await queryInterface.addColumn(
      'Users',
      'role',
      Sequelize.INTEGER
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'Users',
      'token'
    );
    await queryInterface.removeColumn(
      'Users',
      'role'
    );
  }
};
