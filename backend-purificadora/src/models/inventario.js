const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Verifica que la ruta de `database` sea correcta
const Producto = require("./producto"); // Importar el modelo Producto

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
            model: "producto", // Aquí usamos el nombre de la tabla en lugar del modelo para evitar dependencias circulares
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
Inventario.belongsTo(Producto, { foreignKey: "id_producto", as: "Producto" });

module.exports = Inventario;
