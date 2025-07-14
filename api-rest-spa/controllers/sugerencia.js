const { sugerenciaModel } = require("../models").mongodb;
const mongoose = require("mongoose");
/**
 * Obtener lista de sugerencias de la base de datos
 * @param {*} req
 * @param {*} res
 */
const getItems = async (req, res) => {
    try {
        const { tipo, estado, prioridad, usuario_id } = req.query;

        // Construir filtros dinámicos
        const filtros = {};
        if (tipo) filtros.tipo = tipo;
        if (estado) filtros.estado = estado;
        if (prioridad) filtros.prioridad = prioridad;
        if (usuario_id) filtros.usuario_id = parseInt(usuario_id);

        const data = await sugerenciaModel.find(filtros)
            .sort({ createdAt: -1 })
            .limit(50);

        res.send({ data, total: data.length });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Obtener estadísticas de sugerencias
 * @param {*} req
 * @param {*} res
 */
const getStats = async (req, res) => {
    try {
        const { usuario_id, desde, hasta } = req.query;

        const filtros = {};
        if (usuario_id) filtros.usuario_id = parseInt(usuario_id);
        if (desde || hasta) {
            filtros.createdAt = {};
            if (desde) filtros.createdAt.$gte = new Date(desde);
            if (hasta) filtros.createdAt.$lte = new Date(hasta);
        }

        const agrupado = await sugerenciaModel.aggregate([
            { $match: filtros },
            {
                $group: {
                    _id: "$estado",
                    count: { $sum: 1 }
                }
            }
        ]);

        const estadisticas = {
            total: 0,
            nueva: 0,
            revisada: 0,
            implementada: 0,
            rechazada: 0
        };

        agrupado.forEach(item => {
            estadisticas[item._id] = item.count;
            estadisticas.total += item.count;
        });

        res.send({ estadisticas });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};


/**
 * Obtener una sugerencia por ID
 * @param {*} req
 * @param {*} res
 */
const getItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ error: "ID inválido" });
        }

        const data = await sugerenciaModel.findById(id);

        if (!data) {
            return res.status(404).send({ error: "Sugerencia no encontrada" });
        }

        res.send({ data });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Crear una nueva sugerencia
 * @param {*} req
 * @param {*} res
 */
const createItem = async (req, res) => {
    try {
        const { body } = req;

        // Agregar metadata de la petición
        body.metadata = {
            ip: req.ip || req.connection.remoteAddress,
            user_agent: req.get('User-Agent'),
            dispositivo: req.get('User-Agent')?.includes('Mobile') ? 'móvil' : 'escritorio'
        };

        const data = await sugerenciaModel.create(body);
        console.log('Sugerencia creada:', body);
        res.status(201).send({ data });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

/**
 * Actualizar una sugerencia
 * @param {*} req
 * @param {*} res
 */
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { body } = req;

        const data = await sugerenciaModel.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );

        if (!data) {
            return res.status(404).send({ error: 'Sugerencia no encontrada' });
        }

        res.send({ data });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

/**
 * Eliminar una sugerencia
 * @param {*} req
 * @param {*} res
 */
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await sugerenciaModel.findByIdAndDelete(id);

        if (!data) {
            return res.status(404).send({ error: 'Sugerencia no encontrada' });
        }

        res.send({ message: 'Sugerencia eliminada correctamente', data });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

module.exports = {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    getStats
};