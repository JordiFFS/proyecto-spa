const { Servicio } = require("../../models/psql");
const { Op } = require("sequelize");

const servicioController = {
    // Crear servicio
    create: async (req, res) => {
        try {
            const { nombre, descripcion, duracion, precio } = req.body;

            const servicio = await Servicio.create({
                nombre,
                descripcion,
                duracion,
                precio
            });

            res.status(201).json({
                success: true,
                message: 'Servicio creado exitosamente',
                data: servicio
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear servicio',
                error: error.message
            });
        }
    },

    // Obtener todos los servicios
    getAll: async (req, res) => {
        try {
            const { page = 1, limit = 10, activo, search, minPrecio, maxPrecio } = req.query;
            const offset = (page - 1) * limit;

            const whereClause = {};

            // Filtros
            if (activo !== undefined) whereClause.activo = activo === 'true';
            if (search) {
                whereClause[Op.or] = [
                    { nombre: { [Op.iLike]: `%${search}%` } },
                    { descripcion: { [Op.iLike]: `%${search}%` } }
                ];
            }
            if (minPrecio) whereClause.precio = { [Op.gte]: parseFloat(minPrecio) };
            if (maxPrecio) {
                whereClause.precio = whereClause.precio
                    ? { ...whereClause.precio, [Op.lte]: parseFloat(maxPrecio) }
                    : { [Op.lte]: parseFloat(maxPrecio) };
            }

            const { count, rows } = await Servicio.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['nombre', 'ASC']]
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
            res.status(500).json({
                success: false,
                message: 'Error al obtener servicios',
                error: error.message
            });
        }
    },

    // Obtener servicios activos (para clientes)
    getActive: async (req, res) => {
        try {
            const servicios = await Servicio.findAll({
                where: { activo: true },
                order: [['nombre', 'ASC']]
            });

            res.json({
                success: true,
                data: servicios
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener servicios activos',
                error: error.message
            });
        }
    },

    // Obtener servicio por ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;

            const servicio = await Servicio.findByPk(id);

            if (!servicio) {
                return res.status(404).json({
                    success: false,
                    message: 'Servicio no encontrado'
                });
            }

            res.json({
                success: true,
                data: servicio
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener servicio',
                error: error.message
            });
        }
    },

    // Actualizar servicio
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, descripcion, duracion, precio, activo } = req.body;

            const servicio = await Servicio.findByPk(id);

            if (!servicio) {
                return res.status(404).json({
                    success: false,
                    message: 'Servicio no encontrado'
                });
            }

            await servicio.update({
                nombre: nombre || servicio.nombre,
                descripcion: descripcion || servicio.descripcion,
                duracion: duracion || servicio.duracion,
                precio: precio || servicio.precio,
                activo: activo !== undefined ? activo : servicio.activo
            });

            res.json({
                success: true,
                message: 'Servicio actualizado exitosamente',
                data: servicio
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar servicio',
                error: error.message
            });
        }
    },

    // Eliminar servicio (soft delete)
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const servicio = await Servicio.findByPk(id);

            if (!servicio) {
                return res.status(404).json({
                    success: false,
                    message: 'Servicio no encontrado'
                });
            }

            await servicio.update({ activo: false });

            res.json({
                success: true,
                message: 'Servicio desactivado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar servicio',
                error: error.message
            });
        }
    },

    // Reactivar servicio
    reactivate: async (req, res) => {
        try {
            const { id } = req.params;

            const servicio = await Servicio.findByPk(id);

            if (!servicio) {
                return res.status(404).json({
                    success: false,
                    message: 'Servicio no encontrado'
                });
            }

            await servicio.update({ activo: true });

            res.json({
                success: true,
                message: 'Servicio reactivado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al reactivar servicio',
                error: error.message
            });
        }
    },

    // Obtener estadísticas de servicios
    getStats: async (req, res) => {
        try {
            const totalServicios = await Servicio.count();
            const serviciosActivos = await Servicio.count({ where: { activo: true } });
            const serviciosInactivos = await Servicio.count({ where: { activo: false } });

            const precioPromedio = await Servicio.findOne({
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('precio')), 'promedio']
                ],
                where: { activo: true }
            });

            res.json({
                success: true,
                data: {
                    total: totalServicios,
                    activos: serviciosActivos,
                    inactivos: serviciosInactivos,
                    precioPromedio: parseFloat(precioPromedio?.dataValues?.promedio || 0).toFixed(2)
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

module.exports = servicioController;