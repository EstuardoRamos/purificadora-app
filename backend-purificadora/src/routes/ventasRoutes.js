const express = require("express");
const router = express.Router();
const ventaController = require("../controllers/ventaController");

/**
 * @swagger
 * tags:
 *   name: Ventas
 *   description: Endpoints para gestionar ventas, reportes e historial de pagos.
 * components:
 *   schemas:
 *     Venta:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         id_cliente:
 *           type: integer
 *         id_usuario:
 *           type: integer
 *         id_metodo_pago:
 *           type: integer
 *         total:
 *           type: number
 *           format: float
 *         fecha:
 *           type: string
 *           format: date-time
 *         estado_pago:
 *           type: string
 *           enum: [pendiente, pagado]
 *     ProductoVenta:
 *       type: object
 *       required:
 *         - id_producto
 *         - cantidad
 *         - precio
 *       properties:
 *         id_producto:
 *           type: integer
 *         cantidad:
 *           type: integer
 *         precio:
 *           type: number
 *           format: float
 *     CrearVentaRequest:
 *       type: object
 *       required:
 *         - id_cliente
 *         - id_usuario
 *         - id_metodo_pago
 *         - productos
 *       properties:
 *         id_cliente:
 *           type: integer
 *         id_usuario:
 *           type: integer
 *         id_metodo_pago:
 *           type: integer
 *         productos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductoVenta'
 *     ActualizarEstadoPagoRequest:
 *       type: object
 *       required:
 *         - estado_pago
 *       properties:
 *         estado_pago:
 *           type: string
 *           enum: [pendiente, pagado]
 */

// Registrar una nueva venta
/**
 * @swagger
 * /api/ventas:
 *   post:
 *     tags: [Ventas]
 *     summary: Registrar una nueva venta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearVentaRequest'
 *     responses:
 *       201:
 *         description: Venta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 venta:
 *                   $ref: '#/components/schemas/Venta'
 *       400:
 *         description: Inventario insuficiente o datos inválidos
 *       500:
 *         description: Error inesperado al crear la venta
 */
router.post("/", ventaController.createVenta);

// Listar todas las ventas
/**
 * @swagger
 * /api/ventas:
 *   get:
 *     tags: [Ventas]
 *     summary: Listar todas las ventas
 *     responses:
 *       200:
 *         description: Listado de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Venta'
 *       500:
 *         description: Error inesperado al listar ventas
 */
router.get("/", ventaController.getAllVentas);

// Listar ventas por usuario
/**
 * @swagger
 * /api/ventas/usuario/{id_usuario}:
 *   get:
 *     tags: [Ventas]
 *     summary: Listar ventas por usuario
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial (opcional)
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final (opcional)
 *     responses:
 *       200:
 *         description: Ventas asociadas al usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Venta'
 *       404:
 *         description: No se encontraron ventas para el usuario
 *       500:
 *         description: Error inesperado al consultar ventas
 */
router.get("/usuario/:id_usuario", ventaController.getVentasByUsuario);

// Listar ventas por cliente
/**
 * @swagger
 * /api/ventas/cliente/{id_cliente}:
 *   get:
 *     tags: [Ventas]
 *     summary: Listar ventas por cliente
 *     parameters:
 *       - in: path
 *         name: id_cliente
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Ventas asociadas al cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Venta'
 *       404:
 *         description: No se encontraron ventas para el cliente
 *       500:
 *         description: Error inesperado al consultar ventas
 */
router.get("/cliente/:id_cliente", ventaController.getVentasByCliente);
router.get("/cliente/:id_cliente/ultima", ventaController.getUltimaVentaByCliente);

// Listar ventas por fecha o rango de fechas
/**
 * @swagger
 * /api/ventas/fecha:
 *   get:
 *     tags: [Ventas]
 *     summary: Listar ventas por rango de fechas
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Ventas encontradas dentro del rango
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Venta'
 *       400:
 *         description: Se requieren ambas fechas
 *       404:
 *         description: No se encontraron ventas
 *       500:
 *         description: Error inesperado al consultar ventas
 */
router.get("/fecha", ventaController.getVentasByFecha);

/**
 * @swagger
 * /api/ventas/pendientes:
 *   get:
 *     tags: [Ventas]
 *     summary: Listar ventas con estado pendiente
 *     responses:
 *       200:
 *         description: Ventas pendientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Venta'
 *       404:
 *         description: No hay ventas pendientes
 *       500:
 *         description: Error inesperado al consultar ventas
 */
router.get('/pendientes', ventaController.getVentasPendientes);

/**
 * @swagger
 * /api/ventas/{id}/estado:
 *   put:
 *     tags: [Ventas]
 *     summary: Actualizar el estado de pago de una venta
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la venta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizarEstadoPagoRequest'
 *     responses:
 *       200:
 *         description: Estado de pago actualizado
 *       404:
 *         description: Venta no encontrada
 *       500:
 *         description: Error inesperado al actualizar el estado
 */
router.put('/:id/estado', ventaController.actualizarEstadoPago);

//router.get('/reporte-semanal', ventaController.getReporteSemanal);
/**
 * @swagger
 * /api/ventas/reporte:
 *   get:
 *     tags: [Ventas]
 *     summary: Obtener reporte de ventas por rango de fechas
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Reporte detallado de ventas
 *       400:
 *         description: Fechas requeridas
 *       500:
 *         description: Error inesperado al generar el reporte
 */
router.get("/reporte", ventaController.getReportePorFechas);

/**
 * @swagger
 * /api/ventas/reporte-semanal:
 *   get:
 *     tags: [Ventas]
 *     summary: Obtener resumen semanal por fechas
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Resumen semanal con totales
 *       400:
 *         description: Fechas requeridas
 *       500:
 *         description: Error inesperado al generar el reporte
 */
router.get('/reporte-semanal', ventaController.getReporteSemanalPorFechas);

/**
 * @swagger
 * /api/ventas/reporte-ingresos:
 *   get:
 *     tags: [Ventas]
 *     summary: Obtener reporte de ingresos por fechas
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Resumen de ingresos y créditos
 *       400:
 *         description: Fechas requeridas
 *       500:
 *         description: Error inesperado al generar el reporte
 */
router.get('/reporte-ingresos', ventaController.getReporteIngresosPorFechas);

/**
 * @swagger
 * /api/ventas/{id}:
 * delete:
 * tags: [Ventas]
 * summary: Eliminar una venta y restaurar stock al inventario
 * description: Elimina la venta por su ID, borra sus detalles y suma las cantidades de productos de vuelta al inventario.
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID de la venta a eliminar
 * responses:
 * 200:
 * description: Venta eliminada y stock restaurado con éxito
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * 404:
 * description: La venta no existe
 * 500:
 * description: Error interno al procesar la eliminación
 */
router.delete("/:id", ventaController.deleteVenta);
module.exports = router;
