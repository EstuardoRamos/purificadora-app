const Aldea = require("../models/aldea");

// Obtener todas las aldeas
exports.getAllAldeas = async (req, res) => {
    try {
        const aldeas = await Aldea.findAll();
        res.json(aldeas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener una aldea por ID
exports.getAldeaById = async (req, res) => {
    const { id } = req.params;
    try {
        const aldea = await Aldea.findByPk(id);
        if (!aldea) {
            return res.status(404).json({ error: "Aldea no encontrada" });
        }
        res.json(aldea);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear una nueva aldea
exports.createAldea = async (req, res) => {
    const { nombre } = req.body;
    try {
        const aldea = await Aldea.create({ nombre });
        res.status(201).json(aldea);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar una aldea por ID
exports.updateAldea = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        const aldea = await Aldea.findByPk(id);
        if (!aldea) {
            return res.status(404).json({ error: "Aldea no encontrada" });
        }
        await aldea.update({ nombre });
        res.json(aldea);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar una aldea por ID
exports.deleteAldea = async (req, res) => {
    const { id } = req.params;
    try {
        const aldea = await Aldea.findByPk(id);
        if (!aldea) {
            return res.status(404).json({ error: "Aldea no encontrada" });
        }
        await aldea.destroy();
        res.json({ message: "Aldea eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
