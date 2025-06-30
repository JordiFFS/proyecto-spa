class ServicioDTO {
    constructor(data = {}) {
        this.id = data.id || null;
        this.nombre = data.nombre || '';
        this.descripcion = data.descripcion || null;
        this.duracion = data.duracion || 0;
        this.precio = data.precio || 0;
        this.activo = data.activo !== undefined ? data.activo : true;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    static validate(data) {
        const errors = [];

        if (!data.nombre || data.nombre.trim().length === 0) {
            errors.push('El nombre del servicio es requerido');
        }

        if (!data.duracion || data.duracion <= 0) {
            errors.push('La duración debe ser mayor a 0 minutos');
        }

        if (!data.precio || data.precio <= 0) {
            errors.push('El precio debe ser mayor a 0');
        }

        return { isValid: errors.length === 0, errors };
    }
}

module.exports = ServicioDTO;