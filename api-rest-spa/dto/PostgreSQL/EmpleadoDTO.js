class EmpleadoDTO {
    constructor(data = {}) {
        this.id = data.id || null;
        this.usuario_id = data.usuario_id || null;
        this.especialidad = data.especialidad || null;
        this.horario_inicio = data.horario_inicio || null;
        this.horario_fin = data.horario_fin || null;
        this.dias_trabajo = data.dias_trabajo || [];
        this.activo = data.activo !== undefined ? data.activo : true;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;

        // Datos del usuario relacionado
        this.usuario = data.Usuario ? new UsuarioDTO(data.Usuario).toPublic() : null;
    }

    static validate(data) {
        const errors = [];
        const diasValidos = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

        if (!data.usuario_id) {
            errors.push('ID de usuario es requerido');
        }

        if (!data.horario_inicio) {
            errors.push('Horario de inicio es requerido');
        }

        if (!data.horario_fin) {
            errors.push('Horario de fin es requerido');
        }

        if (!data.dias_trabajo || !Array.isArray(data.dias_trabajo) || data.dias_trabajo.length === 0) {
            errors.push('Días de trabajo son requeridos');
        } else {
            const diasInvalidos = data.dias_trabajo.filter(dia => !diasValidos.includes(dia));
            if (diasInvalidos.length > 0) {
                errors.push(`Días inválidos: ${diasInvalidos.join(', ')}`);
            }
        }

        return { isValid: errors.length === 0, errors };
    }
}

module.exports = EmpleadoDTO;