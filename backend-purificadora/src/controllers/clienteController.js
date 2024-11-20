const Cliente = require("../models/cliente");

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
            return res.status(404).json({ error: "Cliente no encontrado" });
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
            return res.status(404).json({ error: "Cliente no encontrado" });
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
            return res.status(404).json({ error: "Cliente no encontrado" });
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