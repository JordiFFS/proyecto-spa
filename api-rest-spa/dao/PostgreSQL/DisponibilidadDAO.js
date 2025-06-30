const { Op } = require('sequelize');

class DisponibilidadDAO {
    constructor(model) {
        this.model = model;
    }

    async crear(disponibilidadDTO) {
        try {
            const disponibilidad = await this.model.create({
                empleado_id: disponibilidadDTO.empleado_id,
                fecha: disponibilidadDTO.fecha,
                hora_inicio: disponibilidadDTO.hora_inicio,
                hora_fin: disponibilidadDTO.hora_fin,
                disponible: disponibilidadDTO.disponible,
                motivo: disponibilidadDTO.motivo
            });

            return disponibilidad.id;
        } catch (error) {
            throw new Error(`Error al crear disponibilidad: ${error.message}`);
        }
    }

    async obtenerPorId(id) {
        try {
            return await this.model.findOne({
                where: { id },
                include: [{ association: 'empleado', include: [{ association: 'usuario' }] }]
            });
        } catch (error) {
            throw new Error(`Error al obtener disponibilidad: ${error.message}`);
        }
    }

    async obtenerPorEmpleado(empleadoId, filtros = {}) {
        try {
            const where = { empleado_id: empleadoId };

            if (filtros.fecha) {
                where.fecha = filtros.fecha;
            }
            if (filtros.fecha_inicio && filtros.fecha_fin) {
                where.fecha = {
                    [Op.between]: [filtros.fecha_inicio, filtros.fecha_fin]
                };
            }
            if (filtros.disponible !== undefined) {
                where.disponible = filtros.disponible;
            }

            return await this.model.findAll({
                where,
                order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error al obtener disponibilidad por empleado: ${error.message}`);
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
                include: [{ association: 'empleado', include: [{ association: 'usuario' }] }],
                order: [['hora_inicio', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error al obtener disponibilidad por fecha: ${error.message}`);
        }
    }

    async verificarDisponibilidad(empleadoId, fecha, horaInicio, horaFin) {
        try {
            const disponibilidad = await this.model.findOne({
                where: {
                    empleado_id: empleadoId,
                    fecha: fecha,
                    disponible: false,
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
                }
            });

            return !disponibilidad; // Retorna true si NO hay conflictos
        } catch (error) {
            throw new Error(`Error al verificar disponibilidad: ${error.message}`);
        }
    }

    async crearBloqueoTiempo(empleadoId, fecha, horaInicio, horaFin, motivo) {
        try {
            return await this.crear({
                empleado_id: empleadoId,
                fecha: fecha,
                hora_inicio: horaInicio,
                hora_fin: horaFin,
                disponible: false,
                motivo: motivo
            });
        } catch (error) {
            throw new Error(`Error al crear bloqueo de tiempo: ${error.message}`);
        }
    }

    async liberarTiempo(empleadoId, fecha, horaInicio, horaFin) {
        try {
            const filasEliminadas = await this.model.destroy({
                where: {
                    empleado_id: empleadoId,
                    fecha: fecha,
                    hora_inicio: horaInicio,
                    hora_fin: horaFin,
                    disponible: false
                }
            });

            return filasEliminadas > 0;
        } catch (error) {
            throw new Error(`Error al liberar tiempo: ${error.message}`);
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
            throw new Error(`Error al actualizar disponibilidad: ${error.message}`);
        }
    }

    async eliminar(id) {
        try {
            const filasEliminadas = await this.model.destroy({ where: { id } });
            return filasEliminadas > 0;
        } catch (error) {
            throw new Error(`Error al eliminar disponibilidad: ${error.message}`);
        }
    }

    async obtenerHorariosLibres(empleadoId, fecha) {
        try {
            // Obtener horario base del empleado
            const empleado = await this.model.sequelize.models.Empleado.findOne({
                where: { id: empleadoId },
                attributes: ['horario_inicio', 'horario_fin', 'dias_trabajo']
            });

            if (!empleado) {
                throw new Error('Empleado no encontrado');
            }

            // Obtener bloqueos de tiempo
            const bloqueos = await this.obtenerPorEmpleado(empleadoId, {
                fecha: fecha,
                disponible: false
            });

            // Obtener reservas confirmadas
            const reservas = await this.model.sequelize.models.Reserva.findAll({
                where: {
                    empleado_id: empleadoId,
                    fecha: fecha,
                    estado: { [Op.in]: ['pendiente', 'confirmada'] }
                },
                attributes: ['hora_inicio', 'hora_fin']
            });

            // Calcular horarios libres (lógica simplificada)
            const horariosOcupados = [
                ...bloqueos.map(b => ({ inicio: b.hora_inicio, fin: b.hora_fin })),
                ...reservas.map(r => ({ inicio: r.hora_inicio, fin: r.hora_fin }))
            ];

            return {
                horario_base: {
                    inicio: empleado.horario_inicio,
                    fin: empleado.horario_fin
                },
                ocupados: horariosOcupados
            };
        } catch (error) {
            throw new Error(`Error al obtener horarios libres: ${error.message}`);
        }
    }
}

module.exports = DisponibilidadDAO;