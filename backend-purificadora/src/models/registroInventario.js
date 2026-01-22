const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Producto = require("./producto");
const Usuario = require("./usuario"); // Usuario que realiza la operación

const RegistroInventario = sequelize.define("RegistroInventario", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "producto", // Usamos el nombre exacto de la tabla para evitar confusiones con plurales
            key: "id_producto",
        },
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    fecha_ingreso: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: "id",
        },
    },
}, {
    tableName: "registro_inventario",
    timestamps: false,
});

// Relaciones
RegistroInventario.belongsTo(Producto, { foreignKey: "id_producto" });
RegistroInventario.belongsTo(Usuario, { foreignKey: "id_usuario" });

module.exports = RegistroInventario;
