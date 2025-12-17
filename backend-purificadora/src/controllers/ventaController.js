const Venta = require("../models/venta");
const DetalleVenta = require("../models/detalleVenta");
const Inventario = require("../models/inventario");
const Cliente = require("../models/cliente");
const Usuario = require("../models/usuario");
const MetodoPago = require("../models/metodoPago");
const { parseISO, format } = require('date-fns');
const { es } = require('date-fns/locale');
const { sequelize } = require("../config/database");

const CREDIT_PAYMENT_METHOD_ID = Number(process.env.CREDIT_PAYMENT_METHOD_ID || 2);

const quitarAcentos = (texto = "") =>
    texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const esVentaCredito = (venta) => {
    const metodoId = Number(venta.id_metodo_pago);
    if (!Number.isNaN(metodoId) && metodoId === CREDIT_PAYMENT_METHOD_ID) {
        return true;
    }

    const metodoNombre = quitarAcentos(venta.MetodoPago?.metodo?.toLowerCase?.() || "");
    if (metodoNombre.includes("credi")) {
        return true;
    }

    if (venta.fecha && venta.fecha_pago) {
        const fechaVenta = new Date(venta.fecha);
        const fechaPago = new Date(venta.fecha_pago);
        if (!Number.isNaN(fechaVenta.getTime()) && !Number.isNaN(fechaPago.getTime())) {
            return fechaPago.getTime() !== fechaVenta.getTime();
        }
    }

    return false;
};

exports.createVenta = async (req, res) => {
    const { id_cliente, id_usuario, id_metodo_pago, productos } = req.body;

    try {
        // Calcular el total de la venta
        let total = 0;
        for (const producto of productos) {
            total += producto.cantidad * producto.precio;
        }

        const esCredito = Number(id_metodo_pago) === CREDIT_PAYMENT_METHOD_ID;
        const fechaActual = new Date();

        // Crear la venta
        const venta = await Venta.create({
            id_cliente,
            id_usuario,
            id_metodo_pago,
            total,
            estado_pago: esCredito ? "pendiente" : "pagado",
            fecha_pago: esCredito ? null : fechaActual,
        });

        // Registrar los detalles de la venta
        for (const producto of productos) {
            const { id_producto, cantidad, precio } = producto;

            // Verificar el inventario
            const inventario = await Inventario.findOne({ where: { id_producto } });
            if (!inventario || inventario.cantidad < cantidad) {
                return res.status(400).json({ error: `Inventario insuficiente para el producto ID ${id_producto}` });
            }

            // Reducir el inventario
            inventario.cantidad -= cantidad;
            await inventario.save();

            // Crear detalle de la venta
            await DetalleVenta.create({
                id_venta: venta.id,
                id_producto,
                cantidad,
                subtotal: cantidad * precio,
            });
        }

        // Si el método de pago es crédito, actualizar el cliente
        if (esCredito) { // Asumiendo que el ID 3 es "Crédito"
            const cliente = await Cliente.findByPk(id_cliente);
            if (cliente) {
                cliente.credito = true;
                await cliente.save();
            }
        }

        res.status(201).json({ message: "Venta registrada con éxito", venta });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.getAllVentas = async (req, res) => {
    try {
        const ventas = await Venta.findAll({
            include: [
                {
                    model: Cliente,
                    as: "Cliente",
                    attributes: ["id_cliente", "nombre"],
                },
                {
                    model: Usuario,
                    as: "Usuario",
                    attributes: ["id", "nombre"],
                },
                {
                    model: MetodoPago,
                    as: "MetodoPago", // Asegúrate de que el alias sea el mismo que en el modelo
                    attributes: ["id", "metodo"], // Traemos el nombre de la forma de pago
                },
            ],
        });

        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVentasByUsuario = async (req, res) => {
    const { id_usuario } = req.params;
    const { desde, hasta } = req.query;

    const where = { id_usuario };

    if (desde && hasta) {
        where.fecha = {
            [Op.between]: [new Date(`${desde} 00:00:00`), new Date(`${hasta} 23:59:59`)],
        };
    }

    try {
        const ventas = await Venta.findAll({
            where,
            include: [
                { model: Cliente, as: "Cliente", attributes: ["id_cliente", "nombre"] },
                { model: Usuario, as: "Usuario", attributes: ["id", "nombre"] },
                { model: MetodoPago, as: "MetodoPago", attributes: ["id", "metodo"] },
            ],
        });

        if (ventas.length === 0) {
            return res.status(404).json({ error: "No se encontraron ventas para este usuario" });
        }

        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVentasByCliente = async (req, res) => {
    const { id_cliente } = req.params;
    try {
        const ventas = await Venta.findAll({
            where: { id_cliente },
            include: [
                { model: Cliente, as: "Cliente", attributes: ["id_cliente", "nombre"] },
                { model: Usuario, as: "Usuario", attributes: ["id", "nombre"] },
                { model: MetodoPago, as: "MetodoPago", attributes: ["id", "metodo"] },
            ],
        });

        if (ventas.length === 0) {
            return res.status(404).json({ error: "No se encontraron ventas para este cliente" });
        }

        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUltimaVentaByCliente = async (req, res) => {
    const { id_cliente } = req.params;

    try {
        const venta = await Venta.findOne({
            where: { id_cliente },
            attributes: ["id", "fecha", "fecha_pago", "estado_pago", "total"],
            include: [
                { model: Cliente, as: "Cliente", attributes: ["id_cliente", "nombre"] },
            ],
            order: [["fecha", "DESC"]],
        });

        if (!venta) {
            return res.status(404).json({ error: "El cliente no tiene ventas registradas" });
        }

        res.json(venta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const { Op, fn, col, literal } = require("sequelize");


exports.getVentasByFecha = async (req, res) => {
    const { fecha_inicio, fecha_fin } = req.query;

    try {
        // Validar que las fechas sean válidas
        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({ error: "Debe proporcionar ambas fechas: fecha_inicio y fecha_fin" });
        }

        // Construir la consulta con el rango de fechas
        const whereClause = {
            fecha: {
                [Op.between]: [`${fecha_inicio} 00:00:00`, `${fecha_fin} 23:59:59`], // Asegurar rango completo del día
            },
        };

        // Buscar ventas
        const ventas = await Venta.findAll({
            where: whereClause,
            include: [
                { model: Cliente, as: "Cliente", attributes: ["id_cliente", "nombre"] },
                { model: Usuario, as: "Usuario", attributes: ["id", "nombre"] },
                { model: MetodoPago, as: "MetodoPago", attributes: ["id", "metodo"] },
            ],
        });

        if (ventas.length === 0) {
            return res.status(404).json({ error: "No se encontraron ventas en el rango de fechas proporcionado" });
        }

        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.actualizarEstadoPago = async (req, res) => {
  const { id } = req.params;
  const { estado_pago } = req.body;

  try {
    const venta = await Venta.findByPk(id);
    if (!venta) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    venta.estado_pago = estado_pago;
    venta.fecha_pago = estado_pago === "pagado" ? new Date() : null;
    await venta.save();

    res.json({ message: "Estado de pago actualizado", venta });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVentasPendientes = async (req, res) => {
    try {
        const ventasPendientes = await Venta.findAll({
            where: {
                estado_pago: 'pendiente'
            },
            include: [
                { model: Cliente, as: "Cliente", attributes: ["id_cliente", "nombre", "telefono"] },
                { model: Usuario, as: "Usuario", attributes: ["id", "nombre"] },
            ],
            order: [["fecha", "ASC"]],
        });

        if (ventasPendientes.length === 0) {
            return res.status(404).json({ error: "No hay ventas pendientes" });
        }

        res.json(ventasPendientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getReportePorFechas = async (req, res) => {
    const { desde, hasta } = req.query;

    if (!desde || !hasta) {
        return res.status(400).json({ error: "Debe proporcionar las fechas 'desde' y 'hasta'" });
    }

    try {
        const ventas = await Venta.findAll({
            where: {
                fecha: {
                    [Op.between]: [new Date(desde), new Date(hasta)]
                }
            },
            include: [
                { model: Cliente, attributes: ["nombre", "direccion", "telefono"] },
                { model: Usuario, attributes: ["nombre"] },
                { model: MetodoPago, attributes: ["metodo"] }
            ],
            order: [['fecha', 'ASC']]
        });

        res.json(ventas);
    } catch (error) {
        console.error("Error al obtener reporte por fechas:", error);
        res.status(500).json({ error: "Error interno al generar el reporte" });
    }
};

const buildRangoFechasWhere = (fechaDesde, fechaHasta) => ({
    [Op.or]: [
        {
            estado_pago: "pagado",
            fecha_pago: {
                [Op.between]: [fechaDesde, fechaHasta],
            },
        },
        {
            estado_pago: "pagado",
            fecha_pago: {
                [Op.is]: null,
            },
            fecha: {
                [Op.between]: [fechaDesde, fechaHasta],
            },
        },
        {
            estado_pago: "pendiente",
            fecha: {
                [Op.between]: [fechaDesde, fechaHasta],
            },
        },
    ],
});

exports.getReporteSemanalPorFechas = async (req, res) => {
    try {
        const { desde, hasta } = req.query;

        if (!desde || !hasta) {
            return res.status(400).json({ error: 'Debe proporcionar las fechas "desde" y "hasta".' });
        }

        const fechaDesde = new Date(desde);
        const fechaHasta = new Date(hasta);
        fechaHasta.setHours(23, 59, 59, 999);

        const ventas = await Venta.findAll({
            where: buildRangoFechasWhere(fechaDesde, fechaHasta),
            order: [
                ["fecha_pago", "ASC"],
                ["fecha", "ASC"],
            ],
            include: [
                {
                    model: MetodoPago,
                    attributes: ["id", "metodo"],
                },
            ],
        });

        const resumen = {};
        const ventaIdToFecha = {};
        let totalVentas = 0;
        let totalCredito = 0;
        let totalEntregas = 0;

        for (const venta of ventas) {
            const fechaPago = venta.fecha_pago ? new Date(venta.fecha_pago) : null;
            const fechaVenta = fechaPago && !isNaN(fechaPago) ? fechaPago : new Date(venta.fecha);
            const fechaStr = format(fechaVenta, "yyyy-MM-dd");
            const diaNombre = format(fechaVenta, "EEEE", { locale: es });

            if (!resumen[fechaStr]) {
                resumen[fechaStr] = {
                    dia: diaNombre,
                    fecha: fechaStr,
                    ventas: 0,
                    credito: 0,
                    entrega_total: 0,
                    garrafones_en_planta: 110,
                };
            }

            resumen[fechaStr].entrega_total += 1;
            totalEntregas += 1;

            if (venta.estado_pago === "pendiente") {
                resumen[fechaStr].credito += 1;
                totalCredito += 1;
            } else {
                resumen[fechaStr].ventas += 1;
                totalVentas += 1;
            }
        }

        return res.json({
            resumen,
            total: {
                ventas: totalVentas,
                credito: totalCredito,
                entrega_total: totalEntregas,
            },
        });
    } catch (error) {
        console.error("Error generando reporte semanal:", error);
        return res.status(500).json({ error: "Error generando reporte semanal" });
    }
};

exports.getReporteIngresosPorFechas = async (req, res) => {
    try {
        const { desde, hasta } = req.query;

        if (!desde || !hasta) {
            return res.status(400).json({ error: 'Debe proporcionar las fechas "desde" y "hasta".' });
        }

        const fechaDesde = new Date(desde);
        const fechaHasta = new Date(hasta);
        fechaHasta.setHours(23, 59, 59, 999);

        const ventas = await Venta.findAll({
            where: buildRangoFechasWhere(fechaDesde, fechaHasta),
            order: [
                ["fecha_pago", "ASC"],
                ["fecha", "ASC"],
            ],
            include: [
                {
                    model: MetodoPago,
                    attributes: ["id", "metodo"],
                },
            ],
        });

        const resumen = {};
        const ventaIdToFecha = {};

        let totalVentasPagadas = 0;
        let totalCreditosCobrados = 0;
        let totalCreditosPagados = 0;
        let ingresoTotal = 0;

        for (const venta of ventas) {
            if (venta.estado_pago !== "pagado") {
                continue;
            }

            const fechaPago = venta.fecha_pago ? new Date(venta.fecha_pago) : null;
            const pagoEnRango = fechaPago && fechaPago >= fechaDesde && fechaPago <= fechaHasta;
            const fechaBase = pagoEnRango ? fechaPago : new Date(venta.fecha);
            const fechaStr = format(fechaBase, "yyyy-MM-dd");
            const diaNombre = format(fechaBase, "EEEE", { locale: es });

            if (!resumen[fechaStr]) {
                resumen[fechaStr] = {
                    dia: diaNombre,
                    fecha: fechaStr,
                    vendidos: 0,
                    ventas: 0,
                    creditos: 0,
                    creditos_monto: 0,
                    ingreso: 0,
                };
            }

            ventaIdToFecha[venta.id] = fechaStr;

            const monto = parseFloat(venta.total) || 0;
            const esCredito = esVentaCredito(venta);

            if (esCredito) {
                resumen[fechaStr].creditos += 1;
                resumen[fechaStr].creditos_monto += monto;
                totalCreditosPagados += 1;
                totalCreditosCobrados += monto;
            } else {
                resumen[fechaStr].ventas += monto;
                totalVentasPagadas += monto;
            }

            resumen[fechaStr].ingreso = resumen[fechaStr].ventas + resumen[fechaStr].creditos_monto;
            ingresoTotal += monto;
        }

        const ventaIds = ventas.map((venta) => venta.id);
        if (ventaIds.length > 0) {
            const detalles = await DetalleVenta.findAll({
                where: {
                    id_venta: ventaIds,
                },
                attributes: ["id_venta", [sequelize.fn("SUM", sequelize.col("cantidad")), "total_cantidad"]],
                group: ["id_venta"],
                raw: true,
            });

            detalles.forEach(({ id_venta, total_cantidad }) => {
                const fechaStr = ventaIdToFecha[id_venta];
                if (!fechaStr || !resumen[fechaStr]) {
                    return;
                }
                resumen[fechaStr].vendidos += Number(total_cantidad) || 0;
            });
        }

        return res.json({
            resumen,
            totales: {
                ingresos: ingresoTotal,
                creditos_pagados: totalCreditosPagados,
                creditos_monto: totalCreditosCobrados,
                ventas_monto: totalVentasPagadas,
            },
        });
    } catch (error) {
        console.error("Error generando reporte de ingresos:", error);
        return res.status(500).json({ error: "Error generando reporte de ingresos" });
    }
};
