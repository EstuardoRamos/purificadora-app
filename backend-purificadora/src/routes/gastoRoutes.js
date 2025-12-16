const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastoController');

/**
 * @swagger
 * tags:
 *   name: Gastos
 *   description: Gestión de gastos operativos
 * components:
 *   schemas:
 *     Gasto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         gasto:
 *           type: string
 *         valor:
 *           type: number
 *         fecha:
 *           type: string
 *           format: date
 *         observacion:
 *           type: string
 *     CrearGastoRequest:
 *       type: object
 *       required: [gasto, valor, fecha]
 *       properties:
 *         gasto:
 *           type: string
 *         valor:
 *           type: number
 *         fecha:
 *           type: string
 *           format: date
 *         observacion:
 *           type: string
 */

/**
 * @swagger
 * /api/gastos:
 *   post:
 *     tags: [Gastos]
 *     summary: Registrar un gasto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearGastoRequest'
 *     responses:
 *       201:
 *         description: Gasto creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gasto'
 *       500:
 *         description: Error al crear gasto
 */
router.post('/', gastosController.crearGasto);

/**
 * @swagger
 * /api/gastos:
 *   get:
 *     tags: [Gastos]
 *     summary: Listar gastos
 *     responses:
 *       200:
 *         description: Lista de gastos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Gasto'
 *       500:
 *         description: Error al obtener gastos
 */
router.get('/', gastosController.listarGastos);

/**
 * @swagger
 * /api/gastos/reporte:
 *   get:
 *     tags: [Gastos]
 *     summary: Resumen de gastos por rango de fechas
 *     parameters:
 *       - in: query
 *         name: desde
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: hasta
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Resumen y total de gastos
 *       400:
 *         description: Fechas requeridas
 *       500:
 *         description: Error al obtener reporte
 */
router.get('/reporte', gastosController.gastosPorFechas);
/**
 * @swagger
 * /api/gastos/{id}:
 *   put:
 *     tags: [Gastos]
 *     summary: Actualizar un gasto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gasto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gasto:
 *                 type: string
 *               valor:
 *                 type: number
 *               fecha:
 *                 type: string
 *                 format: date
 *               observacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gasto actualizado
 *       404:
 *         description: Gasto no encontrado
 *       500:
 *         description: Error inesperado
 */
router.put('/:id', gastosController.actualizarGasto);

/**
 * @swagger
 * /api/gastos/{id}:
 *   delete:
 *     tags: [Gastos]
 *     summary: Eliminar un gasto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gasto eliminado
 *       500:
 *         description: Error al eliminar gasto
 */
router.delete('/:id', gastosController.eliminarGasto);

module.exports = router;
