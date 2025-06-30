const mongoose = require('mongoose');

const NotificacionSchema = new mongoose.Schema({
  usuario_id: {
    type: Number,
    required: true
  },
  tipo: {
    type: String,
    enum: ['reserva', 'recordatorio', 'promocion', 'sistema', 'empleado'],
    required: true
  },
  titulo: {
    type: String,
    required: true
  },
  mensaje: {
    type: String,
    required: true
  },
  leida: {
    type: Boolean,
    default: false
  },
  fecha_lectura: {
    type: Date,
    default: null
  },
  canal: {
    type: String,
    enum: ['app', 'email', 'sms', 'push'],
    default: 'app'
  },
  datos_adicionales: {
    reserva_id: Number,
    servicio_id: Number,
    empleado_id: Number,
    url_accion: String
  },
  programada_para: {
    type: Date,
    default: null
  },
  enviada: {
    type: Boolean,
    default: false
  },
  fecha_envio: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Índices
NotificacionSchema.index({ usuario_id: 1, leida: 1 });
NotificacionSchema.index({ tipo: 1, createdAt: -1 });
NotificacionSchema.index({ programada_para: 1, enviada: 1 });

const Notificacion = mongoose.model('notificacion', NotificacionSchema);

module.exports = Notificacion;