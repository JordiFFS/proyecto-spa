const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'spa-api',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
    connectionTimeout: 3000,
    requestTimeout: 25000,
    retry: {
        initialRetryTime: 100,
        retries: 8
    }
});

const producer = kafka.producer({
    maxInFlightRequests: 1,
    idempotent: false,
    transactionTimeout: 30000,
});

const consumer = kafka.consumer({ 
    groupId: 'spa-group',
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
});

// Variables para controlar el estado de conexión
let isProducerConnected = false;
let isConsumerConnected = false;

// Función para inicializar Kafka con manejo de errores
const initKafka = async () => {
    try {
        console.log('📨 Conectando a Kafka...');
        console.log(`🔗 Broker: ${process.env.KAFKA_BROKER || 'kafka:9092'}`);
        
        await producer.connect();
        isProducerConnected = true;
        console.log('✅ Kafka producer conectado exitosamente');
        
        await consumer.connect();
        isConsumerConnected = true;
        console.log('✅ Kafka consumer conectado exitosamente');
        
        return { producer, consumer };
    } catch (error) {
        console.error('❌ Error conectando a Kafka:', error.message);
        isProducerConnected = false;
        isConsumerConnected = false;
        throw error;
    }
};

// Función para cerrar conexiones de Kafka
const closeKafka = async () => {
    try {
        if (isProducerConnected) {
            await producer.disconnect();
            isProducerConnected = false;
            console.log('🔌 Kafka producer desconectado');
        }
        
        if (isConsumerConnected) {
            await consumer.disconnect();
            isConsumerConnected = false;
            console.log('🔌 Kafka consumer desconectado');
        }
        
        console.log('✅ Kafka desconectado exitosamente');
    } catch (error) {
        console.error('❌ Error desconectando Kafka:', error.message);
    }
};

// Función para enviar mensajes de forma segura
const sendMessage = async (topic, message) => {
    if (!isProducerConnected) {
        console.warn('⚠️ Producer no está conectado. Intentando reconectar...');
        try {
            await producer.connect();
            isProducerConnected = true;
        } catch (error) {
            console.error('❌ Error reconectando producer:', error.message);
            throw error;
        }
    }
    
    try {
        await producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }]
        });
        console.log(`📤 Mensaje enviado a topic ${topic}`);
    } catch (error) {
        console.error(`❌ Error enviando mensaje a ${topic}:`, error.message);
        throw error;
    }
};

// Función para verificar el estado de conexión
const getConnectionStatus = () => {
    return {
        producer: isProducerConnected,
        consumer: isConsumerConnected,
        broker: process.env.KAFKA_BROKER || 'kafka:9092'
    };
};

module.exports = { 
    kafka, 
    producer, 
    consumer, 
    initKafka, 
    closeKafka, 
    sendMessage,
    getConnectionStatus
};