const Categoria = require("../models/categoria");

// Obtener todas las categorías
exports.getAllCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.findAll();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener una categoría por ID
exports.getCategoriaById = async (req, res) => {
    const { id } = req.params;
    try {
        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }
        res.json(categoria);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear una nueva categoría
exports.createCategoria = async (req, res) => {
    const { nombre } = req.body;
    try {
        const categoria = await Categoria.create({ nombre });
        res.status(201).json(categoria);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar una categoría por ID
exports.updateCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }
        await categoria.update({ nombre });
        res.json(categoria);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar una categoría por ID
exports.deleteCategoria = async (req, res) => {
    const { id } = req.params;
    try {
        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }
        await categoria.destroy();
        res.json({ message: "Categoría eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
