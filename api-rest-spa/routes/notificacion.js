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
    // Nuevas funciones para email
    createItemWithEmail,
    enviarNotificacionMasiva,
    programarNotificacion,
    procesarNotificacionesProgramadas
} = require("../controllers/notificacion");

const router = express.Router();

// ===============================================
// RUTAS DE ESTADÍSTICAS (deben ir primero)
// ===============================================

/**
 * @route   GET /api/notificaciones/stats
 * @desc    Obtener estadísticas de notificaciones
 * @access  Privado
 */
router.get("/stats", getStats);

// ===============================================
// RUTAS ESPECÍFICAS (deben ir antes de /:id)
// ===============================================

/**
 * @route   GET /api/notificaciones/usuario/:usuario_id/no-leidas
 * @desc    Obtener notificaciones no leídas de un usuario específico
 * @access  Privado
 */
router.get("/usuario/:usuario_id/no-leidas", getNoLeidas);

/**
 * @route   PATCH /api/notificaciones/usuario/:usuario_id/marcar-todas-leidas
 * @desc    Marcar todas las notificaciones de un usuario como leídas
 * @access  Privado
 */
router.patch("/usuario/:usuario_id/marcar-todas-leidas", marcarTodasComoLeidas);

// ===============================================
// RUTAS DE EMAIL - FUNCIONALIDADES AVANZADAS
// ===============================================

/**
 * @route   POST /api/notificaciones/with-email
 * @desc    Crear una nueva notificación con envío por email opcional
 * @access  Privado
 * @body    { notificacion data, enviar_email: boolean, email_destinatario: string }
 */
router.post("/with-email", createItemWithEmail);

/**
 * @route   POST /api/notificaciones/envio-masivo
 * @desc    Envío masivo de notificaciones por email
 * @access  Privado
 * @body    { notificacion: object, destinatarios: array }
 */
router.post("/envio-masivo", enviarNotificacionMasiva);

/**
 * @route   POST /api/notificaciones/programar
 * @desc    Programar notificación para envío futuro
 * @access  Privado
 * @body    { notificacion: object, email_destinatario: string, fecha_envio: date }
 */
router.post("/programar", programarNotificacion);

/**
 * @route   POST /api/notificaciones/procesar-programadas
 * @desc    Procesar notificaciones programadas pendientes (para cron job)
 * @access  Privado
 */
router.post("/procesar-programadas", procesarNotificacionesProgramadas);

// ===============================================
// RUTAS CRUD BÁSICAS
// ===============================================

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
 * @desc    Crear una nueva notificación (método básico)
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

// ===============================================
// RUTAS DE ACCIONES ESPECÍFICAS
// ===============================================

/**
 * @route   PATCH /api/notificaciones/:id/leida
 * @desc    Marcar una notificación como leída
 * @access  Privado
 */
router.patch("/:id/leida", marcarComoLeida);

/**
 * @route   PATCH /api/notificaciones/:id/enviada
 * @desc    Marcar una notificación como enviada
 * @access  Privado
 */
router.patch("/:id/enviada", marcarComoEnviada);

module.exports = router;