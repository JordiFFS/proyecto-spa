const express = require('express');
const {
    getAll,
    getActive,
    getById,
    create,
    update,
    delete: deleteServicio,
    reactivate,
    getStats,
} = require("../controllers/postgresql/servicioController");
const router = express.Router();

router.get("/", getAll);                    // GET /servicios - Obtener todos los servicios con paginación y filtros
router.get("/activos", getActive);          // GET /servicios/activos - Obtener solo servicios activos
router.get("/:id", getById);                // GET /servicios/:id - Obtener servicio por ID
router.post("/", create);                   // POST /servicios - Crear nuevo servicio
router.put("/:id", update);                 // PUT /servicios/:id - Actualizar servicio

router.get("/estadisticas", getStats);      // GET /servicios/estadisticas - Obtener estadísticas de servicios

router.delete("/:id", deleteServicio);      // DELETE /servicios/:id - Desactivar servicio (soft delete)
router.put("/:id/reactivate", reactivate);  // PUT /servicios/:id/reactivate - Reactivar servicio

module.exports = router;