const express = require('express');
const {
    create,
    getAll,
    getStats,
    getById,
    update,
    delete: deleteReserva,
    changeStatus,
    getByEmployee,
    getByUser,
} = require("../controllers/postgresql/reservaController");
const router = express.Router();

// Rutas principales
router.post('/', create);                    // Crear reserva
router.get('/', getAll);                     // Obtener todas las reservas con filtros
router.get('/stats', getStats);              // Obtener estadísticas
router.get('/:id', getById);                 // Obtener reserva por ID
router.put('/:id', update);                  // Actualizar reserva
router.delete('/:id', deleteReserva);               // Eliminar reserva

// Rutas específicas
router.patch('/:id/status', changeStatus);   // Cambiar estado de reserva
router.get('/employee/:empleado_id', getByEmployee);  // Reservas por empleado
router.get('/user/:usuario_id', getByUser);           // Reservas por usuario

module.exports = router;