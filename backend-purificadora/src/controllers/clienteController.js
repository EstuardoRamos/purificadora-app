const Cliente = require("../models/cliente");
const Aldea = require("../models/aldea");
const { Op } = require("sequelize");

// Obtener todos los clientes
exports.getAllClientes = async (req, res) => {
    try {
        const clientes = await Cliente.findAll({ include: "Aldea" });
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un cliente por ID
exports.getClienteById = async (req, res) => {
    const { id } = req.params;
    try {
        const cliente = await Cliente.findByPk(id);
        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado id" });
        }
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear un nuevo cliente
exports.createCliente = async (req, res) => {
    const { nombre, ruta, credito, estado, direccion, telefono, coordenadas, id_aldea, garrafones_prestados } = req.body;
    try {
        const cliente = await Cliente.create({
            nombre,
            ruta,
            credito,
            estado,
            direccion,
            telefono,
            coordenadas,
            id_aldea,
            garrafones_prestados,
        });
        res.status(201).json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un cliente por ID
exports.updateCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre, ruta, credito, estado, direccion, telefono, coordenadas, id_aldea, garrafones_prestados } = req.body;
    try {
        const cliente = await Cliente.findByPk(id);
        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado update" });
        }
        await cliente.update({
            nombre,
            ruta,
            credito,
            estado,
            direccion,
            telefono,
            coordenadas,
            id_aldea,
            garrafones_prestados,
        });
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un cliente por ID
exports.deleteCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const cliente = await Cliente.findByPk(id);
        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado del" });
        }
        await cliente.destroy();
        res.json({ message: "Cliente eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getClientesByAldea = async (req, res) => {
    const { id_aldea } = req.params;
    try {
        const clientes = await Cliente.findAll({ where: { id_aldea } });
        if (clientes.length === 0) {
            return res.status(404).json({ error: "No se encontraron clientes para esta aldea" });
        }
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener clientes por ruta
exports.getClientesByRuta = async (req, res) => {
    const { ruta } = req.params;
    try {
        const clientes = await Cliente.findAll({ where: { ruta } });
        if (clientes.length === 0) {
            return res.status(404).json({ error: "No se encontraron clientes para esta ruta" });
        }
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getClientesConCredito = async (req, res) => {
    try {
        const clientes = await Cliente.findAll({
            where: {
                credito: {
                    [Op.gt]: 0
                }
            },
            include: ["Aldea"]
        });

        if (clientes.length === 0) {
            return res.status(404).json({ error: "No hay clientes con crédito pendiente." });
        }

        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getReporteClientesPorAldea = async (_req, res) => {
    try {
        const clientes = await Cliente.findAll({
            include: [
                {
                    model: Aldea,
                    as: "Aldea",
                    attributes: ["id_aldea", "nombre"]
                }
            ],
            order: [
                [{ model: Aldea, as: "Aldea" }, "nombre", "ASC"],
                ["nombre", "ASC"]
            ]
        });

        if (clientes.length === 0) {
            return res.json({ totalGeneral: 0, resumen: [] });
        }

        const resumenMap = new Map();

        clientes.forEach((cliente) => {
            const aldea = cliente.Aldea;
            const key = aldea ? aldea.id_aldea : "sin_aldea";

            if (!resumenMap.has(key)) {
                resumenMap.set(key, {
                    id_aldea: aldea ? aldea.id_aldea : null,
                    aldea: aldea ? aldea.nombre : "Sin aldea asignada",
                    totalClientes: 0,
                    clientes: []
                });
            }

            const registro = resumenMap.get(key);
            registro.totalClientes += 1;
            registro.clientes.push({
                id_cliente: cliente.id_cliente,
                nombre: cliente.nombre,
                ruta: cliente.ruta,
                telefono: cliente.telefono,
                credito: cliente.credito,
                estado: cliente.estado,
            });
        });

        const resumen = Array.from(resumenMap.values()).sort((a, b) =>
            a.aldea.localeCompare(b.aldea)
        );

        res.json({
            totalGeneral: clientes.length,
            resumen,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
