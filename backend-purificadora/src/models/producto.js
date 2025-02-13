const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Categoria = require("./categoria");

const Producto = sequelize.define("Producto", {
    id_producto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: { msg: "El nombre del producto no puede ser nulo" },
            notEmpty: { msg: "El nombre del producto no puede estar vacío" },
        },
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            notNull: { msg: "El precio no puede ser nulo" },
        },
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    id_categoria: {
        type: DataTypes.INTEGER,
        references: {
            model: Categoria,
            key: "id",
        },
        allowNull: false,
    },
}, {
    tableName: "producto",
    timestamps: false, // No usar `createdAt` y `updatedAt`
});

// Definir la relación con Categoría
Producto.belongsTo(Categoria, { foreignKey: "id_categoria", as: "Categoria" });

module.exports = Producto;