const express = require("express");
const router = express.Router();
const ventaController = require("../controllers/ventaController");

// Registrar una nueva venta
router.post("/", ventaController.createVenta);

// Listar todas las ventas
router.get("/", ventaController.getAllVentas);

// Listar ventas por usuario
router.get("/usuario/:id_usuario", ventaController.getVentasByUsuario);

// Listar ventas por cliente
router.get("/cliente/:id_cliente", ventaController.getVentasByCliente);

// Listar ventas por fecha o rango de fechas
router.get("/fecha", ventaController.getVentasByFecha);

router.get('/pendientes', ventaController.getVentasPendientes);
router.put('/:id/estado', ventaController.actualizarEstadoPago);

//router.get('/reporte-semanal', ventaController.getReporteSemanal);
router.get("/reporte", ventaController.getReportePorFechas);

router.get('/reporte-semanal', ventaController.getReporteSemanalPorFechas);
router.get('/reporte-ingresos', ventaController.getReporteIngresosPorFechas);

module.exports = router;
