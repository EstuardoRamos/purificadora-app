const Inventario = require("../models/inventario");
const RegistroInventario = require("../models/registroInventario");

// Obtener el inventario de todos los productos
exports.getAllInventario = async (req, res) => {
    try {
        const inventario = await Inventario.findAll({ include: "Producto" });
        res.json(inventario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar cantidad en inventario y registrar movimiento
exports.updateInventario = async (req, res) => {
    const { id_producto } = req.params;
    const { cantidad, id_usuario } = req.body;

    try {
        const inventario = await Inventario.findOne({ where: { id_producto } });

        if (!inventario) {
            return res.status(404).json({ error: "Producto no encontrado en inventario" });
        }

        // Actualizar la cantidad en el inventario
        inventario.cantidad += cantidad;
        await inventario.save();

        // Registrar el movimiento en el registro de inventario
        await RegistroInventario.create({
            id_producto,
            cantidad,
            id_usuario,
        });

        res.json({ message: "Inventario actualizado exitosamente", inventario });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
