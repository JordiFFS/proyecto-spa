const mongoose = require('mongoose');

const AuditoriaSchema = new mongoose.Schema({
  usuario_id: {
    type: Number,
    required: true
  },
  accion: {
    type: String,
    required: true
  },
  tabla_afectada: {
    type: String,
    required: true
  },
  registro_id: {
    type: Number,
    required: true
  },
  valores_anteriores: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  valores_nuevos: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ip: {
    type: String,
    required: true
  },
  user_agent: {
    type: String,
    default: null
  },
  metodo_http: {
    type: String,
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  resultado: {
    type: String,
    enum: ['exitoso', 'fallido'],
    required: true
  },
  mensaje_error: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Índices
AuditoriaSchema.index({ usuario_id: 1, createdAt: -1 });
AuditoriaSchema.index({ tabla_afectada: 1, registro_id: 1 });
AuditoriaSchema.index({ accion: 1, createdAt: -1 });

const Auditoria = mongoose.model('auditoria', AuditoriaSchema);

module.exports = Auditoria;