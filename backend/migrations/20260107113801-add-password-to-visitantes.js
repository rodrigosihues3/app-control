'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Visitantes', 'password', {
      type: Sequelize.STRING,
      allowNull: true, // Al principio es null hasta que corras el script
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Visitantes', 'password');
  }
};