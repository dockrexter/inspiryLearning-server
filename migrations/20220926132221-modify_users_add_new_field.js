'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'Users',
      'active',
      {
        type: Sequelize.BOOLEAN,
      },
    )
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeColumn('Users', 'linkedin')
  }
};
