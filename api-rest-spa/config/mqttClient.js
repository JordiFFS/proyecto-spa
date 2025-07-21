const mqtt = require('mqtt');
require('dotenv').config(); // Asegúrate de cargar variables

const brokerUrl = process.env.MQTT_URL || 'mqtt://localhost:1883';

console.log(`[MQTT] 🔧 Intentando conexión a ${brokerUrl}`);

const client = mqtt.connect(brokerUrl, {
  connectTimeout: 4000,
  reconnectPeriod: 1000
});

client.on('connect', () => {
  console.log('[MQTT] ✅ Conectado a Mosquitto Broker');
});

client.on('error', (err) => {
  console.error('[MQTT] ❌ Error de conexión:', err.message);
});

client.on('reconnect', () => {
  console.log('[MQTT] 🔄 Reintentando conexión...');
});

module.exports = client;
