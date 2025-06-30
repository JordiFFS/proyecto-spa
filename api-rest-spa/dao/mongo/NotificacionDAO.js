const { ObjectId } = require('mongodb');

class NotificacionDAO {
    constructor(db) {
        this.collection = db.collection('notificaciones');
    }

    async crear(notificacionDTO) {
        try {
            const documento = {
                usuario_id: new ObjectId(notificacionDTO.usuario_id),
                tipo: notificacionDTO.tipo,
                titulo: notificacionDTO.titulo,
                mensaje: notificacionDTO.mensaje,
                leida: notificacionDTO.leida,
                fecha_lectura: notificacionDTO.fecha_lectura,
                canal: notificacionDTO.canal,
                datos_adicionales: notificacionDTO.datos_adicionales,
                programada_para: notificacionDTO.programada_para,
                enviada: notificacionDTO.enviada,
                fecha_envio: notificacionDTO.fecha_envio,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const resultado = await this.collection.insertOne(documento);
            return resultado.insertedId;
        } catch (error) {
            throw new Error(`Error al crear notificación: ${error.message}`);
        }
    }

    async obtenerPorId(id) {
        try {
            return await this.collection.findOne({ _id: new ObjectId(id) });
        } catch (error) {
            throw new Error(`Error al obtener notificación: ${error.message}`);
        }
    }

    async obtenerPorUsuario(usuarioId, filtros = {}) {
        try {
            const query = { usuario_id: new ObjectId(usuarioId) };

            if (filtros.leida !== undefined) {
                query.leida = filtros.leida;
            }
            if (filtros.tipo) {
                query.tipo = filtros.tipo;
            }

            const opciones = {};
            if (filtros.limite) opciones.limit = filtros.limite;
            if (filtros.saltar) opciones.skip = filtros.saltar;

            return await this.collection.find(query, opciones).sort({ createdAt: -1 }).toArray();
        } catch (error) {
            throw new Error(`Error al obtener notificaciones por usuario: ${error.message}`);
        }
    }

    async marcarComoLeida(id) {
        try {
            const resultado = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        leida: true,
                        fecha_lectura: new Date(),
                        updatedAt: new Date()
                    }
                }
            );

            return resultado.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al marcar notificación como leída: ${error.message}`);
        }
    }

    async marcarVariasComoLeidas(usuarioId, ids = []) {
        try {
            const query = { usuario_id: new ObjectId(usuarioId) };

            if (ids.length > 0) {
                query._id = { $in: ids.map(id => new ObjectId(id)) };
            }

            const resultado = await this.collection.updateMany(
                query,
                {
                    $set: {
                        leida: true,
                        fecha_lectura: new Date(),
                        updatedAt: new Date()
                    }
                }
            );

            return resultado.modifiedCount;
        } catch (error) {
            throw new Error(`Error al marcar notificaciones como leídas: ${error.message}`);
        }
    }

    async obtenerPendientesEnvio() {
        try {
            const ahora = new Date();
            return await this.collection.find({
                enviada: false,
                $or: [
                    { programada_para: null },
                    { programada_para: { $lte: ahora } }
                ]
            }).toArray();
        } catch (error) {
            throw new Error(`Error al obtener notificaciones pendientes: ${error.message}`);
        }
    }

    async marcarComoEnviada(id) {
        try {
            const resultado = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        enviada: true,
                        fecha_envio: new Date(),
                        updatedAt: new Date()
                    }
                }
            );

            return resultado.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al marcar notificación como enviada: ${error.message}`);
        }
    }

    async eliminar(id) {
        try {
            const resultado = await this.collection.deleteOne({ _id: new ObjectId(id) });
            return resultado.deletedCount > 0;
        } catch (error) {
            throw new Error(`Error al eliminar notificación: ${error.message}`);
        }
    }
}

module.exports = NotificacionDAO;