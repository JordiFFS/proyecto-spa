class DisponibilidadDTO {
    constructor(data = {}) {
        this.id = data.id || null;
        this.empleado_id = data.empleado_id || null;
        this.fecha = data.fecha || null;
        this.hora_inicio = data.hora_inicio || null;
        this.hora_fin = data.hora_fin || null;
        this.disponible = data.disponible !== undefined ? data.disponible : true;
        this.motivo = data.motivo || null;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;

        // Datos del empleado relacionado
        this.empleado = data.Empleado ? new EmpleadoDTO(data.Empleado) : null;
    }

    static validate(data) {
        const errors = [];

        if (!data.empleado_id) {
            errors.push('ID de empleado es requerido');
        }

        if (!data.fecha) {
            errors.push('Fecha es requerida');
        }

        if (!data.hora_inicio) {
            errors.push('Hora de inicio es requerida');
        }

        if (!data.hora_fin) {
            errors.push('Hora de fin es requerida');
        }

        return { isValid: errors.length === 0, errors };
    }
}

module.exports = DisponibilidadDTO;