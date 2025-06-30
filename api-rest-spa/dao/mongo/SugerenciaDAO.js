const { ObjectId } = require('mongodb');

class SugerenciaDAO {
    constructor(db) {
        this.collection = db.collection('sugerencias');
    }

    async crear(sugerenciaDTO) {
        try {
            const documento = {
                usuario_id: new ObjectId(sugerenciaDTO.usuario_id),
                tipo: sugerenciaDTO.tipo,
                contenido: sugerenciaDTO.contenido,
                categoria: sugerenciaDTO.categoria,
                prioridad: sugerenciaDTO.prioridad,
                estado: sugerenciaDTO.estado,
                respuesta: sugerenciaDTO.respuesta,
                respondido_por: sugerenciaDTO.respondido_por ? new ObjectId(sugerenciaDTO.respondido_por) : null,
                metadata: sugerenciaDTO.metadata,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const resultado = await this.collection.insertOne(documento);
            return resultado.insertedId;
        } catch (error) {
            throw new Error(`Error al crear sugerencia: ${error.message}`);
        }
    }

    async obtenerPorId(id) {
        try {
            return await this.collection.findOne({ _id: new ObjectId(id) });
        } catch (error) {
            throw new Error(`Error al obtener sugerencia: ${error.message}`);
        }
    }

    async obtenerTodas(filtros = {}) {
        try {
            const query = {};

            if (filtros.usuario_id) {
                query.usuario_id = new ObjectId(filtros.usuario_id);
            }
            if (filtros.tipo) {
                query.tipo = filtros.tipo;
            }
            if (filtros.estado) {
                query.estado = filtros.estado;
            }
            if (filtros.prioridad) {
                query.prioridad = filtros.prioridad;
            }

            const opciones = {};
            if (filtros.limite) opciones.limit = filtros.limite;
            if (filtros.saltar) opciones.skip = filtros.saltar;

            return await this.collection.find(query, opciones).sort({ createdAt: -1 }).toArray();
        } catch (error) {
            throw new Error(`Error al obtener sugerencias: ${error.message}`);
        }
    }

    async actualizar(id, datosActualizacion) {
        try {
            const documento = {
                ...datosActualizacion,
                updatedAt: new Date()
            };

            if (documento.respondido_por) {
                documento.respondido_por = new ObjectId(documento.respondido_por);
            }

            const resultado = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: documento }
            );

            return resultado.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al actualizar sugerencia: ${error.message}`);
        }
    }

    async eliminar(id) {
        try {
            const resultado = await this.collection.deleteOne({ _id: new ObjectId(id) });
            return resultado.deletedCount > 0;
        } catch (error) {
            throw new Error(`Error al eliminar sugerencia: ${error.message}`);
        }
    }

    async obtenerPorUsuario(usuarioId) {
        try {
            return await this.collection.find({ usuario_id: new ObjectId(usuarioId) })
                .sort({ createdAt: -1 }).toArray();
        } catch (error) {
            throw new Error(`Error al obtener sugerencias por usuario: ${error.message}`);
        }
    }
}

module.exports = SugerenciaDAO;