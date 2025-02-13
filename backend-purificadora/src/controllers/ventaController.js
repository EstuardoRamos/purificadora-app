const Venta = require("../models/venta");
const DetalleVenta = require("../models/detalleVenta");
const Inventario = require("../models/inventario");
const Cliente = require("../models/cliente");
const Usuario = require("../models/usuario");
const MetodoPago = require("../models/metodoPago");

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
const { Op } = require("sequelize");


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



