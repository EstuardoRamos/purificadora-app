const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Producto = require("./producto");
const Venta = require("./venta");

const DetalleVenta = sequelize.define("DetalleVenta", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_venta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Venta,
            key: "id",
        },
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
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    tableName: "detalle_ventas",
    timestamps: false,
});

// Relaciones
//DetalleVenta.belongsTo(Venta, { foreignKey: "id_venta" });
DetalleVenta.belongsTo(Producto, { foreignKey: "id_producto" });

module.exports = DetalleVenta;
