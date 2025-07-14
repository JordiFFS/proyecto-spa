import { createSlice } from '@reduxjs/toolkit';

export const notificacionesSlices = createSlice({
    name: "notifiacion",
    initialState: {
        isLoading: false,
        notifiacions: [],
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
            state.notifiacions.push(payload);
            state.isLoading = false;
        },
        onUpdateNotifiacion: (state, { payload }) => {
            state.notifiacions = state.notifiacions.map(user =>
                user.id === payload.id ? payload : user
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
} = notificacionesSlices.actions