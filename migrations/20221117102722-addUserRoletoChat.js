'use strict';


module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([queryInterface.addColumn(
      'Chats',
      'userName',
      Sequelize.STRING
    ),
    queryInterface.addColumn(
      'Chats',
      'userRole',
      Sequelize.STRING
    )
    ])




  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return Promise.all([
      queryInterface.removeColumn('Chats', 'userName'),
      queryInterface.removeColumn('Chats', 'userRole')
    ]);
  }
};
