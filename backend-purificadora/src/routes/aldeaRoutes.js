const express = require("express");
const router = express.Router();
const aldeaController = require("../controllers/aldeaController");

// Rutas CRUD para aldeas
router.get("/", aldeaController.getAllAldeas);           // Obtener todas las aldeas
router.get("/:id", aldeaController.getAldeaById);       // Obtener una aldea por ID
router.post("/", aldeaController.createAldea);          // Crear una nueva aldea
router.put("/:id", aldeaController.updateAldea);        // Actualizar una aldea por ID
router.delete("/:id", aldeaController.deleteAldea);     // Eliminar una aldea por ID

module.exports = router;
