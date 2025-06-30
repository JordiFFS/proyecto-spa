const { Reserva, Usuario, Empleado, Servicio, Disponibilidad } = require("../../models/psql");
const { Op } = require("sequelize");

const reservaController = {
  // Crear nueva reserva
  create: async (req, res) => {
    const transaction = await Reserva.sequelize.transaction();

    try {
      const {
        usuario_id,
        empleado_id,
        servicio_id,
        fecha,
        hora_inicio,
        notas
      } = req.body;

      // Validar que el servicio existe
      const servicio = await Servicio.findByPk(servicio_id);
      if (!servicio) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        });
      }

      // Validar que el empleado existe y está activo
      const empleado = await Empleado.findOne({
        where: {
          id: empleado_id,
          activo: true
        },
        include: [Usuario]
      });

      if (!empleado) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Empleado no encontrado o inactivo'
        });
      }

      // Calcular hora de fin basada en la duración del servicio
      const horaInicio = new Date(`1970-01-01T${hora_inicio}`);
      const horaFin = new Date(horaInicio.getTime() + servicio.duracion * 60000);
      const hora_fin = horaFin.toTimeString().split(' ')[0];

      // Verificar disponibilidad del empleado
      const conflicto = await Reserva.findOne({
        where: {
          empleado_id,
          fecha,
          estado: ['pendiente', 'confirmada'],
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
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'El empleado no está disponible en ese horario'
        });
      }

      // Crear la reserva
      const nuevaReserva = await Reserva.create({
        usuario_id,
        empleado_id,
        servicio_id,
        fecha,
        hora_inicio,
        hora_fin,
        notas,
        precio_total: servicio.precio,
        estado: 'pendiente'
      }, { transaction });

      await transaction.commit();

      // Obtener la reserva completa con relaciones
      const reservaCompleta = await Reserva.findByPk(nuevaReserva.id, {
        include: [
          {
            model: Usuario,
            attributes: ['id', 'nombre', 'email', 'telefono']
          },
          {
            model: Empleado,
            include: [{
              model: Usuario,
              attributes: ['id', 'nombre', 'email']
            }]
          },
          {
            model: Servicio,
            attributes: ['id', 'nombre', 'descripcion', 'duracion', 'precio']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Reserva creada exitosamente',
        data: reservaCompleta
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear reserva:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear reserva',
        error: error.message
      });
    }
  },

  // Obtener todas las reservas con filtros
  getAll: async (req, res) => {
    try {
      const {
        estado,
        empleado_id,
        usuario_id,
        fecha_desde,
        fecha_hasta,
        page = 1,
        limit = 10
      } = req.query;

      const whereClause = {};

      if (estado) whereClause.estado = estado;
      if (empleado_id) whereClause.empleado_id = empleado_id;
      if (usuario_id) whereClause.usuario_id = usuario_id;

      if (fecha_desde && fecha_hasta) {
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

      const offset = (page - 1) * limit;

      const { count, rows: reservas } = await Reserva.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Usuario,
            attributes: ['id', 'nombre', 'email', 'telefono']
          },
          {
            model: Empleado,
            include: [{
              model: Usuario,
              attributes: ['id', 'nombre', 'email']
            }]
          },
          {
            model: Servicio,
            attributes: ['id', 'nombre', 'descripcion', 'duracion', 'precio']
          }
        ],
        order: [['fecha', 'DESC'], ['hora_inicio', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: reservas,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      console.error('Error al obtener reservas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener reservas',
        error: error.message
      });
    }
  },

  // Obtener reserva por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const reserva = await Reserva.findByPk(id, {
        include: [
          {
            model: Usuario,
            attributes: ['id', 'nombre', 'email', 'telefono']
          },
          {
            model: Empleado,
            include: [{
              model: Usuario,
              attributes: ['id', 'nombre', 'email']
            }]
          },
          {
            model: Servicio,
            attributes: ['id', 'nombre', 'descripcion', 'duracion', 'precio']
          }
        ]
      });

      if (!reserva) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }

      res.json({
        success: true,
        data: reserva
      });

    } catch (error) {
      console.error('Error al obtener reserva:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener reserva',
        error: error.message
      });
    }
  },

  // Actualizar reserva
  update: async (req, res) => {
    const transaction = await Reserva.sequelize.transaction();

    try {
      const { id } = req.params;
      const actualizaciones = req.body;

      const reserva = await Reserva.findByPk(id);
      if (!reserva) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }

      // Si se actualiza fecha, hora o empleado, verificar disponibilidad
      if (actualizaciones.fecha || actualizaciones.hora_inicio || actualizaciones.empleado_id) {
        const empleado_id = actualizaciones.empleado_id || reserva.empleado_id;
        const fecha = actualizaciones.fecha || reserva.fecha;
        const hora_inicio = actualizaciones.hora_inicio || reserva.hora_inicio;

        // Obtener servicio para calcular hora_fin si es necesario
        const servicio = await Servicio.findByPk(reserva.servicio_id);
        const horaInicio = new Date(`1970-01-01T${hora_inicio}`);
        const horaFin = new Date(horaInicio.getTime() + servicio.duracion * 60000);
        const hora_fin = horaFin.toTimeString().split(' ')[0];

        // Verificar conflictos excluyendo la reserva actual
        const conflicto = await Reserva.findOne({
          where: {
            id: { [Op.ne]: id },
            empleado_id,
            fecha,
            estado: ['pendiente', 'confirmada'],
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
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'El empleado no está disponible en ese horario'
          });
        }

        if (actualizaciones.hora_inicio) {
          actualizaciones.hora_fin = hora_fin;
        }
      }

      await reserva.update(actualizaciones, { transaction });
      await transaction.commit();

      // Obtener la reserva actualizada con relaciones
      const reservaActualizada = await Reserva.findByPk(id, {
        include: [
          {
            model: Usuario,
            attributes: ['id', 'nombre', 'email', 'telefono']
          },
          {
            model: Empleado,
            include: [{
              model: Usuario,
              attributes: ['id', 'nombre', 'email']
            }]
          },
          {
            model: Servicio,
            attributes: ['id', 'nombre', 'descripcion', 'duracion', 'precio']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Reserva actualizada exitosamente',
        data: reservaActualizada
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error al actualizar reserva:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar reserva',
        error: error.message
      });
    }
  },

  // Cambiar estado de reserva
  changeStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, motivo } = req.body;

      const estadosValidos = ['pendiente', 'confirmada', 'completada', 'cancelada'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado no válido'
        });
      }

      const reserva = await Reserva.findByPk(id);
      if (!reserva) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }

      const estadoAnterior = reserva.estado;
      await reserva.update({
        estado,
        ...(motivo && { notas: `${reserva.notas || ''}\nCambio de estado: ${motivo}`.trim() })
      });

      res.json({
        success: true,
        message: `Estado cambiado de ${estadoAnterior} a ${estado}`,
        data: reserva
      });

    } catch (error) {
      console.error('Error al cambiar estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cambiar estado',
        error: error.message
      });
    }
  },

  // Eliminar reserva (soft delete)
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const reserva = await Reserva.findByPk(id);
      if (!reserva) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }

      // Solo permitir eliminar reservas pendientes o canceladas
      if (!['pendiente', 'cancelada'].includes(reserva.estado)) {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden eliminar reservas pendientes o canceladas'
        });
      }

      await reserva.destroy();

      res.json({
        success: true,
        message: 'Reserva eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar reserva:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar reserva',
        error: error.message
      });
    }
  },

  // Obtener reservas por empleado
  getByEmployee: async (req, res) => {
    try {
      const { empleado_id } = req.params;
      const { fecha, estado } = req.query;

      const whereClause = { empleado_id };
      if (fecha) whereClause.fecha = fecha;
      if (estado) whereClause.estado = estado;

      const reservas = await Reserva.findAll({
        where: whereClause,
        include: [
          {
            model: Usuario,
            attributes: ['id', 'nombre', 'email', 'telefono']
          },
          {
            model: Servicio,
            attributes: ['id', 'nombre', 'descripcion', 'duracion', 'precio']
          }
        ],
        order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']]
      });

      res.json({
        success: true,
        data: reservas
      });

    } catch (error) {
      console.error('Error al obtener reservas por empleado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener reservas por empleado',
        error: error.message
      });
    }
  },

  // Obtener reservas por usuario
  getByUser: async (req, res) => {
    try {
      const { usuario_id } = req.params;
      const { estado, fecha_desde, fecha_hasta } = req.query;

      const whereClause = { usuario_id };
      if (estado) whereClause.estado = estado;

      if (fecha_desde && fecha_hasta) {
        whereClause.fecha = {
          [Op.between]: [fecha_desde, fecha_hasta]
        };
      }

      const reservas = await Reserva.findAll({
        where: whereClause,
        include: [
          {
            model: Empleado,
            include: [{
              model: Usuario,
              attributes: ['id', 'nombre', 'email']
            }]
          },
          {
            model: Servicio,
            attributes: ['id', 'nombre', 'descripcion', 'duracion', 'precio']
          }
        ],
        order: [['fecha', 'DESC'], ['hora_inicio', 'DESC']]
      });

      res.json({
        success: true,
        data: reservas
      });

    } catch (error) {
      console.error('Error al obtener reservas por usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener reservas por usuario',
        error: error.message
      });
    }
  },

  // Obtener estadísticas de reservas
  getStats: async (req, res) => {
    try {
      const totalReservas = await Reserva.count();
      const reservasPendientes = await Reserva.count({ where: { estado: 'pendiente' } });
      const reservasConfirmadas = await Reserva.count({ where: { estado: 'confirmada' } });
      const reservasCompletadas = await Reserva.count({ where: { estado: 'completada' } });
      const reservasCanceladas = await Reserva.count({ where: { estado: 'cancelada' } });

      const ingresoTotal = await Reserva.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('precio_total')), 'total']
        ],
        where: { estado: 'completada' }
      });

      res.json({
        success: true,
        data: {
          total: totalReservas,
          pendientes: reservasPendientes,
          confirmadas: reservasConfirmadas,
          completadas: reservasCompletadas,
          canceladas: reservasCanceladas,
          ingresoTotal: parseFloat(ingresoTotal?.dataValues?.total || 0).toFixed(2)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }
};

module.exports = reservaController;
