const mongoose = require('mongoose');

const HistorialReservaSchema = new mongoose.Schema({
  reserva_id: {
    type: Number,
    required: true,
    ref: 'Reserva'
  },
  usuario_id: {
    type: Number,
    required: true
  },
  empleado_id: {
    type: Number,
    required: true
  },
  servicio_id: {
    type: Number,
    required: true
  },
  estado_anterior: {
    type: String,
    required: true
  },
  estado_nuevo: {
    type: String,
    required: true
  },
  fecha_cambio: {
    type: Date,
    default: Date.now
  },
  motivo: {
    type: String,
    default: null
  },
  comentarios: {
    type: String,
    default: null
  },
  calificacion: {
    puntuacion: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comentario: {
      type: String,
      default: null
    },
    fecha_calificacion: {
      type: Date,
      default: null
    }
  },
  duracion_real: {
    type: Number, // en minutos
    default: null
  },
  precio_final: {
    type: Number,
    default: null
  },
  metodos_pago: [{
    tipo: {
      type: String,
      enum: ['efectivo', 'tarjeta', 'transferencia', 'digital']
    },
    monto: Number,
    referencia: String
  }],
  productos_adicionales: [{
    nombre: String,
    cantidad: Number,
    precio_unitario: Number
  }]
}, {
  timestamps: true
});

// Índices
HistorialReservaSchema.index({ reserva_id: 1 });
HistorialReservaSchema.index({ usuario_id: 1, createdAt: -1 });
HistorialReservaSchema.index({ empleado_id: 1, createdAt: -1 });

const HistorialReserva = mongoose.model('historialReserva', HistorialReservaSchema);

module.exports = HistorialReserva;