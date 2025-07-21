const { notificacionModel } = require("../models").mongodb;
const mqttClient = require('../config/mqttClient');
const EmailNotificationService = require("./services/emailNotificationService");

/**
 * Obtener lista de notificaciones de la base de datos
 * @param {*} req
 * @param {*} res
 */
const getItems = async (req, res) => {
    try {
        const { usuario_id, tipo, leida, canal, limite = 20 } = req.query;

        // Construir filtros dinámicos
        const filtros = {};
        if (usuario_id) filtros.usuario_id = parseInt(usuario_id);
        if (tipo) filtros.tipo = tipo;
        if (leida !== undefined) filtros.leida = leida === 'true';
        if (canal) filtros.canal = canal;

        // Obtener notificaciones
        const data = await notificacionModel.find(filtros)
            .sort({ createdAt: -1 })
            .limit(parseInt(limite));

        // Obtener estadísticas
        const total = await notificacionModel.countDocuments(filtros);
        const leidas = await notificacionModel.countDocuments({ ...filtros, leida: true });
        const no_leidas = await notificacionModel.countDocuments({ ...filtros, leida: false });

        const estadisticas = {
            total,
            leidas,
            no_leidas
        };

        res.send({ data, total, estadisticas });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

const getStats = async (req, res) => {
    try {
        const { usuario_id } = req.query;

        const filtros = {};
        if (usuario_id) filtros.usuario_id = parseInt(usuario_id);

        const total = await notificacionModel.countDocuments(filtros);
        const leidas = await notificacionModel.countDocuments({ ...filtros, leida: true });
        const no_leidas = await notificacionModel.countDocuments({ ...filtros, leida: false });
        const enviadas = await notificacionModel.countDocuments({ ...filtros, enviada: true });
        const pendientes = await notificacionModel.countDocuments({ ...filtros, enviada: false });

        res.send({
            estadisticas: {
                total,
                leidas,
                no_leidas,
                enviadas,
                pendientes
            }
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Obtener una notificación por ID
 * @param {*} req
 * @param {*} res
 */
const getItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await notificacionModel.findById(id);

        if (!data) {
            return res.status(404).send({ error: 'Notificación no encontrada' });
        }

        res.send({ data });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Crear una nueva notificación (método original)
 * @param {*} req
 * @param {*} res
 */
const createItem = async (req, res) => {
    try {
        const { body } = req;
        const data = await notificacionModel.create(body);

        console.log('[📨] Notificación creada en MongoDB:', body);

        // Publicar notificación completa
        const mensaje = {
            _id: data._id,
            titulo: data.titulo,
            mensaje: data.mensaje,
            tipo: data.tipo,
            canal: data.canal,
            usuario_id: data.usuario_id,
            leida: data.leida || false,
            enviada: data.enviada || false,
            activa: data.activa,
            fecha_programada: data.fecha_programada,
            fecha_creacion: data.createdAt || new Date(),
            fecha_lectura: data.fecha_lectura,
            fecha_envio: data.fecha_envio,
            accion: 'crear'
        };

        mqttClient.publish('spa/notificaciones', JSON.stringify(mensaje), { qos: 1 });

        res.status(201).send({ data });
    } catch (error) {
        console.error('[❌] Error en createItem:', error.message);
        res.status(400).send({ error: error.message });
    }
};

/**
 * Crear una nueva notificación con envío por email
 * @param {*} req
 * @param {*} res
 */
const createItemWithEmail = async (req, res) => {
    try {
        const { body } = req;
        const { enviar_email, email_destinatario, ...notificacionData } = body;
        
        // Validar email si se requiere envío
        if (enviar_email && !email_destinatario) {
            return res.status(400).send({ 
                error: 'Email destinatario requerido cuando enviar_email es true' 
            });
        }

        if (enviar_email && !EmailNotificationService.validarEmail(email_destinatario)) {
            return res.status(400).send({ 
                error: 'Formato de email inválido' 
            });
        }
        
        // Crear notificación en BD
        const data = await notificacionModel.create(notificacionData);

        console.log('[📨] Notificación creada en MongoDB:', notificacionData);

        // Publicar por MQTT
        const mensaje = {
            _id: data._id,
            titulo: data.titulo,
            mensaje: data.mensaje,
            tipo: data.tipo,
            canal: data.canal,
            usuario_id: data.usuario_id,
            leida: data.leida || false,
            enviada: data.enviada || false,
            activa: data.activa,
            fecha_programada: data.fecha_programada,
            fecha_creacion: data.createdAt || new Date(),
            fecha_lectura: data.fecha_lectura,
            fecha_envio: data.fecha_envio,
            accion: 'crear'
        };

        mqttClient.publish('spa/notificaciones', JSON.stringify(mensaje), { qos: 1 });

        let emailResult = null;

        // Enviar por email si está habilitado
        if (enviar_email && email_destinatario) {
            try {
                emailResult = await EmailNotificationService.enviarNotificacion(data, email_destinatario);
                console.log('[📧] Email enviado correctamente:', emailResult.messageId);
            } catch (emailError) {
                console.error('[❌] Error enviando email:', emailError.message);
                // No fallar la creación por error de email
                emailResult = { success: false, error: emailError.message };
            }
        }

        res.status(201).send({ 
            data,
            email_result: emailResult
        });
    } catch (error) {
        console.error('[❌] Error en createItemWithEmail:', error.message);
        res.status(400).send({ error: error.message });
    }
};

/**
 * Endpoint para envío masivo de notificaciones
 * @param {*} req
 * @param {*} res
 */
const enviarNotificacionMasiva = async (req, res) => {
    try {
        const { notificacion, destinatarios } = req.body;
        
        // Validar entrada
        if (!notificacion || !destinatarios || !Array.isArray(destinatarios)) {
            return res.status(400).send({ 
                error: 'Se requieren campos: notificacion y destinatarios (array)' 
            });
        }

        if (destinatarios.length === 0) {
            return res.status(400).send({ 
                error: 'Lista de destinatarios no puede estar vacía' 
            });
        }

        // Validar emails
        const emailsInvalidos = destinatarios.filter(email => 
            !EmailNotificationService.validarEmail(email)
        );

        if (emailsInvalidos.length > 0) {
            return res.status(400).send({ 
                error: 'Emails inválidos encontrados',
                emails_invalidos: emailsInvalidos
            });
        }
        
        // Crear notificación en BD
        const data = await notificacionModel.create(notificacion);
        
        // Enviar emails
        console.log(`[📧] Iniciando envío masivo a ${destinatarios.length} destinatarios`);
        const resultados = await EmailNotificationService.enviarNotificacionMasiva(data, destinatarios);
        
        // Contar éxitos y fallos
        const exitosos = resultados.filter(r => r.success).length;
        const fallidos = resultados.filter(r => !r.success).length;

        console.log(`[📧] Envío masivo completado: ${exitosos} exitosos, ${fallidos} fallidos`);
        
        res.status(201).send({ 
            notificacion: data,
            resumen: {
                total: destinatarios.length,
                exitosos,
                fallidos
            },
            resultados_detallados: resultados
        });
        
    } catch (error) {
        console.error('[❌] Error en envío masivo:', error.message);
        res.status(500).send({ error: error.message });
    }
};

/**
 * Programar notificación para envío futuro
 * @param {*} req
 * @param {*} res
 */
const programarNotificacion = async (req, res) => {
    try {
        const { notificacion, email_destinatario, fecha_envio } = req.body;

        // Validaciones
        if (!notificacion || !email_destinatario || !fecha_envio) {
            return res.status(400).send({ 
                error: 'Se requieren: notificacion, email_destinatario, fecha_envio' 
            });
        }

        if (!EmailNotificationService.validarEmail(email_destinatario)) {
            return res.status(400).send({ 
                error: 'Formato de email inválido' 
            });
        }

        const fechaEnvio = new Date(fecha_envio);
        if (fechaEnvio <= new Date()) {
            return res.status(400).send({ 
                error: 'La fecha de envío debe ser futura' 
            });
        }

        const notificacionProgramada = await EmailNotificationService.programarNotificacion(
            notificacion, 
            email_destinatario, 
            fechaEnvio
        );

        res.status(201).send({ 
            message: 'Notificación programada exitosamente',
            data: notificacionProgramada
        });

    } catch (error) {
        console.error('[❌] Error programando notificación:', error.message);
        res.status(500).send({ error: error.message });
    }
};

/**
 * Endpoint para procesar notificaciones programadas
 * @param {*} req
 * @param {*} res
 */
const procesarNotificacionesProgramadas = async (req, res) => {
    try {
        await EmailNotificationService.procesarNotificacionesPendientes();
        res.send({ message: 'Notificaciones programadas procesadas' });
    } catch (error) {
        console.error('[❌] Error procesando programadas:', error.message);
        res.status(500).send({ error: error.message });
    }
};

/**
 * Actualizar una notificación
 * @param {*} req
 * @param {*} res
 */
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { body } = req;

        const data = await notificacionModel.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );

        if (!data) {
            return res.status(404).send({ error: 'Notificación no encontrada' });
        }

        res.send({ data });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

/**
 * Eliminar una notificación
 * @param {*} req
 * @param {*} res
 */
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await notificacionModel.findByIdAndDelete(id);

        if (!data) {
            return res.status(404).send({ error: 'Notificación no encontrada' });
        }

        // Enviar por MQTT para actualizar estadísticas
        const mensaje = {
            _id: data._id,
            accion: 'eliminar',
            era_leida: data.leida,
            era_enviada: data.enviada
        };

        mqttClient.publish('spa/notificaciones', JSON.stringify(mensaje));

        res.send({ message: 'Notificación eliminada correctamente', data });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Marcar notificación como leída
 * @param {*} req
 * @param {*} res
 */
const marcarComoLeida = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await notificacionModel.findByIdAndUpdate(
            id,
            {
                leida: true,
                fecha_lectura: new Date()
            },
            { new: true }
        );

        if (!data) {
            return res.status(404).send({ error: 'Notificación no encontrada' });
        }

        // Enviar por MQTT con acción específica
        const mensaje = {
            _id: data._id,
            titulo: data.titulo,
            mensaje: data.mensaje,
            tipo: data.tipo,
            canal: data.canal,
            usuario_id: data.usuario_id,
            leida: data.leida,
            enviada: data.enviada,
            activa: data.activa,
            fecha_programada: data.fecha_programada,
            fecha_creacion: data.createdAt,
            fecha_lectura: data.fecha_lectura,
            fecha_envio: data.fecha_envio,
            accion: 'marcar_leida'
        };

        mqttClient.publish('spa/notificaciones', JSON.stringify(mensaje));

        res.send({ data });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Marcar todas las notificaciones de un usuario como leídas
 * @param {*} req
 * @param {*} res
 */
const marcarTodasComoLeidas = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const resultado = await notificacionModel.updateMany(
            { usuario_id: parseInt(usuario_id), leida: false },
            {
                leida: true,
                fecha_lectura: new Date()
            }
        );

        res.send({
            message: 'Notificaciones marcadas como leídas',
            notificacionesActualizadas: resultado.modifiedCount
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Obtener notificaciones no leídas de un usuario
 * @param {*} req
 * @param {*} res
 */
const getNoLeidas = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const data = await notificacionModel.find({
            usuario_id: parseInt(usuario_id),
            leida: false
        }).sort({ createdAt: -1 });

        res.send({ data, total: data.length });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

/**
 * Marcar notificación como enviada
 * @param {*} req
 * @param {*} res
 */
const marcarComoEnviada = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await notificacionModel.findByIdAndUpdate(
            id,
            {
                enviada: true,
                fecha_envio: new Date()
            },
            { new: true }
        );

        if (!data) {
            return res.status(404).send({ error: 'Notificación no encontrada' });
        }

        // Enviar por MQTT
        const mensaje = {
            _id: data._id,
            titulo: data.titulo,
            mensaje: data.mensaje,
            tipo: data.tipo,
            canal: data.canal,
            usuario_id: data.usuario_id,
            leida: data.leida,
            enviada: data.enviada,
            activa: data.activa,
            fecha_programada: data.fecha_programada,
            fecha_creacion: data.createdAt,
            fecha_lectura: data.fecha_lectura,
            fecha_envio: data.fecha_envio,
            accion: 'marcar_enviada'
        };

        mqttClient.publish('spa/notificaciones', JSON.stringify(mensaje));

        res.send({ data });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

module.exports = {
    getItems,
    getItem,
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
};