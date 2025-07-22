// config/gmailTransporter.js
const nodemailer = require('nodemailer');

/**
 * Configuración del transporter de Gmail para envío de emails
 */
class GmailTransporter {
    constructor() {
        this.transporter = null;
        this.isConfigured = false;
    }

    /**
     * Inicializar el transporter de Gmail
     */
    async initialize() {
        try {
            // Validar variables de entorno requeridas
            this.validateEnvironmentVariables();

            // Limpiar la contraseña de espacios automáticamente
            const cleanPassword = process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '');

            // Crear transporter con configuración de Gmail
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // true para 465, false para otros puertos
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: cleanPassword // Usar App Password limpia, no la contraseña normal
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Verificar la configuración
            await this.verifyConnection();
            
            this.isConfigured = true;
            console.log('[✅] Gmail Transporter configurado correctamente');
            console.log(`[📧] Usuario configurado: ${process.env.GMAIL_USER}`);
            
        } catch (error) {
            console.error('[❌] Error configurando Gmail Transporter:', error.message);
            throw error;
        }
    }

    /**
     * Validar que las variables de entorno estén configuradas
     */
    validateEnvironmentVariables() {
        const requiredVars = ['GMAIL_USER', 'GMAIL_APP_PASSWORD'];
        const missingVars = requiredVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(process.env.GMAIL_USER)) {
            throw new Error('GMAIL_USER debe ser un email válido');
        }

        // Validar formato de App Password (debe ser de 16 caracteres después de limpiar espacios)
        const cleanPassword = process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '');
        if (cleanPassword.length !== 16) {
            console.warn('[⚠️] GMAIL_APP_PASSWORD parece no ser una App Password válida (debe ser 16 caracteres)');
            console.warn('[ℹ️] Asegúrate de usar una App Password, no tu contraseña normal de Gmail');
            console.warn(`[🔍] Longitud actual después de limpiar espacios: ${cleanPassword.length} caracteres`);
        } else {
            console.log('[✅] App Password tiene el formato correcto (16 caracteres)');
        }

        // Validar que no sea una contraseña común
        if (cleanPassword.includes('*') || cleanPassword.length < 10) {
            console.warn('[⚠️] La contraseña parece ser una contraseña normal, no una App Password');
            console.warn('[ℹ️] Ve a https://myaccount.google.com/apppasswords para generar una App Password');
        }
    }

    /**
     * Verificar la conexión con Gmail
     */
    async verifyConnection() {
        try {
            console.log('[🔄] Verificando conexión con Gmail...');
            await this.transporter.verify();
            console.log('[📧] Conexión con Gmail verificada exitosamente');
            return true;
        } catch (error) {
            console.error('[❌] Error verificando conexión Gmail:', error.message);
            
            // Proporcionar ayuda específica según el error
            if (error.message.includes('Application-specific password required')) {
                console.error('[💡] Solución: Necesitas generar una App Password en Gmail');
                console.error('[🔗] Ve a: https://myaccount.google.com/apppasswords');
                console.error('[📝] Pasos: Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones');
            } else if (error.message.includes('Invalid login')) {
                console.error('[💡] Solución: Verifica que el email y la App Password sean correctos');
                console.error('[📧] Email configurado:', process.env.GMAIL_USER);
            } else if (error.message.includes('Less secure app')) {
                console.error('[💡] Solución: Usa una App Password en lugar de la contraseña normal');
            }
            
            throw new Error('No se pudo conectar con Gmail. Verifica tus credenciales.');
        }
    }

    /**
     * Enviar email
     * @param {Object} mailOptions - Opciones del email
     */
    async sendMail(mailOptions) {
        try {
            // Verificar que el transporter esté configurado
            if (!this.isConfigured || !this.transporter) {
                console.log('[🔄] Inicializando transporter...');
                await this.initialize();
            }

            // Validar opciones básicas del email
            this.validateMailOptions(mailOptions);

            console.log('[📤] Enviando email...', {
                to: mailOptions.to,
                subject: mailOptions.subject,
                from: mailOptions.from
            });

            // Enviar el email
            const result = await this.transporter.sendMail(mailOptions);
            
            console.log('[📤] Email enviado exitosamente:', {
                messageId: result.messageId,
                to: mailOptions.to,
                subject: mailOptions.subject,
                response: result.response
            });

            return result;
            
        } catch (error) {
            console.error('[❌] Error enviando email:', error);
            
            // Proporcionar información de diagnóstico
            if (error.message.includes('Authentication failed')) {
                console.error('[💡] Error de autenticación - verifica la App Password');
            } else if (error.message.includes('Daily user sending quota exceeded')) {
                console.error('[💡] Cuota diaria de envío excedida - intenta mañana');
            } else if (error.message.includes('Invalid recipients')) {
                console.error('[💡] Email de destinatario inválido:', mailOptions.to);
            }
            
            throw new Error(`Error enviando email: ${error.message}`);
        }
    }

    /**
     * Validar opciones del email
     * @param {Object} mailOptions 
     */
    validateMailOptions(mailOptions) {
        const requiredFields = ['to', 'subject'];
        const missingFields = requiredFields.filter(field => !mailOptions[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
        }

        // Validar que tenga contenido (html o text)
        if (!mailOptions.html && !mailOptions.text) {
            throw new Error('El email debe tener contenido (html o text)');
        }

        // Validar formato de emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emails = Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to];
        
        for (const email of emails) {
            if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
                throw new Error(`Email inválido: ${email}`);
            }
        }

        console.log('[✅] Validación de email completada');
    }

    /**
     * Test de conexión manual
     */
    async testConnection() {
        try {
            console.log('[🧪] Iniciando test de conexión...');
            console.log('[📋] Configuración actual:');
            console.log(`   - Usuario: ${process.env.GMAIL_USER}`);
            console.log(`   - App Password configurada: ${process.env.GMAIL_APP_PASSWORD ? 'SÍ' : 'NO'}`);
            console.log(`   - Longitud App Password: ${process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '').length || 0} caracteres`);
            
            await this.initialize();
            console.log('[✅] Test de conexión exitoso');
            return true;
        } catch (error) {
            console.error('[❌] Test de conexión falló:', error.message);
            return false;
        }
    }

    /**
     * Obtener información del transporter
     */
    getInfo() {
        const cleanPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '') || '';
        return {
            isConfigured: this.isConfigured,
            service: 'Gmail',
            user: process.env.GMAIL_USER,
            hasTransporter: !!this.transporter,
            passwordLength: cleanPassword.length,
            isValidPasswordLength: cleanPassword.length === 16
        };
    }

    /**
     * Cerrar el transporter
     */
    close() {
        if (this.transporter) {
            this.transporter.close();
            this.isConfigured = false;
            console.log('[🔌] Gmail Transporter cerrado');
        }
    }
}

// Crear instancia singleton
const gmailTransporter = new GmailTransporter();

// Auto-inicializar cuando se requiera el módulo (modo silencioso)
(async () => {
    try {
        console.log('[🚀] Iniciando Gmail Transporter...');
        await gmailTransporter.initialize();
    } catch (error) {
        console.warn('[⚠️] Gmail Transporter no se pudo inicializar automáticamente:', error.message);
        console.warn('[ℹ️] Se intentará inicializar cuando se use por primera vez');
        console.warn('[🔧] Para diagnosticar el problema, revisa:');
        console.warn('   1. Que tengas verificación en 2 pasos activada en Gmail');
        console.warn('   2. Que hayas generado una App Password específica');
        console.warn('   3. Que la App Password esté en el .env sin espacios');
    }
})();

module.exports = gmailTransporter;