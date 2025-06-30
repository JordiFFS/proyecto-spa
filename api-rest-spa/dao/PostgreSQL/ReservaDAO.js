const { Op } = require('sequelize');

class ReservaDAO {
    constructor(model) {
        this.model = model;
    }

    async crear(reservaDTO) {
        try {
            const reserva = await this.model.create({
                usuario_id: reservaDTO.usuario_id,
                empleado_id: reservaDTO.empleado_id,
                servicio_id: reservaDTO.servicio_id,
                fecha: reservaDTO.fecha,
                hora_inicio: reservaDTO.hora_inicio,
                hora_fin: reservaDTO.hora_fin,
                estado: reservaDTO.estado,
                notas: reservaDTO.notas,
                precio_total: reservaDTO.precio_total
            });

            return reserva.id;
        } catch (error) {
            throw new Error(`Error al crear reserva: ${error.message}`);
        }
    }

    async obtenerPorId(id, incluirRelaciones = true) {
        try {
            const opciones = { where: { id } };

            if (incluirRelaciones) {
                opciones.include = [
                    { association: 'usuario' },
                    { association: 'empleado', include: [{ association: 'usuario' }] },
                    { association: 'servicio' }
                ];
            }

            return await this.model.findOne(opciones);
        } catch (error) {
            throw new Error(`Error al obtener reserva: ${error.message}`);
        }
    }

    async obtenerTodas(filtros = {}) {
        try {
            const where = {};

            if (filtros.usuario_id) {
                where.usuario_id = filtros.usuario_id;
            }
            if (filtros.empleado_id) {
                where.empleado_id = filtros.empleado_id;
            }
            if (filtros.servicio_id) {
                where.servicio_id = filtros.servicio_id;
            }
            if (filtros.estado) {
                where.estado = filtros.estado;
            }
            if (filtros.fecha) {
                where.fecha = filtros.fecha;
            }
            if (filtros.fecha_inicio && filtros.fecha_fin) {
                where.fecha = {
                    [Op.between]: [filtros.fecha_inicio, filtros.fecha_fin]
                };
            }

            const opciones = {
                where,
                include: [
                    { association: 'usuario' },
                    { association: 'empleado', include: [{ association: 'usuario' }] },
                    { association: 'servicio' }
                ],
                order: [['fecha', 'DESC'], ['hora_inicio', 'DESC']]
            };

            if (filtros.limite) opciones.limit = filtros.limite;
            if (filtros.offset) opciones.offset = filtros.offset;

            return await this.model.findAndCountAll(opciones);
        } catch (error) {
            throw new Error(`Error al obtener reservas: ${error.message}`);
        }
    }

    async obtenerPorUsuario(usuarioId, filtros = {}) {
        try {
            const where = { usuario_id: usuarioId };

            if (filtros.estado) {
                where.estado = filtros.estado;
            }
            if (filtros.fecha_inicio && filtros.fecha_fin) {
                where.fecha = {
                    [Op.between]: [filtros.fecha_inicio, filtros.fecha_fin]
                };
            }

            return await this.model.findAll({
                where,
                include: [
                    { association: 'empleado', include: [{ association: 'usuario' }] },
                    { association: 'servicio' }
                ],
                order: [['fecha', 'DESC'], ['hora_inicio', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error al obtener reservas por usuario: ${error.message}`);
        }
    }

    async obtenerPorEmpleado(empleadoId, filtros = {}) {
        try {
            const where = { empleado_id: empleadoId };

            if (filtros.estado) {
                where.estado = filtros.estado;
            }
            if (filtros.fecha) {
                where.fecha = filtros.fecha;
            }
            if (filtros.fecha_inicio && filtros.fecha_fin) {
                where.fecha = {
                    [Op.between]: [filtros.fecha_inicio, filtros.fecha_fin]
                };
            }

            return await this.model.findAll({
                where,
                include: [
                    { association: 'usuario' },
                    { association: 'servicio' }
                ],
                order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error al obtener reservas por empleado: ${error.message}`);
        }
    }

    async obtenerPorFecha(fecha, empleadoId = null) {
        try {
            const where = { fecha };

            if (empleadoId) {
                where.empleado_id = empleadoId;
            }

            return await this.model.findAll({
                where,
                include: [
                    { association: 'usuario' },
                    { association: 'empleado', include: [{ association: 'usuario' }] },
                    { association: 'servicio' }
                ],
                order: [['hora_inicio', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error al obtener reservas por fecha: ${error.message}`);
        }
    }

    async verificarDisponibilidad(empleadoId, fecha, horaInicio, horaFin, excluirReservaId = null) {
        try {
            const where = {
                empleado_id: empleadoId,
                fecha: fecha,
                estado: { [Op.in]: ['pendiente', 'confirmada'] },
                [Op.or]: [
                    {
                        hora_inicio: { [Op.between]: [horaInicio, horaFin] }
                    },
                    {
                        hora_fin: { [Op.between]: [horaInicio, horaFin] }
                    },
                    {
                        [Op.and]: [
                            { hora_inicio: { [Op.lte]: horaInicio } },
                            { hora_fin: { [Op.gte]: horaFin } }
                        ]
                    }
                ]
            };

            if (excluirReservaId) {
                where.id = { [Op.ne]: excluirReservaId };
            }

            const reservasConflicto = await this.model.findAll({ where });
            return reservasConflicto.length === 0;
        } catch (error) {
            throw new Error(`Error al verificar disponibilidad: ${error.message}`);
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
            throw new Error(`Error al actualizar reserva: ${error.message}`);
        }
    }

    async cambiarEstado(id, nuevoEstado, motivo = null) {
        try {
            const datosActualizacion = { estado: nuevoEstado };
            if (motivo) {
                datosActualizacion.notas = motivo;
            }

            return await this.actualizar(id, datosActualizacion);
        } catch (error) {
            throw new Error(`Error al cambiar estado de reserva: ${error.message}`);
        }
    }

    async eliminar(id) {
        try {
            const filasEliminadas = await this.model.destroy({ where: { id } });
            return filasEliminadas > 0;
        } catch (error) {
            throw new Error(`Error al eliminar reserva: ${error.message}`);
        }
    }

    async obtenerEstadisticas(filtros = {}) {
        try {
            const where = {};

            if (filtros.fecha_inicio && filtros.fecha_fin) {
                where.fecha = {
                    [Op.between]: [filtros.fecha_inicio, filtros.fecha_fin]
                };
            }
            if (filtros.empleado_id) {
                where.empleado_id = filtros.empleado_id;
            }

            const estadisticas = await this.model.findAll({
                where,
                attributes: [
                    'estado',
                    [this.model.sequelize.fn('COUNT', this.model.sequelize.col('id')), 'total'],
                    [this.model.sequelize.fn('SUM', this.model.sequelize.col('precio_total')), 'ingresos_total'],
                    [this.model.sequelize.fn('AVG', this.model.sequelize.col('precio_total')), 'precio_promedio']
                ],
                group: ['estado']
            });

            return estadisticas;
        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }
}

module.exports = ReservaDAO;