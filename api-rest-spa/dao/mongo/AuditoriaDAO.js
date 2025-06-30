const { ObjectId } = require('mongodb');

class AuditoriaDAO {
    constructor(db) {
        this.collection = db.collection('auditorias');
    }

    async crear(auditoriaDTO) {
        try {
            const documento = {
                usuario_id: new ObjectId(auditoriaDTO.usuario_id),
                accion: auditoriaDTO.accion,
                tabla_afectada: auditoriaDTO.tabla_afectada,
                registro_id: auditoriaDTO.registro_id,
                valores_anteriores: auditoriaDTO.valores_anteriores,
                valores_nuevos: auditoriaDTO.valores_nuevos,
                ip: auditoriaDTO.ip,
                user_agent: auditoriaDTO.user_agent,
                metodo_http: auditoriaDTO.metodo_http,
                endpoint: auditoriaDTO.endpoint,
                resultado: auditoriaDTO.resultado,
                mensaje_error: auditoriaDTO.mensaje_error,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const resultado = await this.collection.insertOne(documento);
            return resultado.insertedId;
        } catch (error) {
            throw new Error(`Error al crear auditoría: ${error.message}`);
        }
    }

    async obtenerPorId(id) {
        try {
            return await this.collection.findOne({ _id: new ObjectId(id) });
        } catch (error) {
            throw new Error(`Error al obtener auditoría: ${error.message}`);
        }
    }

    async obtenerTodas(filtros = {}) {
        try {
            const query = {};

            if (filtros.usuario_id) {
                query.usuario_id = new ObjectId(filtros.usuario_id);
            }
            if (filtros.accion) {
                query.accion = filtros.accion;
            }
            if (filtros.tabla_afectada) {
                query.tabla_afectada = filtros.tabla_afectada;
            }
            if (filtros.resultado) {
                query.resultado = filtros.resultado;
            }
            if (filtros.fecha_inicio && filtros.fecha_fin) {
                query.createdAt = {
                    $gte: new Date(filtros.fecha_inicio),
                    $lte: new Date(filtros.fecha_fin)
                };
            }

            const opciones = {};
            if (filtros.limite) opciones.limit = filtros.limite;
            if (filtros.saltar) opciones.skip = filtros.saltar;

            return await this.collection.find(query, opciones).sort({ createdAt: -1 }).toArray();
        } catch (error) {
            throw new Error(`Error al obtener auditorías: ${error.message}`);
        }
    }

    async obtenerPorUsuario(usuarioId, limite = 100) {
        try {
            return await this.collection.find({ usuario_id: new ObjectId(usuarioId) })
                .sort({ createdAt: -1 })
                .limit(limite)
                .toArray();
        } catch (error) {
            throw new Error(`Error al obtener auditorías por usuario: ${error.message}`);
        }
    }

    async obtenerPorTabla(tabla, limite = 100) {
        try {
            return await this.collection.find({ tabla_afectada: tabla })
                .sort({ createdAt: -1 })
                .limit(limite)
                .toArray();
        } catch (error) {
            throw new Error(`Error al obtener auditorías por tabla: ${error.message}`);
        }
    }
}

module.exports = AuditoriaDAO;