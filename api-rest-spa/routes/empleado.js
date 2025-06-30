const express = require('express');
const {
    create,
    getAll,
    getActive,
    getById,
    getByUserId,
    update,
    delete: deleteEmpleado,
    reactivate,
    getAvailableByDay

} = require("../controllers/postgresql/empleadoController");
const router = express.Router();

// Rutas base http://localhost:3000/empleados
router.get("/", getAll);                    // GET /empleados - Obtener todos los empleados con paginación y filtros
router.get("/activos", getActive);          // GET /empleados/activos - Obtener solo empleados activos
router.get("/:id", getById);                // GET /empleados/:id - Obtener empleado por ID
router.post("/", create);                   // POST /empleados - Crear nuevo empleado
router.put("/:id", update);                 // PUT /empleados/:id - Actualizar empleado

// Rutas específicas para funcionalidades adicionales
router.get("/usuario/:usuario_id", getByUserId);        // GET /empleados/usuario/:usuario_id - Obtener empleado por usuario ID
router.get("/disponibles/:dia", getAvailableByDay);     // GET /empleados/disponibles/:dia - Obtener empleados disponibles por día
router.delete("/:id", deleteEmpleado);                  // DELETE /empleados/:id - Desactivar empleado (soft delete)
router.put("/:id/reactivate", reactivate);              // PUT /empleados/:id/reactivate - Reactivar empleado

module.exports = router;