require('dotenv').config();
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'spa-dev-client',
  brokers: [process.env.KAFKA_BROKER],
});

const run = async () => {
  const producer = kafka.producer();
  await producer.connect();
  await producer.send({
    topic: 'notificaciones',
    messages: [{ value: 'Mensaje de prueba Kafka' }],
  });
  await producer.disconnect();
  console.log('✅ Mensaje enviado a Kafka');
};

run().catch(console.error);
