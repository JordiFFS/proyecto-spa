const mongoose = require('mongoose');

const SugerenciaSchema = new mongoose.Schema({
  usuario_id: {
    type: Number,
    required: true,
    ref: 'Usuario' // Referencia al ID de PostgreSQL
  },
  tipo: {
    type: String,
    enum: ['servicio', 'empleado', 'horario', 'general'],
    required: true
  },
  contenido: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    default: 'general'
  },
  prioridad: {
    type: String,
    enum: ['baja', 'media', 'alta'],
    default: 'media'
  },
  estado: {
    type: String,
    enum: ['nueva', 'revisada', 'implementada', 'rechazada'],
    default: 'nueva'
  },
  respuesta: {
    type: String,
    default: null
  },
  respondido_por: {
    type: Number,
    default: null
  },
  metadata: {
    ip: String,
    user_agent: String,
    dispositivo: String
  }
}, {
  timestamps: true
});

// Índices
SugerenciaSchema.index({ usuario_id: 1, tipo: 1 });
SugerenciaSchema.index({ estado: 1, prioridad: 1 });
SugerenciaSchema.index({ createdAt: -1 });

const Sugerencia = mongoose.model('sugerencia', SugerenciaSchema);

module.exports = Sugerencia;