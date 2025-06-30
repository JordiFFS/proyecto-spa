const { sugerenciaModel } = require("../models").mongodb;

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
 * Obtener una sugerencia por ID
 * @param {*} req
 * @param {*} res
 */
const getItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await sugerenciaModel.findById(id);

        if (!data) {
            return res.status(404).send({ error: 'Sugerencia no encontrada' });
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
};