require("dotenv").config();
const express = require("express");
const { sequelize } = require("./config/database");
const usuarioRoutes = require("./routes/usuarioRoutes");
const clienteRoutes = require("./routes/clienteRoutes");

const app = express();

// Middleware para analizar JSON
app.use(express.json());

// Rutas
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/clientes", clienteRoutes);

// Sincronización de Sequelize con la base de datos
sequelize.sync()
    .then(() => console.log("Sincronización de modelos exitosa"))
    .catch(err => console.error("Error al sincronizar los modelos:", err));

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
