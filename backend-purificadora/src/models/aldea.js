const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Aldea = sequelize.define("Aldea", {
    id_aldea: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: { msg: "El nombre de la aldea no puede ser nulo" },
            notEmpty: { msg: "El nombre de la aldea no puede estar vacío" },
        },
    },
}, {
    tableName: "aldea",
    timestamps: false, // No usamos `createdAt` ni `updatedAt`
});

module.exports = Aldea;
