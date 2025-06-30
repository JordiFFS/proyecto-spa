import axios from "axios";
import { getEnvironments } from "../helpers";

const { VITE_API_URL } = getEnvironments();

export const spaApi = axios.create({
    baseURL: VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

spaApi.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    
    if (token) {
        config.headers = {
            ...config.headers,
            'Authorization': `Token ${token}`,
            'x-token': token // Agregar también x-token como backup
        }
    }

    return config;
});

// Interceptor para manejar respuestas de error
spaApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('token');
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);