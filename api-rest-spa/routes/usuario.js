const express = require("express");
const {
    create,
    getAll,
    getById,
    update,
    changePassword,
    delete: deleteUser,
    reactivate
} = require("../controllers/postgresql/usuarioController");
const router = express.Router();

// Rutas base http://localhost:3000/usuarios
router.get("/", getAll);           // GET /usuarios - Obtener todos los usuarios con paginación y filtros
router.get("/:id", getById);       // GET /usuarios/:id - Obtener usuario por ID
router.post("/", create);          // POST /usuarios - Crear nuevo usuario
router.put("/:id", update);        // PUT /usuarios/:id - Actualizar usuario

// Rutas específicas para funcionalidades adicionales
router.put("/:id/password", changePassword);  // PUT /usuarios/:id/password - Cambiar contraseña
router.delete("/:id", deleteUser);            // DELETE /usuarios/:id - Desactivar usuario (soft delete)
router.put("/:id/reactivate", reactivate);    // PUT /usuarios/:id/reactivate - Reactivar usuario

module.exports = router;