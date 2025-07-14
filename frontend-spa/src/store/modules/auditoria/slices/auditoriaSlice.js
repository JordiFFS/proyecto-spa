import { createSlice } from "@reduxjs/toolkit";

export const auditoriaSlice = createSlice({
    name: "auditoria",
    initialState: {
        isLoading: false,
        auditoriaData: [],
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
        onIsLoadingAuditoria: (state) => {
            state.isLoading = true;
            state.errorMessage = null;
            state.serverMessage = null;
        },
        onLoadAuditoria: (state, { payload }) => {
            state.isLoading = false;
            state.auditoriaData = payload.data || [];
            state.pagination = payload.pagination || {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            };
        },
        onSetActiveAuditoria: (state, { payload }) => {
            state.active = payload;
        },
        onAddNewAuditoria: (state, { payload }) => {
            state.auditoriaData.push(payload);
            state.isLoading = false;
        },
        onUpdateAuditoria: (state, { payload }) => {
            state.auditoriaData = state.auditoriaData.map(user =>
                user.id === payload.id ? payload : user
            );
            state.active = payload;
            state.isLoading = false;
        },
        onReactivateAuditoria: (state, { payload }) => {
            state.auditoriaData = state.auditoriaData.map(user =>
                user.id === payload ? { ...user, activo: true } : user
            );
            state.isLoading = false;
        },
        onSendErrorMessageAuditoria: (state, { payload }) => {
            state.errorMessage = payload;
            state.isLoading = false;
        },
        onSendServerErrorMessageAuditoria: (state, { payload }) => {
            state.serverMessage = payload;
            state.isLoading = false;
        },
        onClearMessageAuditoria: (state) => {
            state.errorMessage = null;
            state.serverMessage = null;
        },
        onConfirmDeleteAuditoria: (state) => {
            state.confirm = !state.confirm;
        },
        onCloseModalAuditoria: (state) => {
            state.active = null;
            state.errorMessage = null;
            state.serverMessage = null;
        }
    }
})

export const {
    onIsLoadingAuditoria,
    onLoadAuditoria,
    onSetActiveAuditoria,
    onAddNewAuditoria,
    onUpdateAuditoria,
    onReactivateAuditoria,
    onSendErrorMessageAuditoria,
    onSendServerErrorMessageAuditoria,
    onClearMessageAuditoria,
    onConfirmDeleteAuditoria,
    onCloseModalAuditoria,
} = auditoriaSlice.actions