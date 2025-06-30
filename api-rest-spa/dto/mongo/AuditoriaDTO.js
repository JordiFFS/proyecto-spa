class AuditoriaDTO {
    constructor(data = {}) {
        this.id = data._id || data.id || null;
        this.usuario_id = data.usuario_id || null;
        this.accion = data.accion || '';
        this.tabla_afectada = data.tabla_afectada || '';
        this.registro_id = data.registro_id || null;
        this.valores_anteriores = data.valores_anteriores || null;
        this.valores_nuevos = data.valores_nuevos || null;
        this.ip = data.ip || '';
        this.user_agent = data.user_agent || null;
        this.metodo_http = data.metodo_http || '';
        this.endpoint = data.endpoint || '';
        this.resultado = data.resultado || 'exitoso';
        this.mensaje_error = data.mensaje_error || null;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    toJSON() {
        return {
            id: this.id,
            usuario_id: this.usuario_id,
            accion: this.accion,
            tabla_afectada: this.tabla_afectrada,
            registro_id: this.registro_id,
            valores_anteriores: this.valores_anteriores,
            valores_nuevos: this.valores_nuevos,
            ip: this.ip,
            user_agent: this.user_agent,
            metodo_http: this.metodo_http,
            endpoint: this.endpoint,
            resultado: this.resultado,
            mensaje_error: this.mensaje_error,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static validate(data) {
        const errors = [];
        const resultadosValidos = ['exitoso', 'fallido'];

        if (!data.usuario_id) {
            errors.push('ID de usuario es requerido');
        }

        if (!data.accion || data.accion.trim().length === 0) {
            errors.push('Acción es requerida');
        }

        if (!data.tabla_afectada || data.tabla_afectada.trim().length === 0) {
            errors.push('Tabla afectada es requerida');
        }

        if (!data.registro_id) {
            errors.push('ID de registro es requerido');
        }

        if (!data.ip || data.ip.trim().length === 0) {
            errors.push('IP es requerida');
        }

        if (!data.metodo_http || data.metodo_http.trim().length === 0) {
            errors.push('Método HTTP es requerido');
        }

        if (!data.endpoint || data.endpoint.trim().length === 0) {
            errors.push('Endpoint es requerido');
        }

        if (data.resultado && !resultadosValidos.includes(data.resultado)) {
            errors.push('Resultado debe ser: exitoso o fallido');
        }

        return { isValid: errors.length === 0, errors };
    }
}

module.exports = AuditoriaDTO;