const Producto = require("../models/producto");

// Obtener todos los productos
exports.getAllProductos = async (req, res) => {
    try {
        const productos = await Producto.findAll({ include: "Categoria" });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
    const { id } = req.params;
    try {
        const producto = await Producto.findByPk(id, { include: "Categoria" });
        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
    const { nombre, descripcion, precio, estado, id_categoria } = req.body;
    try {
        // Crear el producto
        const producto = await Producto.create({
            nombre,
            descripcion,
            precio,
            estado,
            id_categoria,
        });

        // Crear automáticamente una entrada en inventario
        await Inventario.create({
            id_producto: producto.id_producto,
            cantidad: 0, // Inicia con 0 cantidad por defecto
        });

        res.status(201).json({ message: "Producto creado con éxito", producto });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un producto por ID
exports.updateProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, estado, id_categoria } = req.body;
    try {
        const producto = await Producto.findByPk(id);
        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        await producto.update({
            nombre,
            descripcion,
            precio,
            estado,
            id_categoria,
        });
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un producto por ID
exports.deleteProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const producto = await Producto.findByPk(id);
        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        await producto.destroy();
        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
