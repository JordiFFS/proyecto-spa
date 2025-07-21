import { createSlice } from '@reduxjs/toolkit';

export const notificacionesSlices = createSlice({
    name: "notifiacion",
    initialState: {
        isLoading: false,
        notifiacions: [],
        estadisticas: {
            total: 0,
            no_leidas: 0,
            enviadas: 0,
            pendientes: 0,
            leidas: 0
        },
        active: null,
        serverMessage: null,
        errorMessage: null,
        confirm: false,
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
        }
    },
    reducers: {
        onIsLoadingNotifiacion: (state) => {
            state.isLoading = true;
            state.errorMessage = null;
            state.serverMessage = null;
        },
        onLoadEstadisticas: (state, { payload }) => {
            state.estadisticas = payload.estadisticas || {
                total: 0,
                no_leidas: 0,
                enviadas: 0,
                pendientes: 0,
                leidas: 0
            };
        },
        onUpdateEstadisticasRealTime: (state, { payload }) => {
            if (payload.accion === 'crear') {
                state.estadisticas.total += 1;
                state.estadisticas.no_leidas += 1;
                state.estadisticas.pendientes += 1;
            } else if (payload.accion === 'marcar_leida') {
                state.estadisticas.no_leidas = Math.max(0, state.estadisticas.no_leidas - 1);
                state.estadisticas.leidas += 1;
            } else if (payload.accion === 'marcar_enviada') {
                state.estadisticas.pendientes = Math.max(0, state.estadisticas.pendientes - 1);
                state.estadisticas.enviadas += 1;
            } else if (payload.accion === 'eliminar') {
                state.estadisticas.total = Math.max(0, state.estadisticas.total - 1);
                if (payload.era_leida) {
                    state.estadisticas.leidas = Math.max(0, state.estadisticas.leidas - 1);
                } else {
                    state.estadisticas.no_leidas = Math.max(0, state.estadisticas.no_leidas - 1);
                }
                if (payload.era_enviada) {
                    state.estadisticas.enviadas = Math.max(0, state.estadisticas.enviadas - 1);
                } else {
                    state.estadisticas.pendientes = Math.max(0, state.estadisticas.pendientes - 1);
                }
            }
        },
        onLoadNotifiacion: (state, { payload }) => {
            state.isLoading = false;
            state.notifiacions = payload.data || [];
            state.pagination = payload.pagination || {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            };
        },
        onSetActiveNotifiacion: (state, { payload }) => {
            state.active = payload;
        },
        onAddNewNotifiacion: (state, { payload }) => {
            state.notifiacions.unshift(payload); // unshift agrega al inicio
            // Actualizar el total de la paginación
            if (state.pagination) {
                state.pagination.total = state.pagination.total + 1;
            }
            state.isLoading = false;
        },
        onUpdateNotifiacion: (state, { payload }) => {
            state.notifiacions = state.notifiacions.map(notificacion =>
                notificacion._id === payload._id ? payload : notificacion
            );
            state.active = payload;
            state.isLoading = false;
        },
        onReactivateNotifiacion: (state, { payload }) => {
            state.notifiacions = state.notifiacions.map(user =>
                user.id === payload ? { ...user, activo: true } : user
            );
            state.isLoading = false;
        },
        onSendErrorMessageNotifiacion: (state, { payload }) => {
            state.errorMessage = payload;
            state.isLoading = false;
        },
        onSendServerErrorMessageNotifiacion: (state, { payload }) => {
            state.serverMessage = payload;
            state.isLoading = false;
        },
        onClearMessageNotifiacion: (state) => {
            state.errorMessage = null;
            state.serverMessage = null;
        },
        onConfirmDeleteNotifiacion: (state) => {
            state.confirm = !state.confirm;
        },
        onUpdateNotificacionMQTT: (state, { payload }) => {
            // Si es una actualización (marcar como leída, enviada, etc.)
            if (payload.accion === 'actualizar') {
                state.notifiacions = state.notifiacions.map(notificacion =>
                    notificacion._id === payload._id ? { ...notificacion, ...payload } : notificacion
                );
            } else {
                // Si es una nueva notificación
                const exists = state.notifiacions.find(n => n._id === payload._id);
                if (!exists) {
                    state.notifiacions.unshift(payload);
                    if (state.pagination) {
                        state.pagination.total = state.pagination.total + 1;
                    }
                }
            }
            state.isLoading = false;
        },
        onCloseModalNotifiacion: (state) => {
            state.active = null;
            state.errorMessage = null;
            state.serverMessage = null;
        }
    }
})

export const {
    onIsLoadingNotifiacion,
    onLoadNotifiacion,
    onSetActiveNotifiacion,
    onAddNewNotifiacion,
    onUpdateNotifiacion,
    onReactivateNotifiacion,
    onSendErrorMessageNotifiacion,
    onSendServerErrorMessageNotifiacion,
    onClearMessageNotifiacion,
    onConfirmDeleteNotifiacion,
    onCloseModalNotifiacion,
    onUpdateNotificacionMQTT,
    onLoadEstadisticas,
    onUpdateEstadisticasRealTime,
} = notificacionesSlices.actions