const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Aldea = require("./aldea");

const Cliente = sequelize.define("Cliente", {
    id_cliente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: { msg: "El nombre no puede ser nulo" },
            notEmpty: { msg: "El nombre no puede estar vacío" },
        },
    },
    ruta: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    credito: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    estado: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    direccion: {
        type: DataTypes.STRING(200),
        allowNull: true,
    },
    telefono: {
        type: DataTypes.STRING(15),
        allowNull: true,
        validate: {
            is: {
                args: /^[0-9]+$/,
                msg: "El teléfono solo puede contener números",
            },
        },
    },
    coordenadas: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    garrafones_prestados: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    id_aldea: {
        type: DataTypes.INTEGER,
        references: {
            model: Aldea,
            key: "id_aldea",
        },
    },
}, {
    tableName: "cliente",
    timestamps: false, // No usar `createdAt` y `updatedAt`
});

// Relación con la tabla `Aldea`
Cliente.belongsTo(Aldea, { foreignKey: "id_aldea" });

module.exports = Cliente;
