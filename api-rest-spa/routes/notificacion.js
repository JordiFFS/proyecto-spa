const express = require("express");
const {
    getItem,
    getItems,
    createItem,
    updateItem,
    deleteItem,
    marcarComoLeida,
    marcarTodasComoLeidas,
    getNoLeidas,
    marcarComoEnviada,
    getStats,
} = require("../controllers/notificacion");

const router = express.Router();


/**
 * @route   GET /api/notificaciones/stats
 * @desc    Obtener estadísticas de notificaciones
 * @access  Privado
 */
router.get("/stats", getStats);  // 🔥 ¡Esta debe ir antes que "/:id"!
// Rutas CRUD básicas
/**
 * @route   GET /api/notificaciones
 * @desc    Obtener lista de notificaciones con filtros opcionales
 * @access  Privado
 * @query   usuario_id, tipo, leida, canal, limite
 */
router.get("/", getItems);

/**
 * @route   GET /api/notificaciones/:id
 * @desc    Obtener una notificación específica por ID
 * @access  Privado
 */
router.get("/:id", getItem);

/**
 * @route   POST /api/notificaciones
 * @desc    Crear una nueva notificación
 * @access  Privado
 */
router.post("/", createItem);

/**
 * @route   PUT /api/notificaciones/:id
 * @desc    Actualizar una notificación existente
 * @access  Privado
 */
router.put("/:id", updateItem);

/**
 * @route   DELETE /api/notificaciones/:id
 * @desc    Eliminar una notificación
 * @access  Privado
 */
router.delete("/:id", deleteItem);

// Rutas específicas para funcionalidades de notificaciones
/**
 * @route   GET /api/notificaciones/usuario/:usuario_id/no-leidas
 * @desc    Obtener notificaciones no leídas de un usuario específico
 * @access  Privado
 */
router.get("/usuario/:usuario_id/no-leidas", getNoLeidas);

/**
 * @route   PATCH /api/notificaciones/:id/leida
 * @desc    Marcar una notificación como leída
 * @access  Privado
 */
router.patch("/:id/leida", marcarComoLeida);

/**
 * @route   PATCH /api/notificaciones/usuario/:usuario_id/marcar-todas-leidas
 * @desc    Marcar todas las notificaciones de un usuario como leídas
 * @access  Privado
 */
router.patch("/usuario/:usuario_id/marcar-todas-leidas", marcarTodasComoLeidas);

/**
 * @route   PATCH /api/notificaciones/:id/enviada
 * @desc    Marcar una notificación como enviada
 * @access  Privado
 */
router.patch("/:id/enviada", marcarComoEnviada);

module.exports = router;