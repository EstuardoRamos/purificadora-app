const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const MetodoPago = sequelize.define("MetodoPago", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    metodo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: { msg: "El nombre de la categoría no puede ser nulo" },
            notEmpty: { msg: "El nombre de la categoría no puede estar vacío" },
        },
    },
}, {
    tableName: "metodos_pago",
    timestamps: false, // No usar `createdAt` y `updatedAt`
});

module.exports = MetodoPago;
