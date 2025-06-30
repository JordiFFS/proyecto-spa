class HistorialReservaDTO {
    constructor(data = {}) {
        this.id = data._id || data.id || null;
        this.reserva_id = data.reserva_id || null;
        this.usuario_id = data.usuario_id || null;
        this.empleado_id = data.empleado_id || null;
        this.servicio_id = data.servicio_id || null;
        this.estado_anterior = data.estado_anterior || '';
        this.estado_nuevo = data.estado_nuevo || '';
        this.fecha_cambio = data.fecha_cambio || new Date();
        this.motivo = data.motivo || null;
        this.comentarios = data.comentarios || null;
        this.calificacion = data.calificacion || {};
        this.duracion_real = data.duracion_real || null;
        this.precio_final = data.precio_final || null;
        this.metodos_pago = data.metodos_pago || [];
        this.productos_adicionales = data.productos_adicionales || [];
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    toJSON() {
        return {
            id: this.id,
            reserva_id: this.reserva_id,
            usuario_id: this.usuario_id,
            empleado_id: this.empleado_id,
            servicio_id: this.servicio_id,
            estado_anterior: this.estado_anterior,
            estado_nuevo: this.estado_nuevo,
            fecha_cambio: this.fecha_cambio,
            motivo: this.motivo,
            comentarios: this.comentarios,
            calificacion: this.calificacion,
            duracion_real: this.duracion_real,
            precio_final: this.precio_final,
            metodos_pago: this.metodos_pago,
            productos_adicionales: this.productos_adicionales,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static validate(data) {
        const errors = [];
        const tiposPagoValidos = ['efectivo', 'tarjeta', 'transferencia', 'digital'];

        if (!data.reserva_id) {
            errors.push('ID de reserva es requerido');
        }

        if (!data.usuario_id) {
            errors.push('ID de usuario es requerido');
        }

        if (!data.empleado_id) {
            errors.push('ID de empleado es requerido');
        }

        if (!data.servicio_id) {
            errors.push('ID de servicio es requerido');
        }

        if (!data.estado_anterior || data.estado_anterior.trim().length === 0) {
            errors.push('Estado anterior es requerido');
        }

        if (!data.estado_nuevo || data.estado_nuevo.trim().length === 0) {
            errors.push('Estado nuevo es requerido');
        }

        // Validar métodos de pago
        if (data.metodos_pago && Array.isArray(data.metodos_pago)) {
            data.metodos_pago.forEach((metodo, index) => {
                if (!metodo.tipo || !tiposPagoValidos.includes(metodo.tipo)) {
                    errors.push(`Método de pago ${index + 1}: tipo debe ser efectivo, tarjeta, transferencia o digital`);
                }
                if (!metodo.monto || metodo.monto <= 0) {
                    errors.push(`Método de pago ${index + 1}: monto debe ser mayor a 0`);
                }
            });
        }

        // Validar calificación
        if (data.calificacion && data.calificacion.puntuacion) {
            if (data.calificacion.puntuacion < 1 || data.calificacion.puntuacion > 5) {
                errors.push('La puntuación debe estar entre 1 y 5');
            }
        }

        return { isValid: errors.length === 0, errors };
    }
}

module.exports = HistorialReservaDTO;