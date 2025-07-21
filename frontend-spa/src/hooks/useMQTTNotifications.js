import { useEffect } from 'react';
import mqtt from 'mqtt';
import { useDispatch } from 'react-redux';
import { onUpdateEstadisticasRealTime, onUpdateNotificacionMQTT } from '../store/modules/notificacion/slices';

export const useMQTTNotifications = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Usamos WebSocket (puerto 9001 configurado en Mosquitto)
        const client = mqtt.connect('ws://localhost:9001');

        client.on('connect', () => {
            console.log('[MQTT] 🎯 Conectado desde el frontend');
            client.subscribe('spa/notificaciones', (err) => {
                if (err) {
                    console.error('[MQTT] ❌ Error al suscribirse:', err.message);
                } else {
                    console.log('[MQTT] ✅ Suscrito a spa/notificaciones');
                }
            });
        });

        client.on('message', (topic, message) => {
            try {
                const data = JSON.parse(message.toString());
                console.log('[MQTT] 📩 Notificación recibida:', data);

                // Actualizar la lista de notificaciones
                dispatch(onUpdateNotificacionMQTT(data));

                // Actualizar estadísticas en tiempo real
                dispatch(onUpdateEstadisticasRealTime(data));

            } catch (error) {
                console.error('[MQTT] ⚠️ Error al parsear mensaje:', error.message);
            }
        });

        return () => {
            client.end();
        };
    }, []);
};
