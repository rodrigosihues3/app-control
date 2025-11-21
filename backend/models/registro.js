'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Registro extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Un Registro PERTENECE A un Visitante
      Registro.belongsTo(models.Visitante, {
        foreignKey: 'visitante_id'
      });
    }
  }
  Registro.init({
    tipo: DataTypes.STRING,
    fecha_hora: DataTypes.DATE,
    visitante_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Registro',
  });
  return Registro;
};