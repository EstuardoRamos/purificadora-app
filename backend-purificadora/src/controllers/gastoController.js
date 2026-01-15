const Gasto = require('../models/gastos');
const { Op } = require('sequelize');

exports.crearGasto = async (req, res) => {
    try {
        // Ajuste de zona horaria para Guatemala (UTC-6)
        // Forzamos que la fecha se guarde a las 06:00 UTC (00:00 Guatemala)
        // Esto evita que al visualizarse se reste un día por la zona horaria
        if (req.body.fecha) {
            const fechaStr = typeof req.body.fecha === 'string' ? req.body.fecha.split('T')[0] : new Date(req.body.fecha).toISOString().split('T')[0];
            req.body.fecha = new Date(`${fechaStr}T06:00:00.000Z`);
        }

        const nuevo = await Gasto.create(req.body);
        res.status(201).json(nuevo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear gasto' });
    }
};

exports.listarGastos = async (req, res) => {
    try {
        const gastos = await Gasto.findAll({ order: [['fecha', 'DESC']] });
        res.json(gastos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener gastos' });
    }
};

exports.eliminarGasto = async (req, res) => {
    try {
        const { id } = req.params;
        await Gasto.destroy({ where: { id } });
        res.json({ mensaje: 'Gasto eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar gasto' });
    }
};

exports.actualizarGasto = async (req, res) => {
    try {
        const { id } = req.params;
        const gasto = await Gasto.findByPk(id);

        if (!gasto) {
            return res.status(404).json({ error: 'Gasto no encontrado' });
        }

        const camposPermitidos = ['gasto', 'valor', 'fecha', 'observacion'];
        camposPermitidos.forEach((campo) => {
            if (req.body[campo] !== undefined) {
                // Aplicar la misma corrección de fecha al actualizar
                if (campo === 'fecha' && req.body.fecha) {
                    const fechaStr = typeof req.body.fecha === 'string' ? req.body.fecha.split('T')[0] : new Date(req.body.fecha).toISOString().split('T')[0];
                    req.body.fecha = new Date(`${fechaStr}T06:00:00.000Z`);
                }
                gasto[campo] = req.body[campo];
            }
        });

        await gasto.save();

        res.json(gasto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar gasto' });
    }
};

exports.gastosPorFechas = async (req, res) => {
    try {
        const { desde, hasta } = req.query;
        if (!desde || !hasta) {
            return res.status(400).json({ error: 'Fechas requeridas' });
        }

        const gastos = await Gasto.findAll({
            where: {
                fecha: {
                    [Op.between]: [desde, hasta]
                }
            },
            order: [['fecha', 'ASC']]
        });

        let total = 0;
        const resumen = gastos.map(g => {
            total += parseFloat(g.valor);
            return {
                id: g.id,
                gasto: g.gasto,
                valor: g.valor,
                fecha: g.fecha,
                observacion: g.observacion
            };
        });

        res.json({ resumen, total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener reporte de gastos' });
    }
};
