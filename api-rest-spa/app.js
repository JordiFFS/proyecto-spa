require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbConnectMongo = require('./config/mongo');
const { dbConnectSequelize, sequelize } = require('./config/sequelize');

const app = express();
const port = process.env.PORT || 3001;

// Orígenes permitidos - incluye tu IP específica
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://192.168.0.5:3000',
    'http://192.168.0.5:3001',
    'http://192.168.175.103:3000',
    'http://192.168.175.103:3001',
    'http://0.0.0.0:3001',
    'http://0.0.0.0:3001',
];

// CORS configurado para tu red local
app.use(cors({
    origin: function(origin, callback) {
        console.log('🌍 CORS Origin:', origin || 'No origin');
        
        // Permite requests sin origin (como Postman o apps móviles)
        if (!origin) {
            console.log('✅ CORS: Permitido (sin origin)');
            return callback(null, true);
        }
        
        // Verifica si el origin está en la lista permitida
        if (allowedOrigins.includes(origin)) {
            console.log('✅ CORS: Permitido (origin en lista)');
            return callback(null, true);
        }
        
        console.log('❌ CORS: Rechazado -', origin);
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-token'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

// Headers adicionales para compatibilidad
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
    
    if (req.method === 'OPTIONS') {
        console.log('✅ Preflight OPTIONS request handled');
        res.status(200).end();
        return;
    }
    
    next();
});

// Middleware de parsing JSON
app.use(express.json({
    limit: '50mb',
    strict: true,
    type: 'application/json'
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("storage"));

// Función para obtener IP local
const getLocalIP = () => {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                results.push(net.address);
            }
        }
    }
    return results[0] || 'localhost';
};

// Ruta de prueba
app.get('/api/test', (req, res) => {
    const localIP = getLocalIP();
    res.json({
        ok: true,
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        origin: req.headers.origin || 'No origin',
        serverIP: localIP,
        clientIP: req.ip || req.connection.remoteAddress,
        urls: {
            local: `http://localhost:${port}`,
            network: `http://${localIP}:${port}`,
            yourIP: `http://192.168.0.5:${port}`,
            localIP: `http://192.168.175.103:${port}`
        }
    });
});

// Middleware de debug para auth
app.use((req, res, next) => {
    if (req.path.includes('/auth/')) {
        console.log('🔍 DEBUG AUTH REQUEST:');
        console.log(`📝 ${req.method} ${req.path}`);
        console.log('📦 Parsed Body:', req.body);
        console.log('📧 Email:', req.body?.email);
        console.log('🔑 Password:', req.body?.password ? '[PRESENTE]' : '[AUSENTE]');
        console.log('🌍 Origin:', req.headers.origin);
        console.log('🔗 Client IP:', req.ip || req.connection.remoteAddress);
        console.log('---');
    }
    next();
});

// Rutas
app.use("/api", require("./routes"));

// Error handler
app.use((error, req, res, next) => {
    console.error('💥 Error capturado:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
        ok: false,
        msg: 'Error interno del servidor',
        error: error.message
    });
});

// Inicialización
const startApp = async () => {
    try {
        console.log('🔄 Conectando a las bases de datos...');
        dbConnectMongo();
        await dbConnectSequelize();
        await sequelize.sync({ alter: true });

        const localIP = getLocalIP();
        
        // Servidor escuchando en todas las interfaces
        app.listen(port, '0.0.0.0', () => {
            console.log('🎯 =====================================');
            console.log(`🚀 Servidor corriendo en puerto ${port}`);
            console.log(`   📱 Local: http://localhost:${port}`);
            console.log(`   🌐 Red detectada: http://${localIP}:${port}`);
            console.log(`   🎯 Tu IP específica: http://192.168.0.5:${port}`);
            console.log(`   🔌 Escuchando en 0.0.0.0:${port}`);
            console.log(`🌍 CORS configurado para orígenes específicos`);
            console.log(`🔍 Debug activado para rutas /api/auth/*`);
            console.log(`🧪 Prueba la conexión:`);
            console.log(`     http://192.168.0.5:${port}/api/test`);
            console.log('🎯 =====================================');
        });
    } catch (error) {
        console.error('❌ Error al iniciar la aplicación:', error);
        process.exit(1);
    }
};

startApp();