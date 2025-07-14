import { createSlice } from "@reduxjs/toolkit";

export const sugerenciaSlice = createSlice({
    name: "sugerencia",
    initialState: {
        isLoading: false,
        sugerencias: [],
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
        onIsLoadingSugerencia: (state) => {
            state.isLoading = true;
            state.errorMessage = null;
            state.serverMessage = null;
        },
        onLoadSugerencia: (state, { payload }) => {
            state.isLoading = false;
            state.sugerencias = payload.data || [];
            state.pagination = payload.pagination || {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            };
        },
        onSetActiveSugerencia: (state, { payload }) => {
            state.active = payload;
        },
        onAddNewSugerencia: (state, { payload }) => {
            state.sugerencias.push(payload);
            state.isLoading = false;
        },
        onUpdateSugerencia: (state, { payload }) => {
            state.sugerencias = state.sugerencias.map(user =>
                user.id === payload.id ? payload : user
            );
            state.active = payload;
            state.isLoading = false;
        },
        onReactivateSugerencia: (state, { payload }) => {
            state.sugerencias = state.sugerencias.map(user =>
                user.id === payload ? { ...user, activo: true } : user
            );
            state.isLoading = false;
        },
        onSendErrorMessageSugerencia: (state, { payload }) => {
            state.errorMessage = payload;
            state.isLoading = false;
        },
        onSendServerErrorMessageSugerencia: (state, { payload }) => {
            state.serverMessage = payload;
            state.isLoading = false;
        },
        onClearMessageSugerencia: (state) => {
            state.errorMessage = null;
            state.serverMessage = null;
        },
        onConfirmDeleteSugerencia: (state) => {
            state.confirm = !state.confirm;
        },
        onCloseModalSugerencia: (state) => {
            state.active = null;
            state.errorMessage = null;
            state.serverMessage = null;
        }
    }
})

export const {
    onIsLoadingSugerencia,
    onLoadSugerencia,
    onSetActiveSugerencia,
    onAddNewSugerencia,
    onUpdateSugerencia,
    onReactivateSugerencia,
    onSendErrorMessageSugerencia,
    onSendServerErrorMessageSugerencia,
    onClearMessageSugerencia,
    onConfirmDeleteSugerencia,
    onCloseModalSugerencia,
} = sugerenciaSlice.actions