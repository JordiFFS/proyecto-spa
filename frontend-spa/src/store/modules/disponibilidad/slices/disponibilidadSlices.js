import { createSlice } from '@reduxjs/toolkit'
import React from 'react'

export const disponibilidadSlices = createSlice({
    name: "disponibilidad",
    initialState: {
        isLoading: false,
        disponibilidades: [],
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
        onIsLoadingDisponibilidad: (state) => {
            state.isLoading = true;
            state.errorMessage = null;
            state.serverMessage = null;
        },
        onLoadDisponibilidades: (state, { payload }) => {
            state.isLoading = false;
            state.disponibilidades = payload.data || [];
            state.pagination = payload.pagination || {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            };
        },
        onSetActiveDisponibilidad: (state, { payload }) => {
            state.active = payload;
        },
        onAddNewDisponibilidad: (state, { payload }) => {
            state.disponibilidades.push(payload);
            state.isLoading = false;
        },
        onUpdateDisponibilidad: (state, { payload }) => {
            state.disponibilidades = state.disponibilidades.map(user =>
                user.id === payload.id ? payload : user
            );
            state.active = payload;
            state.isLoading = false;
        },
        onReactivateDisponibilidad: (state, { payload }) => {
            state.disponibilidades = state.disponibilidades.map(user =>
                user.id === payload ? { ...user, activo: true } : user
            );
            state.isLoading = false;
        },
        onSendErrorMessageDisponibilidad: (state, { payload }) => {
            state.errorMessage = payload;
            state.isLoading = false;
        },
        onSendServerErrorMessageDisponibilidad: (state, { payload }) => {
            state.serverMessage = payload;
            state.isLoading = false;
        },
        onClearMessageDisponibilidad: (state) => {
            state.errorMessage = null;
            state.serverMessage = null;
        },
        onConfirmDeleteDisponibilidad: (state) => {
            state.confirm = !state.confirm;
        },
        onCloseModalDisponibilidad: (state) => {
            state.active = null;
            state.errorMessage = null;
            state.serverMessage = null;
        }
    }
})

export const {
    onIsLoadingDisponibilidad,
    onLoadDisponibilidades,
    onSetActiveDisponibilidad,
    onAddNewDisponibilidad,
    onUpdateDisponibilidad,
    onReactivateDisponibilidad,
    onSendErrorMessageDisponibilidad,
    onSendServerErrorMessageDisponibilidad,
    onClearMessageDisponibilidad,
    onConfirmDeleteDisponibilidad,
    onCloseModalDisponibilidad,
} = disponibilidadSlices.actions