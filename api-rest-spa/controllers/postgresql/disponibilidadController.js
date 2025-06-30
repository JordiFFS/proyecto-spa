const { Disponibilidad, Empleado, Usuario, Reserva } = require("../../models/psql");
const { Op } = require("sequelize");

const disponibilidadController = {
  // Crear nueva disponibilidad
  create: async (req, res) => {
    try {
      const {
        empleado_id,
        fecha,
        hora_inicio,
        hora_fin,
        disponible = true,
        motivo
      } = req.body;

      console.log('Datos recibidos:', { empleado_id, fecha, hora_inicio, hora_fin });

      // Validar que el empleado existe
      const empleado = await Empleado.findByPk(empleado_id);
      console.log('Empleado encontrado:', empleado ? 'Sí' : 'No');
      
      if (!empleado) {
        return res.status(404).json({
          success: false,
          message: 'Empleado no encontrado',
          debug: { empleado_id_buscado: empleado_id }
        });
      }

      // Validar que no existe conflicto de horarios
      const conflicto = await Disponibilidad.findOne({
        where: {
          empleado_id,
          fecha,
          [Op.or]: [
            {
              hora_inicio: {
                [Op.between]: [hora_inicio, hora_fin]
              }
            },
            {
              hora_fin: {
                [Op.between]: [hora_inicio, hora_fin]
              }
            },
            {
              [Op.and]: [
                { hora_inicio: { [Op.lte]: hora_inicio } },
                { hora_fin: { [Op.gte]: hora_fin } }
              ]
            }
          ]
        }
      });

      if (conflicto) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe disponibilidad configurada para ese horario'
        });
      }

      const disponibilidad = await Disponibilidad.create({
        empleado_id,
        fecha,
        hora_inicio,
        hora_fin,
        disponible,
        motivo
      });

      // Obtener la disponibilidad completa con relaciones (SIN especialidad)
      const disponibilidadCompleta = await Disponibilidad.findByPk(disponibilidad.id, {
        include: [{
          model: Empleado,
          include: [{
            model: Usuario,
            attributes: ['id', 'nombre', 'email'] // REMOVIDO 'especialidad'
          }]
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Disponibilidad creada exitosamente',
        data: disponibilidadCompleta
      });
    } catch (error) {
      console.error('Error en create:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Ya existe disponibilidad para ese empleado, fecha y hora de inicio'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error al crear disponibilidad',
        error: error.message
      });
    }
  },

  // Obtener todas las disponibilidades con filtros
  getAll: async (req, res) => {
    try {
      const {
        empleado_id,
        fecha,
        fecha_desde,
        fecha_hasta,
        disponible,
        page = 1,
        limit = 10
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Filtros
      if (empleado_id) whereClause.empleado_id = empleado_id;
      if (disponible !== undefined) whereClause.disponible = disponible === 'true';

      if (fecha) {
        whereClause.fecha = fecha;
      } else if (fecha_desde && fecha_hasta) {
        whereClause.fecha = {
          [Op.between]: [fecha_desde, fecha_hasta]
        };
      } else if (fecha_desde) {
        whereClause.fecha = {
          [Op.gte]: fecha_desde
        };
      } else if (fecha_hasta) {
        whereClause.fecha = {
          [Op.lte]: fecha_hasta
        };
      }

      const { count, rows } = await Disponibilidad.findAndCountAll({
        where: whereClause,
        include: [{
          model: Empleado,
          include: [{
            model: Usuario,
            attributes: ['id', 'nombre', 'email'] // REMOVIDO 'especialidad'
          }]
        }],
        order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error en getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener disponibilidades',
        error: error.message
      });
    }
  },

  // Obtener disponibilidades activas
  getActive: async (req, res) => {
    try {
      const { empleado_id, fecha } = req.query;
      const whereClause = { disponible: true };

      if (empleado_id) whereClause.empleado_id = empleado_id;
      if (fecha) whereClause.fecha = fecha;

      const disponibilidades = await Disponibilidad.findAll({
        where: whereClause,
        include: [{
          model: Empleado,
          include: [{
            model: Usuario,
            attributes: ['id', 'nombre', 'email'] // REMOVIDO 'especialidad'
          }]
        }],
        order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']]
      });

      res.json({
        success: true,
        data: disponibilidades
      });
    } catch (error) {
      console.error('Error en getActive:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener disponibilidades activas',
        error: error.message
      });
    }
  },

  // Obtener disponibilidad por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const disponibilidad = await Disponibilidad.findByPk(id, {
        include: [{
          model: Empleado,
          include: [{
            model: Usuario,
            attributes: ['id', 'nombre', 'email'] // REMOVIDO 'especialidad'
          }]
        }]
      });

      if (!disponibilidad) {
        return res.status(404).json({
          success: false,
          message: 'Disponibilidad no encontrada'
        });
      }

      res.json({
        success: true,
        data: disponibilidad
      });
    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener disponibilidad',
        error: error.message
      });
    }
  },

  // Actualizar disponibilidad
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { empleado_id, fecha, hora_inicio, hora_fin, disponible, motivo } = req.body;

      const disponibilidad = await Disponibilidad.findByPk(id);
      if (!disponibilidad) {
        return res.status(404).json({
          success: false,
          message: 'Disponibilidad no encontrada'
        });
      }

      // Si se actualiza horario, verificar conflictos
      if (hora_inicio || hora_fin) {
        const nuevaHoraInicio = hora_inicio || disponibilidad.hora_inicio;
        const nuevaHoraFin = hora_fin || disponibilidad.hora_fin;

        const conflicto = await Disponibilidad.findOne({
          where: {
            id: { [Op.ne]: id },
            empleado_id: empleado_id || disponibilidad.empleado_id,
            fecha: fecha || disponibilidad.fecha,
            [Op.or]: [
              {
                hora_inicio: {
                  [Op.between]: [nuevaHoraInicio, nuevaHoraFin]
                }
              },
              {
                hora_fin: {
                  [Op.between]: [nuevaHoraInicio, nuevaHoraFin]
                }
              },
              {
                [Op.and]: [
                  { hora_inicio: { [Op.lte]: nuevaHoraInicio } },
                  { hora_fin: { [Op.gte]: nuevaHoraFin } }
                ]
              }
            ]
          }
        });

        if (conflicto) {
          return res.status(400).json({
            success: false,
            message: 'Conflicto de horarios con otra disponibilidad existente'
          });
        }
      }

      await disponibilidad.update({
        empleado_id: empleado_id || disponibilidad.empleado_id,
        fecha: fecha || disponibilidad.fecha,
        hora_inicio: hora_inicio || disponibilidad.hora_inicio,
        hora_fin: hora_fin || disponibilidad.hora_fin,
        disponible: disponible !== undefined ? disponible : disponibilidad.disponible,
        motivo: motivo || disponibilidad.motivo
      });

      // Obtener la disponibilidad actualizada con relaciones
      const disponibilidadActualizada = await Disponibilidad.findByPk(id, {
        include: [{
          model: Empleado,
          include: [{
            model: Usuario,
            attributes: ['id', 'nombre', 'email'] // REMOVIDO 'especialidad'
          }]
        }]
      });

      res.json({
        success: true,
        message: 'Disponibilidad actualizada exitosamente',
        data: disponibilidadActualizada
      });
    } catch (error) {
      console.error('Error en update:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar disponibilidad',
        error: error.message
      });
    }
  },

  // Eliminar disponibilidad
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const disponibilidad = await Disponibilidad.findByPk(id);
      if (!disponibilidad) {
        return res.status(404).json({
          success: false,
          message: 'Disponibilidad no encontrada'
        });
      }

      await disponibilidad.destroy();

      res.json({
        success: true,
        message: 'Disponibilidad eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error en delete:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar disponibilidad',
        error: error.message
      });
    }
  },

  // Obtener disponibilidad por empleado
  getByEmployee: async (req, res) => {
    try {
      const { empleado_id } = req.params;
      const { fecha, fecha_desde, fecha_hasta, disponible } = req.query;

      const whereClause = { empleado_id };

      if (disponible !== undefined) {
        whereClause.disponible = disponible === 'true';
      }

      if (fecha) {
        whereClause.fecha = fecha;
      } else if (fecha_desde && fecha_hasta) {
        whereClause.fecha = {
          [Op.between]: [fecha_desde, fecha_hasta]
        };
      }

      const disponibilidades = await Disponibilidad.findAll({
        where: whereClause,
        order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']]
      });

      res.json({
        success: true,
        data: disponibilidades
      });
    } catch (error) {
      console.error('Error en getByEmployee:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener disponibilidad por empleado',
        error: error.message
      });
    }
  },

  // Método para debug - listar todos los empleados
  debugEmployees: async (req, res) => {
    try {
      const empleados = await Empleado.findAll({
        include: [{
          model: Usuario,
          attributes: ['id', 'nombre', 'email']
        }]
      });

      res.json({
        success: true,
        message: 'Lista de empleados disponibles',
        data: empleados,
        total: empleados.length
      });
    } catch (error) {
      console.error('Error en debugEmployees:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener empleados',
        error: error.message
      });
    }
  },

  // Resto de métodos sin cambios en los includes...
  getAvailableSlots: async (req, res) => {
    try {
      const { empleado_id, fecha } = req.query;

      if (!empleado_id || !fecha) {
        return res.status(400).json({
          success: false,
          message: 'empleado_id y fecha son requeridos'
        });
      }

      // Obtener disponibilidades del empleado para la fecha
      const disponibilidades = await Disponibilidad.findAll({
        where: {
          empleado_id,
          fecha,
          disponible: true
        },
        order: [['hora_inicio', 'ASC']]
      });

      if (disponibilidades.length === 0) {
        return res.json({
          success: true,
          data: [],
          message: 'No hay disponibilidad para esta fecha'
        });
      }

      // Obtener reservas existentes
      const reservasExistentes = await Reserva.findAll({
        where: {
          empleado_id,
          fecha,
          estado: ['pendiente', 'confirmada']
        },
        order: [['hora_inicio', 'ASC']]
      });

      // Calcular horarios disponibles
      const horariosDisponibles = [];

      for (const disponibilidad of disponibilidades) {
        const bloqueInicio = new Date(`1970-01-01T${disponibilidad.hora_inicio}`);
        const bloqueFin = new Date(`1970-01-01T${disponibilidad.hora_fin}`);

        // Dividir en slots de tiempo (cada 30 minutos)
        const duracionSlot = 30; // minutos
        let horaActual = new Date(bloqueInicio);

        while (horaActual < bloqueFin) {
          const horaFinSlot = new Date(horaActual.getTime() + duracionSlot * 60000);

          if (horaFinSlot > bloqueFin) break;

          const horaInicioStr = horaActual.toTimeString().split(' ')[0].substring(0, 5);
          const horaFinStr = horaFinSlot.toTimeString().split(' ')[0].substring(0, 5);

          // Verificar si este slot está ocupado por alguna reserva
          const estaOcupado = reservasExistentes.some(reserva => {
            const reservaInicio = new Date(`1970-01-01T${reserva.hora_inicio}`);
            const reservaFin = new Date(`1970-01-01T${reserva.hora_fin}`);

            return (horaActual < reservaFin && horaFinSlot > reservaInicio);
          });

          if (!estaOcupado) {
            horariosDisponibles.push({
              hora_inicio: horaInicioStr,
              hora_fin: horaFinStr,
              disponible: true
            });
          }

          horaActual = new Date(horaActual.getTime() + duracionSlot * 60000);
        }
      }

      res.json({
        success: true,
        data: {
          fecha,
          empleado_id,
          horarios_disponibles: horariosDisponibles
        }
      });
    } catch (error) {
      console.error('Error en getAvailableSlots:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener horarios disponibles',
        error: error.message
      });
    }
  },

  // Resto de métodos idénticos al original pero sin 'especialidad' en los includes...
  blockSchedule: async (req, res) => {
    try {
      const { empleado_id, fecha, hora_inicio, hora_fin, motivo } = req.body;

      // Verificar si ya existe disponibilidad para ese horario
      const disponibilidadExistente = await Disponibilidad.findOne({
        where: {
          empleado_id,
          fecha,
          hora_inicio,
          hora_fin
        }
      });

      if (disponibilidadExistente) {
        // Actualizar la disponibilidad existente
        await disponibilidadExistente.update({
          disponible: false,
          motivo: motivo || 'Bloqueado manualmente'
        });

        res.json({
          success: true,
          message: 'Horario bloqueado exitosamente',
          data: disponibilidadExistente
        });
      } else {
        // Crear nueva disponibilidad bloqueada
        const nuevaDisponibilidad = await Disponibilidad.create({
          empleado_id,
          fecha,
          hora_inicio,
          hora_fin,
          disponible: false,
          motivo: motivo || 'Bloqueado manualmente'
        });

        res.status(201).json({
          success: true,
          message: 'Horario bloqueado exitosamente',
          data: nuevaDisponibilidad
        });
      }
    } catch (error) {
      console.error('Error en blockSchedule:', error);
      res.status(500).json({
        success: false,
        message: 'Error al bloquear horario',
        error: error.message
      });
    }
  },

  unblockSchedule: async (req, res) => {
    try {
      const { id } = req.params;

      const disponibilidad = await Disponibilidad.findByPk(id);
      if (!disponibilidad) {
        return res.status(404).json({
          success: false,
          message: 'Disponibilidad no encontrada'
        });
      }

      await disponibilidad.update({
        disponible: true,
        motivo: 'Desbloqueado manualmente'
      });

      res.json({
        success: true,
        message: 'Horario desbloqueado exitosamente',
        data: disponibilidad
      });
    } catch (error) {
      console.error('Error en unblockSchedule:', error);
      res.status(500).json({
        success: false,
        message: 'Error al desbloquear horario',
        error: error.message
      });
    }
  },

  generateAutoSchedule: async (req, res) => {
    try {
      const { empleado_id } = req.params;
      const { fecha_inicio, fecha_fin, dias_semana, hora_inicio, hora_fin } = req.body;

      // Validar que el empleado existe
      const empleado = await Empleado.findByPk(empleado_id);
      if (!empleado) {
        return res.status(404).json({
          success: false,
          message: 'Empleado no encontrado'
        });
      }

      const diasSemanaMap = {
        'lunes': 1,
        'martes': 2,
        'miercoles': 3,
        'jueves': 4,
        'viernes': 5,
        'sabado': 6,
        'domingo': 0
      };

      const disponibilidadesCreadas = [];
      const fechaInicio = new Date(fecha_inicio);
      const fechaFin = new Date(fecha_fin);

      for (let fecha = new Date(fechaInicio); fecha <= fechaFin; fecha.setDate(fecha.getDate() + 1)) {
        const diaSemana = fecha.getDay();
        const nombreDia = Object.keys(diasSemanaMap).find(key => diasSemanaMap[key] === diaSemana);

        if (dias_semana.includes(nombreDia)) {
          const fechaStr = fecha.toISOString().split('T')[0];

          // Verificar si ya existe disponibilidad para esta fecha
          const existeDisponibilidad = await Disponibilidad.findOne({
            where: {
              empleado_id,
              fecha: fechaStr,
              hora_inicio,
              hora_fin
            }
          });

          if (!existeDisponibilidad) {
            const nuevaDisponibilidad = await Disponibilidad.create({
              empleado_id,
              fecha: fechaStr,
              hora_inicio,
              hora_fin,
              disponible: true,
              motivo: 'Generada automáticamente'
            });

            disponibilidadesCreadas.push(nuevaDisponibilidad);
          }
        }
      }

      res.status(201).json({
        success: true,
        message: `Se crearon ${disponibilidadesCreadas.length} disponibilidades automáticamente`,
        data: disponibilidadesCreadas
      });
    } catch (error) {
      console.error('Error en generateAutoSchedule:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar disponibilidad automática',
        error: error.message
      });
    }
  },

  getStats: async (req, res) => {
    try {
      const { empleado_id, fecha_desde, fecha_hasta } = req.query;

      const whereClause = {};
      if (empleado_id) whereClause.empleado_id = empleado_id;

      if (fecha_desde && fecha_hasta) {
        whereClause.fecha = {
          [Op.between]: [fecha_desde, fecha_hasta]
        };
      }

      const totalDisponibilidades = await Disponibilidad.count({
        where: whereClause
      });

      const disponibilidadesActivas = await Disponibilidad.count({
        where: {
          ...whereClause,
          disponible: true
        }
      });

      const disponibilidadesBloqueadas = await Disponibilidad.count({
        where: {
          ...whereClause,
          disponible: false
        }
      });

      // Estadísticas por empleado si no se especifica uno
      let estadisticasPorEmpleado = [];
      if (!empleado_id) {
        const empleados = await Empleado.findAll({
          include: [{
            model: Usuario,
            attributes: ['nombre', 'email']
          }]
        });

        for (const empleado of empleados) {
          const totalEmpleado = await Disponibilidad.count({
            where: {
              empleado_id: empleado.id,
              ...(fecha_desde && fecha_hasta && {
                fecha: { [Op.between]: [fecha_desde, fecha_hasta] }
              })
            }
          });

          const activasEmpleado = await Disponibilidad.count({
            where: {
              empleado_id: empleado.id,
              disponible: true,
              ...(fecha_desde && fecha_hasta && {
                fecha: { [Op.between]: [fecha_desde, fecha_hasta] }
              })
            }
          });

          estadisticasPorEmpleado.push({
            empleado_id: empleado.id,
            nombre: empleado.Usuario.nombre,
            total_disponibilidades: totalEmpleado,
            disponibilidades_activas: activasEmpleado,
            disponibilidades_bloqueadas: totalEmpleado - activasEmpleado,
            porcentaje_disponible: totalEmpleado > 0 ?
              ((activasEmpleado / totalEmpleado) * 100).toFixed(2) : 0
          });
        }
      }

      res.json({
        success: true,
        data: {
          estadisticas_generales: {
            total: totalDisponibilidades,
            activas: disponibilidadesActivas,
            bloqueadas: disponibilidadesBloqueadas,
            porcentaje_disponible: totalDisponibilidades > 0 ?
              ((disponibilidadesActivas / totalDisponibilidades) * 100).toFixed(2) : 0
          },
          ...(estadisticasPorEmpleado.length > 0 && {
            estadisticas_por_empleado: estadisticasPorEmpleado
          }),
          periodo: {
            fecha_desde: fecha_desde || 'Desde el inicio',
            fecha_hasta: fecha_hasta || 'Hasta la fecha actual'
          }
        }
      });
    } catch (error) {
      console.error('Error en getStats:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }
};

module.exports = disponibilidadController;