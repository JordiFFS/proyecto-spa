const { notificacionModel } = require("../models").mongodb;

/**
 * Obtener lista de notificaciones de la base de datos
 * @param {*} req
 * @param {*} res
 */
const getItems = async (req, res) => {
    try {
        const { usuario_id, tipo, leida, canal, limite = 20 } = req.query;

        // Construir filtros dinámicos
        const filtros = {};
        if (usuario_id) filtros.usuario_id = parseInt(usuario_id);
        if (tipo) filtros.tipo = tipo;
        if (leida !== undefined) filtros.leida = leida === 'true';
        if (canal) filtros.canal = canal;

        const data = await notificacionModel.find(filtros)
            .sort({ createdAt: -1 })
            .limit(parseInt(limite));

        res.send({ data, total: data.length });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Obtener una notificación por ID
 * @param {*} req
 * @param {*} res
 */
const getItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await notificacionModel.findById(id);

        if (!data) {
            return res.status(404).send({ error: 'Notificación no encontrada' });
        }

        res.send({ data });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Crear una nueva notificación
 * @param {*} req
 * @param {*} res
 */
const createItem = async (req, res) => {
    try {
        const { body } = req;
        const data = await notificacionModel.create(body);
        console.log('Notificación creada:', body);
        res.status(201).send({ data });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

/**
 * Actualizar una notificación
 * @param {*} req
 * @param {*} res
 */
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { body } = req;

        const data = await notificacionModel.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );

        if (!data) {
            return res.status(404).send({ error: 'Notificación no encontrada' });
        }

        res.send({ data });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

/**
 * Eliminar una notificación
 * @param {*} req
 * @param {*} res
 */
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await notificacionModel.findByIdAndDelete(id);

        if (!data) {
            return res.status(404).send({ error: 'Notificación no encontrada' });
        }

        res.send({ message: 'Notificación eliminada correctamente', data });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Marcar notificación como leída
 * @param {*} req
 * @param {*} res
 */
const marcarComoLeida = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await notificacionModel.findByIdAndUpdate(
            id,
            {
                leida: true,
                fecha_lectura: new Date()
            },
            { new: true }
        );

        if (!data) {
            return res.status(404).send({ error: 'Notificación no encontrada' });
        }

        res.send({ data });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Marcar todas las notificaciones de un usuario como leídas
 * @param {*} req
 * @param {*} res
 */
const marcarTodasComoLeidas = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const resultado = await notificacionModel.updateMany(
            { usuario_id: parseInt(usuario_id), leida: false },
            {
                leida: true,
                fecha_lectura: new Date()
            }
        );

        res.send({
            message: 'Notificaciones marcadas como leídas',
            notificacionesActualizadas: resultado.modifiedCount
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Obtener notificaciones no leídas de un usuario
 * @param {*} req
 * @param {*} res
 */
const getNoLeidas = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const data = await notificacionModel.find({
            usuario_id: parseInt(usuario_id),
            leida: false
        }).sort({ createdAt: -1 });

        res.send({ data, total: data.length });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Marcar notificación como enviada
 * @param {*} req
 * @param {*} res
 */
const marcarComoEnviada = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await notificacionModel.findByIdAndUpdate(
            id,
            {
                enviada: true,
                fecha_envio: new Date()
            },
            { new: true }
        );

        if (!data) {
            return res.status(404).send({ error: 'Notificación no encontrada' });
        }

        res.send({ data });
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
    marcarComoLeida,
    marcarTodasComoLeidas,
    getNoLeidas,
    marcarComoEnviada
};