import { createSlice } from '@reduxjs/toolkit';

export const resservaSlices  = createSlice({
    name: "reserva",
    initialState: {
        isLoading: false,
        reservas: [],
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
        onIsLoadingReserva: (state) => {
            state.isLoading = true;
            state.errorMessage = null;
            state.serverMessage = null;
        },
        onLoadReservas: (state, { payload }) => {
            state.isLoading = false;
            state.reservas = payload.data || [];
            state.pagination = payload.pagination || {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            };
        },
        onSetActiveReserva: (state, { payload }) => {
            state.active = payload;
        },
        onAddNewReserva: (state, { payload }) => {
            state.reservas.push(payload);
            state.isLoading = false;
        },
        onUpdateReserva: (state, { payload }) => {
            state.reservas = state.reservas.map(user =>
                user.id === payload.id ? payload : user
            );
            state.active = payload;
            state.isLoading = false;
        },
        onReactivateReserva: (state, { payload }) => {
            state.reservas = state.reservas.map(user =>
                user.id === payload ? { ...user, activo: true } : user
            );
            state.isLoading = false;
        },
        onSendErrorMessageReserva: (state, { payload }) => {
            state.errorMessage = payload;
            state.isLoading = false;
        },
        onSendServerErrorMessageReserva: (state, { payload }) => {
            state.serverMessage = payload;
            state.isLoading = false;
        },
        onClearMessageReserva: (state) => {
            state.errorMessage = null;
            state.serverMessage = null;
        },
        onConfirmDeleteReserva: (state) => {
            state.confirm = !state.confirm;
        },
        onCloseModalReserva: (state) => {
            state.active = null;
            state.errorMessage = null;
            state.serverMessage = null;
        }
    }
})

export const {
    onIsLoadingReserva,
    onLoadReservas,
    onSetActiveReserva,
    onAddNewReserva,
    onUpdateReserva,
    onReactivateReserva,
    onSendErrorMessageReserva,
    onSendServerErrorMessageReserva,
    onClearMessageReserva,
    onConfirmDeleteReserva,
    onCloseModalReserva,
} = resservaSlices.actions