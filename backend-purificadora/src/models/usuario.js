const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const TipoUsuario = require("./tipoUsuario");

const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
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
    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: "El correo no puede ser nulo" },
        notEmpty: { msg: "El correo no puede estar vacío" },
        isEmail: { msg: "Debe ser un correo electrónico válido" },
      },
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
    tipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TipoUsuario,
        key: "id",
      },
      validate: {
        notNull: { msg: "El tipo de usuario no puede ser nulo" },
      },
    },
    contrasena: {
      type: DataTypes.STRING(100),
      field: "contrasena",
      allowNull: false,
      validate: {
        notNull: { msg: "La contraseña no puede ser nula" },
        notEmpty: { msg: "La contraseña no puede estar vacía" },
      },
    },
    fecha_de_nacimiento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "usuario",
    timestamps: false, // No se utilizarán `createdAt` y `updatedAt`
  }
);

// Definición de la relación
Usuario.belongsTo(TipoUsuario, { foreignKey: "tipo" });

module.exports = Usuario;
