const { networkInterfaces } = require('os');

// Abstract Factory para configuración de red
class NetworkConfigFactory {
    static create(environment = 'development') {
        switch (environment.toLowerCase()) {
            case 'development':
            case 'dev':
                return new DevelopmentNetworkConfig();
            case 'production':
            case 'prod':
                return new ProductionNetworkConfig();
            case 'local':
                return new LocalNetworkConfig();
            case 'testing':
            case 'test':
                return new TestingNetworkConfig();
            default:
                return new DevelopmentNetworkConfig();
        }
    }
}

// Clase base abstracta
class NetworkConfig {
    constructor() {
        if (this.constructor === NetworkConfig) {
            throw new Error('No se puede instanciar una clase abstracta');
        }
    }

    getHost() {
        throw new Error('Método getHost debe ser implementado');
    }

    getPort() {
        throw new Error('Método getPort debe ser implementado');
    }

    getCorsConfig() {
        throw new Error('Método getCorsConfig debe ser implementado');
    }

    getLocalIP() {
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
    }

    getNetworkInfo() {
        const port = this.getPort();
        const host = this.getHost();
        const localIP = this.getLocalIP();
        
        return {
            port,
            host,
            localIP,
            urls: {
                local: `http://localhost:${port}`,
                network: `http://${localIP}:${port}`,
                external: host === '0.0.0.0' ? `http://${localIP}:${port}` : `http://${host}:${port}`
            }
        };
    }

    getServerConfig() {
        return {
            host: this.getHost(),
            port: this.getPort(),
            cors: this.getCorsConfig()
        };
    }
}

// Configuración para desarrollo - Acepta todas las conexiones
class DevelopmentNetworkConfig extends NetworkConfig {
    getHost() {
        return process.env.HOST || '0.0.0.0'; // Acepta conexiones desde cualquier IP
    }

    getPort() {
        return parseInt(process.env.PORT) || 3001;
    }

    getCorsConfig() {
        return {
            origin: function(origin, callback) {
                // Permite requests sin origin (como Postman) y cualquier origin
                if (!origin) return callback(null, true);
                return callback(null, true);
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
            exposedHeaders: ['Content-Length', 'X-Requested-With'],
            preflightContinue: false,
            optionsSuccessStatus: 200
        };
    }
}

// Configuración para producción - Más restrictiva
class ProductionNetworkConfig extends NetworkConfig {
    getHost() {
        return process.env.HOST || '0.0.0.0';
    }

    getPort() {
        return parseInt(process.env.PORT) || 3001;
    }

    getCorsConfig() {
        const allowedOrigins = process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
            : ['http://localhost:3001', 'http://localhost:3000'];

        return {
            origin: allowedOrigins,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            optionsSuccessStatus: 200
        };
    }
}

// Configuración para red local únicamente
class LocalNetworkConfig extends NetworkConfig {
    getHost() {
        return this.getLocalIP(); // Solo IP local específica
    }

    getPort() {
        return parseInt(process.env.PORT) || 3000;
    }

    getCorsConfig() {
        const localIP = this.getLocalIP();
        const allowedOrigins = [
            'http://localhost:3001',
            'http://localhost:3000',
            `http://${localIP}:3001`,
            `http://${localIP}:3000`,
            `http://${localIP}:8080`,
            `http://${localIP}:8081`
        ];

        return {
            origin: allowedOrigins,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            optionsSuccessStatus: 200
        };
    }
}

// Configuración para testing
class TestingNetworkConfig extends NetworkConfig {
    getHost() {
        return 'localhost'; // Solo local para testing
    }

    getPort() {
        return parseInt(process.env.TEST_PORT) || 3002;
    }

    getCorsConfig() {
        return {
            origin: ['http://localhost:3001', 'http://localhost:3000'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            optionsSuccessStatus: 200
        };
    }
}

module.exports = NetworkConfigFactory;