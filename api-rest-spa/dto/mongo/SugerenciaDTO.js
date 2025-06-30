class SugerenciaDTO {
    constructor(data = {}) {
        this.id = data._id || data.id || null;
        this.usuario_id = data.usuario_id || null;
        this.tipo = data.tipo || 'general';
        this.contenido = data.contenido || '';
        this.categoria = data.categoria || 'general';
        this.prioridad = data.prioridad || 'media';
        this.estado = data.estado || 'nueva';
        this.respuesta = data.respuesta || null;
        this.respondido_por = data.respondido_por || null;
        this.metadata = data.metadata || {};
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    toJSON() {
        return {
            id: this.id,
            usuario_id: this.usuario_id,
            tipo: this.tipo,
            contenido: this.contenido,
            categoria: this.categoria,
            prioridad: this.prioridad,
            estado: this.estado,
            respuesta: this.respuesta,
            respondido_por: this.respondido_por,
            metadata: this.metadata,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static validate(data) {
        const errors = [];
        const tiposValidos = ['servicio', 'empleado', 'horario', 'general'];
        const prioridadesValidas = ['baja', 'media', 'alta'];
        const estadosValidos = ['nueva', 'revisada', 'implementada', 'rechazada'];

        if (!data.usuario_id) {
            errors.push('ID de usuario es requerido');
        }

        if (!data.tipo || !tiposValidos.includes(data.tipo)) {
            errors.push('Tipo debe ser: servicio, empleado, horario o general');
        }

        if (!data.contenido || data.contenido.trim().length === 0) {
            errors.push('Contenido de la sugerencia es requerido');
        }

        if (data.prioridad && !prioridadesValidas.includes(data.prioridad)) {
            errors.push('Prioridad debe ser: baja, media o alta');
        }

        if (data.estado && !estadosValidos.includes(data.estado)) {
            errors.push('Estado debe ser: nueva, revisada, implementada o rechazada');
        }

        return { isValid: errors.length === 0, errors };
    }
}

module.exports = SugerenciaDTO;