const gmailTransporter = require('../../config/gmailTransporter');
const { notificacionModel } = require('../../models/nosql');

// services/emailNotificationService.js

/**
 * Servicio para envío de notificaciones por email
 */
class EmailNotificationService {
    
    /**
     * Enviar notificación por email
     * @param {Object} notificacion - Datos de la notificación
     * @param {string} destinatario - Email del destinatario
     * @param {Object} opciones - Opciones adicionales
     */ 
    static async enviarNotificacion(notificacion, destinatario, opciones = {}) {
        try {
            const tipoTemplate = this.obtenerTemplate(notificacion.tipo);
            
            const mailOptions = {
                from: `"Sistema de Notificaciones" <${process.env.GMAIL_USER}>`,
                to: destinatario,
                subject: this.generarAsunto(notificacion),
                html: this.generarHTML(notificacion, tipoTemplate),
                text: this.generarTextoPlano(notificacion),
                ...opciones
            };

            const resultado = await gmailTransporter.sendMail(mailOptions);
            
            console.log('[📧] Email enviado:', resultado.messageId);
            
            // Marcar como enviada en la base de datos
            if (notificacion._id) {
                await this.marcarComoEnviada(notificacion._id);
            }
            
            return {
                success: true,
                messageId: resultado.messageId,
                destinatario
            };
            
        } catch (error) {
            console.error('[❌] Error enviando email:', error);
            throw new Error(`Error enviando notificación: ${error.message}`);
        }
    }

    /**
     * Enviar notificación a múltiples destinatarios
     * @param {Object} notificacion 
     * @param {Array} destinatarios 
     */
    static async enviarNotificacionMasiva(notificacion, destinatarios) {
        const resultados = [];
        
        for (const destinatario of destinatarios) {
            try {
                const resultado = await this.enviarNotificacion(notificacion, destinatario);
                resultados.push(resultado);
            } catch (error) {
                resultados.push({
                    success: false,
                    destinatario,
                    error: error.message
                });
            }
        }
        
        return resultados;
    }

    /**
     * Generar asunto del email según el tipo
     * @param {Object} notificacion 
     */
    static generarAsunto(notificacion) {
        const prefijos = {
            'info': '📋 Información',
            'alerta': '⚠️ Alerta',
            'error': '❌ Error',
            'exito': '✅ Éxito',
            'recordatorio': '🔔 Recordatorio',
            'sistema': '🔧 Sistema',
            'seguridad': '🔒 Seguridad'
        };
        
        const prefijo = prefijos[notificacion.tipo] || '📬 Notificación';
        return `${prefijo}: ${notificacion.titulo}`;
    }

    /**
     * Obtener template según el tipo de notificación
     * @param {string} tipo 
     */
    static obtenerTemplate(tipo) {
        const templates = {
            'info': {
                color: '#2196F3',
                icon: '📋',
                backgroundColor: '#E3F2FD'
            },
            'alerta': {
                color: '#FF9800',
                icon: '⚠️',
                backgroundColor: '#FFF3E0'
            },
            'error': {
                color: '#F44336',
                icon: '❌',
                backgroundColor: '#FFEBEE'
            },
            'exito': {
                color: '#4CAF50',
                icon: '✅',
                backgroundColor: '#E8F5E8'
            },
            'recordatorio': {
                color: '#9C27B0',
                icon: '🔔',
                backgroundColor: '#F3E5F5'
            },
            'sistema': {
                color: '#607D8B',
                icon: '🔧',
                backgroundColor: '#ECEFF1'
            },
            'seguridad': {
                color: '#795548',
                icon: '🔒',
                backgroundColor: '#EFEBE9'
            }
        };
        
        return templates[tipo] || templates['info'];
    }

    /**
     * Generar HTML del email
     * @param {Object} notificacion 
     * @param {Object} template 
     */
    static generarHTML(notificacion, template) {
        const fecha = new Date(notificacion.fecha_creacion || notificacion.createdAt).toLocaleString('es-ES');
        
        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${notificacion.titulo}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container {
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, ${template.color}, ${template.color}dd);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }
                .icon {
                    font-size: 48px;
                    margin-bottom: 10px;
                }
                .title {
                    font-size: 24px;
                    margin: 0;
                    font-weight: bold;
                }
                .content {
                    padding: 30px 20px;
                }
                .message {
                    font-size: 16px;
                    margin-bottom: 20px;
                    line-height: 1.8;
                }
                .info-box {
                    background: ${template.backgroundColor};
                    border-left: 4px solid ${template.color};
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 0 8px 8px 0;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                    border-top: 1px solid #eee;
                }
                .date {
                    color: #666;
                    font-size: 14px;
                    margin-top: 20px;
                }
                @media (max-width: 600px) {
                    body { padding: 10px; }
                    .header { padding: 20px 15px; }
                    .content { padding: 20px 15px; }
                    .title { font-size: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="icon">${template.icon}</div>
                    <h1 class="title">${notificacion.titulo}</h1>
                </div>
                
                <div class="content">
                    <div class="message">
                        ${notificacion.mensaje.replace(/\n/g, '<br>')}
                    </div>
                    
                    ${notificacion.canal ? `
                    <div class="info-box">
                        <strong>Canal:</strong> ${notificacion.canal}
                    </div>
                    ` : ''}
                    
                    <div class="date">
                        <strong>Fecha:</strong> ${fecha}
                    </div>
                </div>
                
                <div class="footer">
                    <p>Este es un mensaje automático del sistema de notificaciones.</p>
                    <p>Si tienes alguna consulta, contacta con el administrador del sistema.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Generar versión de texto plano
     * @param {Object} notificacion 
     */
    static generarTextoPlano(notificacion) {
        const fecha = new Date(notificacion.fecha_creacion || notificacion.createdAt).toLocaleString('es-ES');
        
        return `
${notificacion.titulo}

${notificacion.mensaje}

${notificacion.canal ? `Canal: ${notificacion.canal}` : ''}
Fecha: ${fecha}

---
Este es un mensaje automático del sistema de notificaciones.
        `.trim();
    }

    /**
     * Marcar notificación como enviada
     * @param {string} notificacionId 
     */
    static async marcarComoEnviada(notificacionId) {
        try {
            await notificacionModel.findByIdAndUpdate(
                notificacionId,
                {
                    enviada: true,
                    fecha_envio: new Date()
                }
            );
        } catch (error) {
            console.error('[❌] Error marcando como enviada:', error);
        }
    }

    /**
     * Procesar notificaciones pendientes de envío
     */
    static async procesarNotificacionesPendientes() {
        try {
            const pendientes = await notificacionModel.find({
                enviada: false,
                activa: true,
                $or: [
                    { fecha_programada: { $lte: new Date() } },
                    { fecha_programada: null }
                ]
            });

            console.log(`[📬] Procesando ${pendientes.length} notificaciones pendientes`);

            for (const notificacion of pendientes) {
                // Aquí necesitarías obtener el email del usuario según usuario_id
                // const usuario = await usuarioModel.findById(notificacion.usuario_id);
                // if (usuario && usuario.email) {
                //     await this.enviarNotificacion(notificacion, usuario.email);
                // }
            }

        } catch (error) {
            console.error('[❌] Error procesando pendientes:', error);
        }
    }

    /**
     * Validar email
     * @param {string} email 
     */
    static validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Programar notificación para envío futuro
     * @param {Object} notificacion 
     * @param {string} email 
     * @param {Date} fechaEnvio 
     */
    static async programarNotificacion(notificacion, email, fechaEnvio) {
        try {
            // Crear notificación con fecha programada
            const notificacionProgramada = await notificacionModel.create({
                ...notificacion,
                fecha_programada: fechaEnvio,
                email_destinatario: email,
                enviada: false,
                activa: true
            });

            console.log('[⏰] Notificación programada para:', fechaEnvio);
            return notificacionProgramada;
            
        } catch (error) {
            console.error('[❌] Error programando notificación:', error);
            throw error;
        }
    }
}

module.exports = EmailNotificationService;