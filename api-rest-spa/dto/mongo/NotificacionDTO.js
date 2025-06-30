class NotificacionDTO {
    constructor(data = {}) {
        this.id = data._id || data.id || null;
        this.usuario_id = data.usuario_id || null;
        this.tipo = data.tipo || 'sistema';
        this.titulo = data.titulo || '';
        this.mensaje = data.mensaje || '';
        this.leida = data.leida || false;
        this.fecha_lectura = data.fecha_lectura || null;
        this.canal = data.canal || 'app';
        this.datos_adicionales = data.datos_adicionales || {};
        this.programada_para = data.programada_para || null;
        this.enviada = data.enviada || false;
        this.fecha_envio = data.fecha_envio || null;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    toJSON() {
        return {
            id: this.id,
            usuario_id: this.usuario_id,
            tipo: this.tipo,
            titulo: this.titulo,
            mensaje: this.mensaje,
            leida: this.leida,
            fecha_lectura: this.fecha_lectura,
            canal: this.canal,
            datos_adicionales: this.datos_adicionales,
            programada_para: this.programada_para,
            enviada: this.enviada,
            fecha_envio: this.fecha_envio,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static validate(data) {
        const errors = [];
        const tiposValidos = ['reserva', 'recordatorio', 'promoción', 'sistema', 'empleado'];
        const canalesValidos = ['app', 'email', 'sms', 'push'];

        if (!data.usuario_id) {
            errors.push('ID de usuario es requerido');
        }

        if (!data.tipo || !tiposValidos.includes(data.tipo)) {
            errors.push('Tipo debe ser: reserva, recordatorio, promoción, sistema o empleado');
        }

        if (!data.titulo || data.titulo.trim().length === 0) {
            errors.push('Título es requerido');
        }

        if (!data.mensaje || data.mensaje.trim().length === 0) {
            errors.push('Mensaje es requerido');
        }

        if (data.canal && !canalesValidos.includes(data.canal)) {
            errors.push('Canal debe ser: app, email, sms o push');
        }

        return { isValid: errors.length === 0, errors };
    }
}

module.exports = NotificacionDTO;