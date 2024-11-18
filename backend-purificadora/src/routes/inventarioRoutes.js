const express = require("express");
const router = express.Router();
const inventarioController = require("../controllers/inventarioController");

router.get("/", inventarioController.getAllInventario);               // Obtener todo el inventario
router.put("/:id_producto", inventarioController.updateInventario);  // Actualizar inventario y registrar movimiento

module.exports = router;
