const express = require("express");
const router = express.Router();
const productoController = require("../controllers/productoController");

router.get("/", productoController.getAllProductos);
router.get("/:id", productoController.getProductoById);
router.post("/", productoController.createProducto);
router.put("/:id", productoController.updateProducto);
router.delete("/:id", productoController.deleteProducto);

//Listar productos por categoría
router.get("/categoria/:id_categoria", productoController.getProductosByCategoria);


module.exports = router;
