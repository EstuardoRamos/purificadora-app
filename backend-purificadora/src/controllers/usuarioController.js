const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");

exports.createUsuario = async (req, res) => {
    const { nombre, correo, telefono, tipo, contraseña, fecha_de_nacimiento, activo = true } = req.body;

    try {
        // Encriptar la contraseña antes de guardar el usuario
        const saltRounds = 10; // Puedes ajustar las rondas de sal para mayor seguridad
        const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

        // Crear el usuario con la contraseña encriptada
        const usuario = await Usuario.create({
            nombre,
            correo,
            telefono,
            tipo,
            contraseña: hashedPassword, // Guardar la contraseña encriptada
            fecha_de_nacimiento,
            activo,
        });

        res.status(201).json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.loginUsuario = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        const usuario = await Usuario.findOne({ where: { correo } });
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        if (usuario.activo === false) {
            return res.status(403).json({ error: "Usuario desactivado" });
        }

        // Verificar la contrasena ingresada con la contrasena encriptada almacenada
        const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!isMatch) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        const payload = {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            tipo: usuario.tipo,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || "purificadora_dev_secret", {
            expiresIn: "8h",
        });

        res.json({ message: "Inicio de sesión exitoso", token, usuario: payload });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUsuarioById = async (req, res) => {
    const { id } = req.params;
    try {
        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre, correo, telefono, tipo, contraseña, fecha_de_nacimiento, activo } = req.body;
    try {
        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        await usuario.update({
            nombre,
            correo,
            telefono,
            tipo,
            contraseña,
            fecha_de_nacimiento,
            ...(activo !== undefined ? { activo } : {}),
        });
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        await usuario.destroy();
        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.changePassword = async (req, res) => {
    const { id } = req.params; // ID del usuario
    const { currentPassword, newPassword } = req.body; // Contraseñas actual y nueva

    try {
        // Buscar el usuario por ID
        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Verificar que la contraseña actual coincida con la almacenada
        const isMatch = await bcrypt.compare(currentPassword, usuario.contraseña);
        if (!isMatch) {
            return res.status(401).json({ error: "La contraseña actual es incorrecta" });
        }

        // Encriptar la nueva contraseña
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar la contraseña en la base de datos
        await usuario.update({ contraseña: hashedNewPassword });

        res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    const { correo, nuevaContraseña } = req.body;

    if (!correo || !nuevaContraseña) {
        return res.status(400).json({ error: "Debe proporcionar el correo y la nueva contraseña" });
    }

    try {
        const usuario = await Usuario.findOne({ where: { correo } });
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);
        await usuario.update({ contraseña: hashedPassword });

        res.json({ message: "Contraseña actualizada. Ahora puede iniciar sesión con la nueva contraseña." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
