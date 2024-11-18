const express = require("express");
const router = express.Router();
const registroInventarioController = require("../controllers/registroInventarioController");

router.get("/", registroInventarioController.getAllRegistro);                  // Obtener el historial completo
router.get("/:id_producto", registroInventarioController.getRegistroByProducto); // Obtener registros por producto

module.exports = router;
