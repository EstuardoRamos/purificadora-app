const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");

// Rutas para el CRUD de usuario
router.post("/", usuarioController.createUsuario);
router.post("/login", usuarioController.loginUsuario);
router.post("/forgot-password", usuarioController.forgotPassword);
router.get("/", usuarioController.getAllUsuarios);
router.get("/:id", usuarioController.getUsuarioById);
router.put("/:id", usuarioController.updateUsuario);
//router.delete("/:id", usuarioController.deleteUsuario);

router.put("/:id/change-password", usuarioController.changePassword);

module.exports = router;
