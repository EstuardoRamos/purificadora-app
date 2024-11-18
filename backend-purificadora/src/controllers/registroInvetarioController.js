const RegistroInventario = require("../models/registroInventario");

// Obtener el historial completo del registro de inventario
exports.getAllRegistro = async (req, res) => {
    try {
        const registros = await RegistroInventario.findAll({ include: ["Producto", "Usuario"] });
        res.json(registros);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener el registro de inventario por producto
exports.getRegistroByProducto = async (req, res) => {
    const { id_producto } = req.params;

    try {
        const registros = await RegistroInventario.findAll({ where: { id_producto } });
        if (registros.length === 0) {
            return res.status(404).json({ error: "No se encontraron registros para este producto" });
        }
        res.json(registros);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
