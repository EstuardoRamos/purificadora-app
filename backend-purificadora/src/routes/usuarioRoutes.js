const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Administración de usuarios del sistema
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         correo:
 *           type: string
 *         telefono:
 *           type: string
 *         tipo:
 *           type: integer
 *         fecha_de_nacimiento:
 *           type: string
 *           format: date
 *         activo:
 *           type: boolean
 *     CrearUsuarioRequest:
 *       type: object
 *       required:
 *         - nombre
 *         - correo
 *         - tipo
 *         - contraseña
 *       properties:
 *         nombre:
 *           type: string
 *         correo:
 *           type: string
 *         telefono:
 *           type: string
 *         tipo:
 *           type: integer
 *         contraseña:
 *           type: string
 *         fecha_de_nacimiento:
 *           type: string
 *           format: date
 *         activo:
 *           type: boolean
 */

// Rutas para el CRUD de usuario
/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     tags: [Usuarios]
 *     summary: Crear usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearUsuarioRequest'
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 */
router.post("/", usuarioController.createUsuario);

/**
 * @swagger
 * /api/usuarios/login:
 *   post:
 *     tags: [Usuarios]
 *     summary: Iniciar sesión
 *     responses:
 *       200:
 *         description: Inicio exitoso con token
 */
router.post("/login", usuarioController.loginUsuario);

/**
 * @swagger
 * /api/usuarios/forgot-password:
 *   post:
 *     tags: [Usuarios]
 *     summary: Restablecer contraseña
 */
router.post("/forgot-password", usuarioController.forgotPassword);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     tags: [Usuarios]
 *     summary: Listar usuarios
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get("/", usuarioController.getAllUsuarios);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener usuario por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: No existe
 */
router.get("/:id", usuarioController.getUsuarioById);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     tags: [Usuarios]
 *     summary: Actualizar usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/CrearUsuarioRequest'
 *               - type: object
 *                 properties:
 *                   activo:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put("/:id", usuarioController.updateUsuario);
//router.delete("/:id", usuarioController.deleteUsuario);

/**
 * @swagger
 * /api/usuarios/{id}/change-password:
 *   put:
 *     tags: [Usuarios]
 *     summary: Cambiar contraseña
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       401:
 *         description: Contraseña actual incorrecta
 *       404:
 *         description: Usuario no encontrado
 */
router.put("/:id/change-password", usuarioController.changePassword);

module.exports = router;
