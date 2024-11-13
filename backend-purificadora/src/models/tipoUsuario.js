const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const TipoUsuario = sequelize.define(
  "TipoUsuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notNull: { msg: "El nombre no puede ser nulo" },
        notEmpty: { msg: "El nombre no puede estar vacío" },
      },
    },
  },
  {
    tableName: "tipo_usuario",
    timestamps: false, // No se utilizarán `createdAt` y `updatedAt`
  }
);

module.exports = TipoUsuario;
