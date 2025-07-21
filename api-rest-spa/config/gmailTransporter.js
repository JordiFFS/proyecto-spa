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

            // Crear transporter con configuración de Gmail
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // true para 465, false para otros puertos
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD // Usar App Password, no la contraseña normal
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Verificar la configuración
            await this.verifyConnection();
            
            this.isConfigured = true;
            console.log('[✅] Gmail Transporter configurado correctamente');
            
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

        // Validar formato de App Password (debe ser de 16 caracteres)
        if (process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '').length !== 16) {
            console.warn('[⚠️] GMAIL_APP_PASSWORD parece no ser una App Password válida (debe ser 16 caracteres)');
            console.warn('[ℹ️] Asegúrate de usar una App Password, no tu contraseña normal de Gmail');
        }
    }

    /**
     * Verificar la conexión con Gmail
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('[📧] Conexión con Gmail verificada');
            return true;
        } catch (error) {
            console.error('[❌] Error verificando conexión Gmail:', error.message);
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
                await this.initialize();
            }

            // Validar opciones básicas del email
            this.validateMailOptions(mailOptions);

            // Enviar el email
            const result = await this.transporter.sendMail(mailOptions);
            
            console.log('[📤] Email enviado exitosamente:', {
                messageId: result.messageId,
                to: mailOptions.to,
                subject: mailOptions.subject
            });

            return result;
            
        } catch (error) {
            console.error('[❌] Error enviando email:', error);
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
            if (!emailRegex.test(email)) {
                throw new Error(`Email inválido: ${email}`);
            }
        }
    }

    /**
     * Obtener información del transporter
     */
    getInfo() {
        return {
            isConfigured: this.isConfigured,
            service: 'Gmail',
            user: process.env.GMAIL_USER,
            hasTransporter: !!this.transporter
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

// Auto-inicializar cuando se requiera el módulo
(async () => {
    try {
        await gmailTransporter.initialize();
    } catch (error) {
        console.warn('[⚠️] Gmail Transporter no se pudo inicializar automáticamente:', error.message);
        console.warn('[ℹ️] Se intentará inicializar cuando se use por primera vez');
    }
})();

module.exports = gmailTransporter;