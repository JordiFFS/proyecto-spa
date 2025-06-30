const express = require('express');
const {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    getHistorialPorReserva,
    agregarCalificacion,
    getEstadisticas,
    getCalificacionesPorEmpleado,
} = require("../controllers/historialReserva");
const router = express.Router();

// Rutas principales
router.get('/', getItems);
router.get('/estadisticas', getEstadisticas);
router.get('/:id', getItem);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

// Rutas especiales
router.get('/reserva/:reserva_id', getHistorialPorReserva);
router.post('/calificacion', agregarCalificacion);
router.get('/calificaciones/:empleado_id', getCalificacionesPorEmpleado);

module.exports = router;