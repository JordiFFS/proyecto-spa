const { auditoriaModel } = require("../models").mongodb;

/**
 * Obtener lista de registros de auditoría de la base de datos
 * @param {*} req
 * @param {*} res
 */
const getItems = async (req, res) => {
    try {
        const { usuario_id, accion, tabla_afectada, resultado, limite = 50 } = req.query;

        // Construir filtros dinámicos
        const filtros = {};
        if (usuario_id) filtros.usuario_id = parseInt(usuario_id);
        if (accion) filtros.accion = accion;
        if (tabla_afectada) filtros.tabla_afectada = tabla_afectada;
        if (resultado) filtros.resultado = resultado;

        const data = await auditoriaModel.find(filtros)
            .sort({ createdAt: -1 })
            .limit(parseInt(limite));

        res.send({ data, total: data.length });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Obtener un registro de auditoría por ID
 * @param {*} req
 * @param {*} res
 */
const getItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await auditoriaModel.findById(id);

        if (!data) {
            return res.status(404).send({ error: 'Registro de auditoría no encontrado' });
        }

        res.send({ data });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Crear un nuevo registro de auditoría
 * @param {*} req
 * @param {*} res
 */
const createItem = async (req, res) => {
    try {
        const { body } = req;

        // Agregar información de la petición HTTP
        body.ip = req.ip || req.connection.remoteAddress;
        body.user_agent = req.get('User-Agent');
        body.metodo_http = req.method;
        body.endpoint = req.originalUrl;

        const data = await auditoriaModel.create(body);
        console.log('Registro de auditoría creado:', body);
        res.status(201).send({ data });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

/**
 * Actualizar un registro de auditoría (generalmente no se permite)
 * @param {*} req
 * @param {*} res
 */
const updateItem = async (req, res) => {
    try {
        // Los registros de auditoría generalmente no se modifican
        res.status(403).send({
            error: 'No se permite modificar registros de auditoría'
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Eliminar un registro de auditoría (solo para administradores)
 * @param {*} req
 * @param {*} res
 */
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar permisos de administrador aquí si es necesario
        // if (req.user.role !== 'admin') {
        //     return res.status(403).send({ error: 'Permisos insuficientes' });
        // }

        const data = await auditoriaModel.findByIdAndDelete(id);

        if (!data) {
            return res.status(404).send({ error: 'Registro de auditoría no encontrado' });
        }

        res.send({ message: 'Registro de auditoría eliminado correctamente', data });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Obtener estadísticas de auditoría
 * @param {*} req
 * @param {*} res
 */
const getEstadisticas = async (req, res) => {
    try {
        const estadisticas = await auditoriaModel.aggregate([
            {
                $group: {
                    _id: {
                        accion: '$accion',
                        resultado: '$resultado'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.send({ estadisticas });
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
    getEstadisticas
};