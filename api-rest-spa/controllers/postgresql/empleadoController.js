const { Empleado, Usuario } = require('../../models/psql');
const { Op } = require("sequelize");

const empleadoController = {
    // Crear empleado
    create: async (req, res) => {
        try {
            const { usuario_id, especialidad, horario_inicio, horario_fin, dias_trabajo } = req.body;

            // Verificar que el usuario existe y tiene rol empleado
            const usuario = await Usuario.findByPk(usuario_id);
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            if (usuario.rol !== 'empleado') {
                return res.status(400).json({
                    success: false,
                    message: 'El usuario debe tener rol de empleado'
                });
            }

            // Verificar que no exista ya un empleado para este usuario
            const existingEmpleado = await Empleado.findOne({ where: { usuario_id } });
            if (existingEmpleado) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un perfil de empleado para este usuario'
                });
            }

            const empleado = await Empleado.create({
                usuario_id,
                especialidad,
                horario_inicio,
                horario_fin,
                dias_trabajo
            });

            // Incluir datos del usuario en la respuesta
            const empleadoConUsuario = await Empleado.findByPk(empleado.id, {
                include: [{
                    model: Usuario,
                    attributes: ['id', 'nombre', 'email', 'telefono']
                }]
            });

            res.status(201).json({
                success: true,
                message: 'Empleado creado exitosamente',
                data: empleadoConUsuario
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear empleado',
                error: error.message
            });
        }
    },

    // Obtener todos los empleados
    getAll: async (req, res) => {
        try {
            const { page = 1, limit = 10, activo, especialidad, search } = req.query;
            const offset = (page - 1) * limit;

            const whereClause = {};
            const userWhereClause = {};

            // Filtros
            if (activo !== undefined) whereClause.activo = activo === 'true';
            if (especialidad) whereClause.especialidad = { [Op.iLike]: `%${especialidad}%` };
            if (search) {
                userWhereClause[Op.or] = [
                    { nombre: { [Op.iLike]: `%${search}%` } },
                    { email: { [Op.iLike]: `%${search}%` } }
                ];
            }

            const { count, rows } = await Empleado.findAndCountAll({
                where: whereClause,
                include: [{
                    model: Usuario,
                    attributes: ['id', 'nombre', 'email', 'telefono', 'activo'],
                    where: Object.keys(userWhereClause).length ? userWhereClause : undefined
                }],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['createdAt', 'DESC']]
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
                message: 'Error al obtener empleados',
                error: error.message
            });
        }
    },

    // Obtener empleados activos
    getActive: async (req, res) => {
        try {
            const empleados = await Empleado.findAll({
                where: { activo: true },
                include: [{
                    model: Usuario,
                    attributes: ['id', 'nombre', 'email', 'telefono'],
                    where: { activo: true }
                }],
                order: [[Usuario, 'nombre', 'ASC']]
            });

            res.json({
                success: true,
                data: empleados
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener empleados activos',
                error: error.message
            });
        }
    },

    // Obtener empleado por ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;

            const empleado = await Empleado.findByPk(id, {
                include: [{
                    model: Usuario,
                    attributes: ['id', 'nombre', 'email', 'telefono', 'activo']
                }]
            });

            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
            }

            res.json({
                success: true,
                data: empleado
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener empleado',
                error: error.message
            });
        }
    },

    // Obtener empleado por usuario ID
    getByUserId: async (req, res) => {
        try {
            const { usuario_id } = req.params;

            const empleado = await Empleado.findOne({
                where: { usuario_id },
                include: [{
                    model: Usuario,
                    attributes: ['id', 'nombre', 'email', 'telefono', 'activo']
                }]
            });

            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado para este usuario'
                });
            }

            res.json({
                success: true,
                data: empleado
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener empleado',
                error: error.message
            });
        }
    },

    // Actualizar empleado
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { especialidad, horario_inicio, horario_fin, dias_trabajo, activo } = req.body;

            const empleado = await Empleado.findByPk(id);

            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
            }

            await empleado.update({
                especialidad: especialidad || empleado.especialidad,
                horario_inicio: horario_inicio || empleado.horario_inicio,
                horario_fin: horario_fin || empleado.horario_fin,
                dias_trabajo: dias_trabajo || empleado.dias_trabajo,
                activo: activo !== undefined ? activo : empleado.activo
            });

            // Obtener empleado actualizado con datos del usuario
            const empleadoActualizado = await Empleado.findByPk(id, {
                include: [{
                    model: Usuario,
                    attributes: ['id', 'nombre', 'email', 'telefono', 'activo']
                }]
            });

            res.json({
                success: true,
                message: 'Empleado actualizado exitosamente',
                data: empleadoActualizado
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar empleado',
                error: error.message
            });
        }
    },

    // Eliminar empleado (soft delete)
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const empleado = await Empleado.findByPk(id);

            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
            }

            await empleado.update({ activo: false });

            res.json({
                success: true,
                message: 'Empleado desactivado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar empleado',
                error: error.message
            });
        }
    },

    // Reactivar empleado
    reactivate: async (req, res) => {
        try {
            const { id } = req.params;

            const empleado = await Empleado.findByPk(id);

            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
            }

            await empleado.update({ activo: true });

            res.json({
                success: true,
                message: 'Empleado reactivado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al reactivar empleado',
                error: error.message
            });
        }
    },

    // Obtener empleados disponibles por día
    getAvailableByDay: async (req, res) => {
        try {
            const { dia } = req.params; // lunes, martes, etc.

            const empleados = await Empleado.findAll({
                where: {
                    activo: true,
                    dias_trabajo: {
                        [Op.contains]: [dia.toLowerCase()]
                    }
                },
                include: [{
                    model: Usuario,
                    attributes: ['id', 'nombre', 'email'],
                    where: { activo: true }
                }],
                order: [[Usuario, 'nombre', 'ASC']]
            });

            res.json({
                success: true,
                data: empleados
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener empleados disponibles',
                error: error.message
            });
        }
    }
};

module.exports = empleadoController;