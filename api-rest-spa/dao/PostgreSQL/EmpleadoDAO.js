const { Op } = require('sequelize');

class EmpleadoDAO {
    constructor(model) {
        this.model = model;
    }

    async crear(empleadoDTO) {
        try {
            const empleado = await this.model.create({
                usuario_id: empleadoDTO.usuario_id,
                especialidad: empleadoDTO.especialidad,
                horario_inicio: empleadoDTO.horario_inicio,
                horario_fin: empleadoDTO.horario_fin,
                dias_trabajo: empleadoDTO.dias_trabajo,
                activo: empleadoDTO.activo
            });

            return empleado.id;
        } catch (error) {
            throw new Error(`Error al crear empleado: ${error.message}`);
        }
    }

    async obtenerPorId(id, incluirUsuario = true) {
        try {
            const opciones = { where: { id } };

            if (incluirUsuario) {
                opciones.include = [{ association: 'usuario' }];
            }

            return await this.model.findOne(opciones);
        } catch (error) {
            throw new Error(`Error al obtener empleado: ${error.message}`);
        }
    }

    async obtenerPorUsuario(usuarioId) {
        try {
            return await this.model.findOne({
                where: { usuario_id: usuarioId },
                include: [{ association: 'usuario' }]
            });
        } catch (error) {
            throw new Error(`Error al obtener empleado por usuario: ${error.message}`);
        }
    }

    async obtenerTodos(filtros = {}) {
        try {
            const where = {};

            if (filtros.activo !== undefined) {
                where.activo = filtros.activo;
            }
            if (filtros.especialidad) {
                where.especialidad = { [Op.iLike]: `%${filtros.especialidad}%` };
            }
            if (filtros.dia_trabajo) {
                where.dias_trabajo = { [Op.contains]: [filtros.dia_trabajo] };
            }

            const opciones = {
                where,
                include: [{ association: 'usuario' }]
            };

            if (filtros.limite) opciones.limit = filtros.limite;
            if (filtros.offset) opciones.offset = filtros.offset;

            return await this.model.findAndCountAll(opciones);
        } catch (error) {
            throw new Error(`Error al obtener empleados: ${error.message}`);
        }
    }

    async obtenerActivos() {
        try {
            return await this.model.findAll({
                where: { activo: true },
                include: [{ association: 'usuario' }],
                order: [[{ model: this.model.associations.usuario.target }, 'nombre', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error al obtener empleados activos: ${error.message}`);
        }
    }

    async obtenerDisponiblesPorDia(dia) {
        try {
            return await this.model.findAll({
                where: {
                    activo: true,
                    dias_trabajo: { [Op.contains]: [dia] }
                },
                include: [{ association: 'usuario' }]
            });
        } catch (error) {
            throw new Error(`Error al obtener empleados disponibles: ${error.message}`);
        }
    }

    async actualizar(id, datosActualizacion) {
        try {
            const [filasActualizadas] = await this.model.update(
                datosActualizacion,
                { where: { id } }
            );

            return filasActualizadas > 0;
        } catch (error) {
            throw new Error(`Error al actualizar empleado: ${error.message}`);
        }
    }

    async eliminar(id) {
        try {
            const filasEliminadas = await this.model.destroy({ where: { id } });
            return filasEliminadas > 0;
        } catch (error) {
            throw new Error(`Error al eliminar empleado: ${error.message}`);
        }
    }

    async cambiarEstado(id, activo) {
        try {
            return await this.actualizar(id, { activo });
        } catch (error) {
            throw new Error(`Error al cambiar estado del empleado: ${error.message}`);
        }
    }
}

module.exports = EmpleadoDAO;