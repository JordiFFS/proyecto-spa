class ReservaDTO {
    constructor(data = {}) {
        this.id = data.id || null;
        this.usuario_id = data.usuario_id || null;
        this.empleado_id = data.empleado_id || null;
        this.servicio_id = data.servicio_id || null;
        this.fecha = data.fecha || null;
        this.hora_inicio = data.hora_inicio || null;
        this.hora_fin = data.hora_fin || null;
        this.estado = data.estado || 'pendiente';
        this.notas = data.notas || null;
        this.precio_total = data.precio_total || 0;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;

        // Datos relacionados
        this.usuario = data.Usuario ? new UsuarioDTO(data.Usuario).toPublic() : null;
        this.empleado = data.Empleado ? new EmpleadoDTO(data.Empleado) : null;
        this.servicio = data.Servicio ? new ServicioDTO(data.Servicio) : null;
    }

    static validate(data) {
        const errors = [];
        const estadosValidos = ['pendiente', 'confirmada', 'completada', 'cancelada'];

        if (!data.usuario_id) {
            errors.push('ID de usuario es requerido');
        }

        if (!data.empleado_id) {
            errors.push('ID de empleado es requerido');
        }

        if (!data.servicio_id) {
            errors.push('ID de servicio es requerido');
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

        if (data.estado && !estadosValidos.includes(data.estado)) {
            errors.push('Estado debe ser: pendiente, confirmada, completada o cancelada');
        }

        if (!data.precio_total || data.precio_total <= 0) {
            errors.push('Precio total debe ser mayor a 0');
        }

        return { isValid: errors.length === 0, errors };
    }
}

module.exports = ReservaDTO;