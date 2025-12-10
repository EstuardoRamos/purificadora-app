const Venta = require("../models/venta");
const DetalleVenta = require("../models/detalleVenta");
const Inventario = require("../models/inventario");
const Cliente = require("../models/cliente");
const Usuario = require("../models/usuario");
const MetodoPago = require("../models/metodoPago");
const { parseISO, format } = require('date-fns');
const { es } = require('date-fns/locale');

exports.createVenta = async (req, res) => {
    const { id_cliente, id_usuario, id_metodo_pago, productos } = req.body;

    try {
        // Calcular el total de la venta
        let total = 0;
        for (const producto of productos) {
            total += producto.cantidad * producto.precio;
        }

        // Crear la venta
        const venta = await Venta.create({
            id_cliente,
            id_usuario,
            id_metodo_pago,
            total,
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
        if (id_metodo_pago === 3) { // Asumiendo que el ID 3 es "Crédito"
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
    try {
        const ventas = await Venta.findAll({
            where: { id_usuario },
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
      }
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

exports.getReporteSemanalPorFechas = async (req, res) => {
    try {
        const { desde, hasta } = req.query;

        if (!desde || !hasta) {
            return res.status(400).json({ error: 'Debe proporcionar las fechas "desde" y "hasta".' });
        }

        const fechaDesde = new Date(desde);
        const fechaHasta = new Date(hasta);
        fechaHasta.setHours(23, 59, 59, 999); // <- ¡Esto es clave!

        const ventas = await Venta.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaDesde, fechaHasta]
                }
            },
            order: [['fecha', 'ASC']]
        });

        const resumen = {};
        let totalVentas = 0;
        let totalCredito = 0;
        let totalEntregas = 0;

        for (const venta of ventas) {
            const fechaVenta = new Date(venta.fecha);
            const fechaStr = format(fechaVenta, 'yyyy-MM-dd');
            const diaNombre = format(fechaVenta, 'EEEE', { locale: es });

            if (!resumen[fechaStr]) {
                resumen[fechaStr] = {
                    dia: diaNombre,
                    fecha: fechaStr,
                    ventas: 0,
                    credito: 0,
                    entrega_total: 0,
                    garrafones_en_planta: 110
                };
            }

            resumen[fechaStr].ventas += 1;
            resumen[fechaStr].entrega_total += 1;
            totalVentas += 1;
            totalEntregas += 1;

            if (venta.estado_pago === 'pendiente') {
                resumen[fechaStr].credito += 1;
                totalCredito += 1;
            }
        }

        return res.json({
            resumen,
            total: {
                ventas: totalVentas,
                credito: totalCredito,
                entrega_total: totalEntregas
            }
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
        fechaHasta.setHours(23, 59, 59, 999); // incluir todo el día final

        const ventas = await Venta.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaDesde, fechaHasta]
                }
            },
            order: [['fecha', 'ASC']]
        });

        const resumen = {};
        let totalVentas = 0;
        let totalCredito = 0;
        let ingresoTotal = 0;

        for (const venta of ventas) {
    const fechaVenta = new Date(venta.fecha);
    const fechaStr = format(fechaVenta, 'yyyy-MM-dd');
    const diaNombre = format(fechaVenta, 'EEEE', { locale: es });

    if (!resumen[fechaStr]) {
        resumen[fechaStr] = {
            dia: diaNombre,
            fecha: fechaStr,
            vendidos: 0,     // cantidad de ventas
            ventas: 0,        // total vendido
            creditos: 0,      // total en crédito
            ingreso: 0        // SOLO lo pagado
        };
    }

    const monto = parseFloat(venta.total);

    // Cantidad de ventas
    resumen[fechaStr].vendidos += 1;

    // Total vendido (pagado + crédito)
    resumen[fechaStr].ventas += monto;

    // Totales globales
    totalVentas += monto;

    if (venta.estado_pago === 'pagado') {
        resumen[fechaStr].ingreso += monto;
        ingresoTotal += monto;
    } else if (venta.estado_pago === 'pendiente') {
        
        resumen[fechaStr].creditos += monto;
        totalCredito += monto;
    }
}

        return res.json({
            resumen,
            totales: {
                ingresos: ingresoTotal,
                creditos: totalCredito,
                vendidos: totalVentas
            }
        });

    } catch (error) {
        console.error("Error generando reporte de ingresos:", error);
        return res.status(500).json({ error: "Error generando reporte de ingresos" });
    }
};