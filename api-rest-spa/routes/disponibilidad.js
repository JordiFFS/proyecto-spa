const express = require('express');
const {
    getActive,
    getAvailableSlots,
    create,
    getAll,
    getById,
    getStats,
    update,
    delete: deleteDisponibilidad,
    getByEmployee,
    generateAutoSchedule,
    blockSchedule,
    unblockSchedule,
    debugEmployees
} = require("../controllers/postgresql/disponibilidadController");
const router = express.Router();

// Rutas principales de disponibilidad
router.post('/', create);
router.get('/', getAll);
router.get('/active', getActive);
router.get('/stats', getStats);
router.get('/available-slots', getAvailableSlots);
router.get('/debug/employees', debugEmployees);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', deleteDisponibilidad);

// Rutas específicas por empleado
router.get('/employee/:empleado_id', getByEmployee);
router.post('/employee/:empleado_id/auto-generate', generateAutoSchedule);

// Rutas de bloqueo/desbloqueo
router.post('/block', blockSchedule);
router.put('/:id/unblock', unblockSchedule);

// Rutas administrativas (requieren permisos de admin)
// router.use(adminMiddleware); // Descomenta si tienes middleware de admin

module.exports = router;