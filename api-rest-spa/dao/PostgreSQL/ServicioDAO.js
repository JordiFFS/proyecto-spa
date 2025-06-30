const { Op } = require('sequelize');

class ServicioDAO {
    constructor(model) {
        this.model = model;
    }

    async crear(servicioDTO) {
        try {
            const servicio = await this.model.create({
                nombre: servicioDTO.nombre,
                descripcion: servicioDTO.descripcion,
                duracion: servicioDTO.duracion,
                precio: servicioDTO.precio,
                activo: servicioDTO.activo
            });

            return servicio.id;
        } catch (error) {
            throw new Error(`Error al crear servicio: ${error.message}`);
        }
    }

    async obtenerPorId(id) {
        try {
            return await this.model.findOne({ where: { id } });
        } catch (error) {
            throw new Error(`Error al obtener servicio: ${error.message}`);
        }
    }

    async obtenerTodos(filtros = {}) {
        try {
            const where = {};

            if (filtros.activo !== undefined) {
                where.activo = filtros.activo;
            }
            if (filtros.busqueda) {
                where[Op.or] = [
                    { nombre: { [Op.iLike]: `%${filtros.busqueda}%` } },
                    { descripcion: { [Op.iLike]: `%${filtros.busqueda}%` } }
                ];
            }
            if (filtros.precio_min) {
                where.precio = { ...where.precio, [Op.gte]: filtros.precio_min };
            }
            if (filtros.precio_max) {
                where.precio = { ...where.precio, [Op.lte]: filtros.precio_max };
            }

            const opciones = { where };
            if (filtros.limite) opciones.limit = filtros.limite;
            if (filtros.offset) opciones.offset = filtros.offset;
            opciones.order = [['nombre', 'ASC']];

            return await this.model.findAndCountAll(opciones);
        } catch (error) {
            throw new Error(`Error al obtener servicios: ${error.message}`);
        }
    }

    async obtenerActivos() {
        try {
            return await this.model.findAll({
                where: { activo: true },
                order: [['nombre', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error al obtener servicios activos: ${error.message}`);
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
            throw new Error(`Error al actualizar servicio: ${error.message}`);
        }
    }

    async eliminar(id) {
        try {
            const filasEliminadas = await this.model.destroy({ where: { id } });
            return filasEliminadas > 0;
        } catch (error) {
            throw new Error(`Error al eliminar servicio: ${error.message}`);
        }
    }

    async cambiarEstado(id, activo) {
        try {
            return await this.actualizar(id, { activo });
        } catch (error) {
            throw new Error(`Error al cambiar estado del servicio: ${error.message}`);
        }
    }
}

module.exports = ServicioDAO;