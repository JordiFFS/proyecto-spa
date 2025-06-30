const { ObjectId } = require('mongodb');

class HistorialReservaDAO {
    constructor(db) {
        this.collection = db.collection('historial_reservas');
    }

    async crear(historialDTO) {
        try {
            const documento = {
                reserva_id: new ObjectId(historialDTO.reserva_id),
                usuario_id: new ObjectId(historialDTO.usuario_id),
                empleado_id: new ObjectId(historialDTO.empleado_id),
                servicio_id: new ObjectId(historialDTO.servicio_id),
                estado_anterior: historialDTO.estado_anterior,
                estado_nuevo: historialDTO.estado_nuevo,
                fecha_cambio: historialDTO.fecha_cambio || new Date(),
                motivo: historialDTO.motivo,
                comentarios: historialDTO.comentarios,
                calificacion: historialDTO.calificacion,
                duracion_real: historialDTO.duracion_real,
                precio_final: historialDTO.precio_final,
                metodos_pago: historialDTO.metodos_pago,
                productos_adicionales: historialDTO.productos_adicionales,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const resultado = await this.collection.insertOne(documento);
            return resultado.insertedId;
        } catch (error) {
            throw new Error(`Error al crear historial de reserva: ${error.message}`);
        }
    }

    async obtenerPorId(id) {
        try {
            return await this.collection.findOne({ _id: new ObjectId(id) });
        } catch (error) {
            throw new Error(`Error al obtener historial de reserva: ${error.message}`);
        }
    }

    async obtenerPorReserva(reservaId) {
        try {
            return await this.collection.find({ reserva_id: new ObjectId(reservaId) })
                .sort({ fecha_cambio: -1 }).toArray();
        } catch (error) {
            throw new Error(`Error al obtener historial por reserva: ${error.message}`);
        }
    }

    async obtenerPorUsuario(usuarioId, filtros = {}) {
        try {
            const query = { usuario_id: new ObjectId(usuarioId) };

            if (filtros.estado_nuevo) {
                query.estado_nuevo = filtros.estado_nuevo;
            }
            if (filtros.fecha_inicio && filtros.fecha_fin) {
                query.fecha_cambio = {
                    $gte: new Date(filtros.fecha_inicio),
                    $lte: new Date(filtros.fecha_fin)
                };
            }

            const opciones = {};
            if (filtros.limite) opciones.limit = filtros.limite;
            if (filtros.saltar) opciones.skip = filtros.saltar;

            return await this.collection.find(query, opciones)
                .sort({ fecha_cambio: -1 }).toArray();
        } catch (error) {
            throw new Error(`Error al obtener historial por usuario: ${error.message}`);
        }
    }

    async obtenerPorEmpleado(empleadoId, filtros = {}) {
        try {
            const query = { empleado_id: new ObjectId(empleadoId) };

            if (filtros.estado_nuevo) {
                query.estado_nuevo = filtros.estado_nuevo;
            }
            if (filtros.fecha_inicio && filtros.fecha_fin) {
                query.fecha_cambio = {
                    $gte: new Date(filtros.fecha_inicio),
                    $lte: new Date(filtros.fecha_fin)
                };
            }

            const opciones = {};
            if (filtros.limite) opciones.limit = filtros.limite;
            if (filtros.saltar) opciones.skip = filtros.saltar;

            return await this.collection.find(query, opciones)
                .sort({ fecha_cambio: -1 }).toArray();
        } catch (error) {
            throw new Error(`Error al obtener historial por empleado: ${error.message}`);
        }
    }

    async obtenerEstadisticas(filtros = {}) {
        try {
            const pipeline = [];

            // Filtros de fecha
            if (filtros.fecha_inicio && filtros.fecha_fin) {
                pipeline.push({
                    $match: {
                        fecha_cambio: {
                            $gte: new Date(filtros.fecha_inicio),
                            $lte: new Date(filtros.fecha_fin)
                        }
                    }
                });
            }

            // Agrupar por estado
            pipeline.push({
                $group: {
                    _id: '$estado_nuevo',
                    total: { $sum: 1 },
                    precio_promedio: { $avg: '$precio_final' },
                    precio_total: { $sum: '$precio_final' }
                }
            });

            return await this.collection.aggregate(pipeline).toArray();
        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    async actualizar(id, datosActualizacion) {
        try {
            const documento = {
                ...datosActualizacion,
                updatedAt: new Date()
            };

            const resultado = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: documento }
            );

            return resultado.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al actualizar historial: ${error.message}`);
        }
    }
}

module.exports = HistorialReservaDAO;