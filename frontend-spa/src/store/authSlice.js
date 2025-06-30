import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        status: 'not-authenticated', // Cambiar estado inicial
        user: {},
        token: null,
        errorMessage: {
            show: false,
            variant: '',
            message: ''
        },
    },
    reducers: {
        // Acción para loguearse
        login: (state, { payload }) => {
            state.status = 'authenticated';
            state.user = payload.user;
            state.token = payload.token;
            state.errorMessage = { show: false, variant: '', message: '' }; // Limpiar errores al hacer login exitoso
        },
        // Acción para logout
        logout: (state) => {
            state.status = 'not-authenticated';
            state.user = {};
            state.token = null;
            state.errorMessage = { show: false, variant: '', message: '' }; // Limpiar errores al hacer logout
        },
        // Limpiar mensajes de error
        clearErrorMessage: (state) => {
            state.errorMessage = { show: false, variant: '', message: '' };
        },
        // Estado de checking (verificando credenciales)
        checkingCredentials: (state) => {
            state.status = 'checking';
            state.errorMessage = { show: false, variant: '', message: '' }; // Limpiar errores al empezar checking
        },
        sendServerMessage: (state, { payload }) => {
            state.status = 'not-authenticated'; // Importante: cambiar estado cuando hay error
            state.errorMessage = { 
                show: true, 
                variant: 'error', // Cambiar a 'error' para Material-UI Alert
                message: payload 
            };
        },
    }
});

export const { login, logout, checkingCredentials, clearErrorMessage, sendServerMessage } = authSlice.actions;