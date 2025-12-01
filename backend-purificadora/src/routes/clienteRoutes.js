const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");

// Rutas CRUD para clientes
router.get("/", clienteController.getAllClientes);           // Obtener todos los clientes
router.get('/credito', clienteController.getClientesConCredito);
router.get("/:id", clienteController.getClienteById);       // Obtener un cliente por ID
router.post("/", clienteController.createCliente);          // Crear un nuevo cliente
router.put("/:id", clienteController.updateCliente);        // Actualizar un cliente por ID
router.delete("/:id", clienteController.deleteCliente);     // Eliminar un cliente por ID


module.exports = router;
