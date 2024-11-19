const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Producto = require("./producto");

const Inventario = sequelize.define("Inventario", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Producto,
            key: "id_producto",
        },
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: "inventario",
    timestamps: false, // No usar `createdAt` ni `updatedAt`
});

// Relación con Producto
Inventario.belongsTo(Producto, { foreignKey: "id_producto" });

module.exports = Inventario;
