const { historialReservaModel } = require("../models").mongodb;

/**
 * Obtener lista del historial de reservas de la base de datos
 * @param {*} req
 * @param {*} res
 */
const getItems = async (req, res) => {
    try {
        const {
            usuario_id,
            empleado_id,
            servicio_id,
            reserva_id,
            estado_nuevo,
            limite = 50
        } = req.query;

        // Construir filtros dinámicos
        const filtros = {};
        if (usuario_id) filtros.usuario_id = parseInt(usuario_id);
        if (empleado_id) filtros.empleado_id = parseInt(empleado_id);
        if (servicio_id) filtros.servicio_id = parseInt(servicio_id);
        if (reserva_id) filtros.reserva_id = parseInt(reserva_id);
        if (estado_nuevo) filtros.estado_nuevo = estado_nuevo;

        const data = await historialReservaModel.find(filtros)
            .sort({ createdAt: -1 })
            .limit(parseInt(limite));

        res.send({ data, total: data.length });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Obtener un registro del historial por ID
 * @param {*} req
 * @param {*} res
 */
const getItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await historialReservaModel.findById(id);

        if (!data) {
            return res.status(404).send({ error: 'Registro del historial no encontrado' });
        }

        res.send({ data });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Crear un nuevo registro en el historial
 * @param {*} req
 * @param {*} res
 */
const createItem = async (req, res) => {
    try {
        const { body } = req;
        const data = await historialReservaModel.create(body);
        console.log('Historial de reserva creado:', body);
        res.status(201).send({ data });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

/**
 * Actualizar un registro del historial
 * @param {*} req
 * @param {*} res
 */
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { body } = req;

        const data = await historialReservaModel.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );

        if (!data) {
            return res.status(404).send({ error: 'Registro del historial no encontrado' });
        }

        res.send({ data });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

/**
 * Eliminar un registro del historial
 * @param {*} req
 * @param {*} res
 */
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await historialReservaModel.findByIdAndDelete(id);

        if (!data) {
            return res.status(404).send({ error: 'Registro del historial no encontrado' });
        }

        res.send({ message: 'Registro del historial eliminado correctamente', data });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Obtener historial de una reserva específica
 * @param {*} req
 * @param {*} res
 */
const getHistorialPorReserva = async (req, res) => {
    try {
        const { reserva_id } = req.params;

        const data = await historialReservaModel.find({
            reserva_id: parseInt(reserva_id)
        }).sort({ fecha_cambio: 1 });

        res.send({ data, total: data.length });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Agregar calificación a un registro del historial
 * @param {*} req
 * @param {*} res
 */
const agregarCalificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { puntuacion, comentario } = req.body;

        if (puntuacion < 1 || puntuacion > 5) {
            return res.status(400).send({ error: 'La puntuación debe estar entre 1 y 5' });
        }

        const data = await historialReservaModel.findByIdAndUpdate(
            id,
            {
                'calificacion.puntuacion': puntuacion,
                'calificacion.comentario': comentario,
                'calificacion.fecha_calificacion': new Date()
            },
            { new: true }
        );

        if (!data) {
            return res.status(404).send({ error: 'Registro del historial no encontrado' });
        }

        res.send({ data });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Obtener estadísticas del historial
 * @param {*} req
 * @param {*} res
 */
const getEstadisticas = async (req, res) => {
    try {
        const estadisticas = await historialReservaModel.aggregate([
            {
                $group: {
                    _id: '$estado_nuevo',
                    count: { $sum: 1 },
                    promedioCalificacion: {
                        $avg: '$calificacion.puntuacion'
                    }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const totalReservas = await historialReservaModel.countDocuments();

        res.send({
            estadisticas,
            totalReservas,
            fecha_consulta: new Date()
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Obtener calificaciones promedio por empleado
 * @param {*} req
 * @param {*} res
 */
const getCalificacionesPorEmpleado = async (req, res) => {
    try {
        const calificaciones = await historialReservaModel.aggregate([
            {
                $match: {
                    'calificacion.puntuacion': { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$empleado_id',
                    promedioCalificacion: { $avg: '$calificacion.puntuacion' },
                    totalCalificaciones: { $sum: 1 },
                    ultimaCalificacion: { $max: '$calificacion.fecha_calificacion' }
                }
            },
            {
                $sort: { promedioCalificacion: -1 }
            }
        ]);

        res.send({ calificaciones });
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
    getHistorialPorReserva,
    agregarCalificacion,
    getEstadisticas,
    getCalificacionesPorEmpleado
};