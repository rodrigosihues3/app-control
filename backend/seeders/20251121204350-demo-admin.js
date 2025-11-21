// Importamos bcrypt para encriptar la contraseña del admin
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Generar el hash de la contraseña
    // IMPORTANTE: Cambia 'admin123' por la contraseña que quieras por defecto
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // 2. Insertar el usuario (solo si no existe conflicto)
    return queryInterface.bulkInsert('Admins', [{
      usuario: 'admin',
      password: hashedPassword,
      nombre: 'Super Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    // Comando para revertir (borrar al admin)
    return queryInterface.bulkDelete('Admins', null, {});
  }
};