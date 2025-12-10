const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Gasto = sequelize.define(
  "Gasto",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    gasto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    observacion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "gastos",
    timestamps: false,
  }
);

module.exports = Gasto;
