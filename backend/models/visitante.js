'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Visitante extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Un Visitante puede tener MUCHOS registros de entrada/salida
      Visitante.hasMany(models.Registro, {
        foreignKey: 'visitante_id',
        as: 'registros' // opcional, pero buena práctica
      });
    }
  }
  Visitante.init({
    dni: DataTypes.STRING,
    nombres: DataTypes.STRING,
    apellidos: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Visitante',
  });
  return Visitante;
};