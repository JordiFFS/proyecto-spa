const { Op } = require('sequelize');

class UsuarioDAO {
    constructor(model) {
        this.model = model;
    }

    async crear(usuarioDTO) {
        try {
            const usuario = await this.model.create({
                nombre: usuarioDTO.nombre,
                email: usuarioDTO.email,
                password: usuarioDTO.password,
                telefono: usuarioDTO.telefono,
                rol: usuarioDTO.rol,
                activo: usuarioDTO.activo
            });

            return usuario.id;
        } catch (error) {
            throw new Error(`Error al crear usuario: ${error.message}`);
        }
    }

    async obtenerPorId(id, incluirRelaciones = false) {
        try {
            const opciones = { where: { id } };

            if (incluirRelaciones) {
                opciones.include = [
                    { association: 'empleado' },
                    { association: 'reservas' }
                ];
            }

            return await this.model.findOne(opciones);
        } catch (error) {
            throw new Error(`Error al obtener usuario: ${error.message}`);
        }
    }

    async obtenerPorEmail(email) {
        try {
            return await this.model.findOne({ where: { email } });
        } catch (error) {
            throw new Error(`Error al obtener usuario por email: ${error.message}`);
        }
    }

    async obtenerTodos(filtros = {}) {
        try {
            const where = {};

            if (filtros.rol) {
                where.rol = filtros.rol;
            }
            if (filtros.activo !== undefined) {
                where.activo = filtros.activo;
            }
            if (filtros.busqueda) {
                where[Op.or] = [
                    { nombre: { [Op.iLike]: `%${filtros.busqueda}%` } },
                    { email: { [Op.iLike]: `%${filtros.busqueda}%` } }
                ];
            }

            const opciones = { where };
            if (filtros.limite) opciones.limit = filtros.limite;
            if (filtros.offset) opciones.offset = filtros.offset;

            return await this.model.findAndCountAll(opciones);
        } catch (error) {
            throw new Error(`Error al obtener usuarios: ${error.message}`);
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
            throw new Error(`Error al actualizar usuario: ${error.message}`);
        }
    }

    async eliminar(id) {
        try {
            const filasEliminadas = await this.model.destroy({ where: { id } });
            return filasEliminadas > 0;
        } catch (error) {
            throw new Error(`Error al eliminar usuario: ${error.message}`);
        }
    }

    async existeEmail(email, excluirId = null) {
        try {
            const where = { email };
            if (excluirId) {
                where.id = { [Op.ne]: excluirId };
            }

            const usuario = await this.model.findOne({ where });
            return !!usuario;
        } catch (error) {
            throw new Error(`Error al verificar email: ${error.message}`);
        }
    }
}

module.exports = UsuarioDAO;