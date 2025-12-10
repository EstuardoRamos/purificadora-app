require("dotenv").config();
const express = require("express");
const { sequelize } = require("./config/database");
const cors = require("cors"); // Importar cors
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const usuarioRoutes = require("./routes/usuarioRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const productoRoutes = require("./routes/productoRoutes")
const categoriaRoutes = require("./routes/categoriaRoutes")
const aldeaRoutes = require("./routes/aldeaRoutes")
const inventarioRoutes = require("./routes/inventarioRoutes")
const registroInventarioRoutes = require("./routes/registroInventarioRoutes")
const ventasRoutes = require("./routes/ventasRoutes")
const gastoRoutes = require("./routes/gastoRoutes")

const app = express();

// Middleware para analizar JSON
app.use(express.json());

app.use(cors({ origin: "http://localhost:4200" }));

// Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// Rutas
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/aldeas", aldeaRoutes);
app.use("/api/inventarios", inventarioRoutes);
app.use("/api/registroInventarios", registroInventarioRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/gastos", gastoRoutes);

// Sincronización de Sequelize con la base de datos
sequelize.sync()  
  .then(() => console.log("Sincronización de modelos exitosa"))
  .catch(err => console.error("Error al sincronizar los modelos:", err));

// Iniciar el servidor
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
