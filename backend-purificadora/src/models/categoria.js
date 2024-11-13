const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Categoria = sequelize.define("Categoria", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: { msg: "El nombre de la categoría no puede ser nulo" },
            notEmpty: { msg: "El nombre de la categoría no puede estar vacío" },
        },
    },
}, {
    tableName: "categoria",
    timestamps: false, // No usar `createdAt` y `updatedAt`
});

module.exports = Categoria;
