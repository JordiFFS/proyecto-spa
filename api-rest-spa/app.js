require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbConnectMongo = require('./config/mongo');
const { dbConnectSequelize, sequelize } = require('./config/sequelize');

const app = express();

// CORS completamente abierto - ACEPTA TODO
app.use(cors({
    origin: true, // Acepta cualquier origen
    credentials: true, // Permite cookies y auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['*'], // Acepta cualquier header
    exposedHeaders: ['*'], // Expone cualquier header
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

// Middleware de parsing JSON
app.use(express.json({
    limit: '50mb',
    strict: true,
    type: 'application/json'
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("storage"));

// Middleware de debug
app.use((req, res, next) => {
    if (req.path.includes('/auth/')) {
        console.log('🔍 DEBUG AUTH REQUEST:');
        console.log(`📝 ${req.method} ${req.path}`);
        console.log('📦 Parsed Body:', req.body);
        console.log('🔍 Body type:', typeof req.body);
        console.log('📋 Body keys:', req.body ? Object.keys(req.body) : 'No body');
        console.log('📧 Email:', req.body?.email);
        console.log('🔑 Password:', req.body?.password ? '[PRESENTE]' : '[AUSENTE]');
        console.log('🌍 Origin:', req.headers.origin);
        console.log('---');
    }
    next();
});

const port = process.env.PORT || 3000;

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
        dbConnectMongo();
        await dbConnectSequelize();
        await sequelize.sync({ alter: true });

        app.listen(port, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
            console.log(`🌍 CORS configurado para aceptar TODOS los orígenes`);
            console.log(`🔍 Debug activado para rutas /api/auth/*`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar la aplicación:', error);
    }
};

startApp();