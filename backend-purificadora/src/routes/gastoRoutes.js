const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastoController');

/**
 * @swagger
 * tags:
 *   name: Gastos
 *   description: Gestión de gastos operativos
 */

router.post('/', gastosController.crearGasto);
router.get('/', gastosController.listarGastos);
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
router.delete('/:id', gastosController.eliminarGasto);

module.exports = router;
