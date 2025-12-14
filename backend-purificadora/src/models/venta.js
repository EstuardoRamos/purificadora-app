const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Usuario = require("./usuario");
const Cliente = require("./cliente");
const MetodoPago = require("./metodoPago"); // Importa el modelo de métodos de pago

const Venta = sequelize.define("Venta", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_cliente: {
        type: DataTypes.INTEGER,
        references: {
            model: Cliente,
            key: "id_cliente",
        },
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        references: {
            model: Usuario,
            key: "id",
        },
    },
    id_metodo_pago: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: MetodoPago,
            key: "id",
        },
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    fecha_pago: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    estado_pago: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pendiente", 
    }
}, {
    tableName: "ventas",
    timestamps: false,
});

// Relaciones
Venta.belongsTo(Cliente, { foreignKey: "id_cliente" });
Venta.belongsTo(Usuario, { foreignKey: "id_usuario" });
Venta.belongsTo(MetodoPago, { foreignKey: "id_metodo_pago" });

module.exports = Venta;
