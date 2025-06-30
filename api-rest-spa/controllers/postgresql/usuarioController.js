const { Usuario } = require("../../models/psql");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const usuarioController = {
    // Crear usuario
    create: async (req, res) => {
        try {
            const { nombre, email, password, telefono, rol } = req.body;

            // Verificar si el email ya existe
            const existingUser = await Usuario.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está registrado'
                });
            }

            // Encriptar contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            const usuario = await Usuario.create({
                nombre,
                email,
                password: hashedPassword,
                telefono,
                rol: rol || 'cliente'
            });

            // No devolver la contraseña en la respuesta
            const { password: _, ...usuarioSinPassword } = usuario.toJSON();

            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                data: usuarioSinPassword
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear usuario',
                error: error.message
            });
        }
    },

    // Obtener todos los usuarios
    getAll: async (req, res) => {
        try {
            const { page = 1, limit = 10, rol, activo, search } = req.query;
            const offset = (page - 1) * limit;

            const whereClause = {};

            // Filtros
            if (rol) whereClause.rol = rol;
            if (activo !== undefined) whereClause.activo = activo === 'true';
            if (search) {
                whereClause[Op.or] = [
                    { nombre: { [Op.iLike]: `%${search}%` } },
                    { email: { [Op.iLike]: `%${search}%` } }
                ];
            }

            const { count, rows } = await Usuario.findAndCountAll({
                where: whereClause,
                attributes: { exclude: ['password'] },
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
                message: 'Error al obtener usuarios',
                error: error.message
            });
        }
    },

    // Obtener usuario por ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;

            const usuario = await Usuario.findByPk(id, {
                attributes: { exclude: ['password'] }
            });

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.json({
                success: true,
                data: usuario
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuario',
                error: error.message
            });
        }
    },

    // Actualizar usuario
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, email, telefono, rol, activo } = req.body;

            const usuario = await Usuario.findByPk(id);

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Verificar si el nuevo email ya existe (si se está cambiando)
            if (email && email !== usuario.email) {
                const existingUser = await Usuario.findOne({ where: { email } });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'El email ya está registrado'
                    });
                }
            }

            await usuario.update({
                nombre: nombre || usuario.nombre,
                email: email || usuario.email,
                telefono: telefono || usuario.telefono,
                rol: rol || usuario.rol,
                activo: activo !== undefined ? activo : usuario.activo
            });

            const { password: _, ...usuarioActualizado } = usuario.toJSON();

            res.json({
                success: true,
                message: 'Usuario actualizado exitosamente',
                data: usuarioActualizado
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar usuario',
                error: error.message
            });
        }
    },

    // Cambiar contraseña
    changePassword: async (req, res) => {
        try {
            const { id } = req.params;
            const { currentPassword, newPassword } = req.body;

            const usuario = await Usuario.findByPk(id);

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Verificar contraseña actual
            const isValidPassword = await bcrypt.compare(currentPassword, usuario.password);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Contraseña actual incorrecta'
                });
            }

            // Encriptar nueva contraseña
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            await usuario.update({ password: hashedNewPassword });

            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al cambiar contraseña',
                error: error.message
            });
        }
    },

    // Eliminar usuario (soft delete)
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const usuario = await Usuario.findByPk(id);

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            await usuario.update({ activo: false });

            res.json({
                success: true,
                message: 'Usuario desactivado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar usuario',
                error: error.message
            });
        }
    },

    // Reactivar usuario
    reactivate: async (req, res) => {
        try {
            const { id } = req.params;

            const usuario = await Usuario.findByPk(id);

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            await usuario.update({ activo: true });

            res.json({
                success: true,
                message: 'Usuario reactivado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al reactivar usuario',
                error: error.message
            });
        }
    }
};

module.exports = usuarioController;