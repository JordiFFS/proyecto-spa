import { createSlice } from '@reduxjs/toolkit'

export const employeSlices = createSlice({
    name: "employe",
    initialState: {
        isLoading: false,
        employes: [],
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
        onIsLoadingEmploye: (state) => {
            state.isLoading = true;
            state.errorMessage = null;
            state.serverMessage = null;
        },
        onLoadEmployes: (state, { payload }) => {
            state.isLoading = false;
            state.employes = payload.data || [];
            state.pagination = payload.pagination || {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            };
        },
        onSetActiveEmploye: (state, { payload }) => {
            state.active = payload;
        },
        onAddNewEmploye: (state, { payload }) => {
            state.employes.push(payload);
            state.isLoading = false;
        },
        onUpdateEmploye: (state, { payload }) => {
            state.employes = state.employes.map(user =>
                user.id === payload.id ? payload : user
            );
            state.active = payload;
            state.isLoading = false;
        },
        onReactivateEmploye: (state, { payload }) => {
            state.employes = state.employes.map(user =>
                user.id === payload ? { ...user, activo: true } : user
            );
            state.isLoading = false;
        },
        onSendErrorMessageEmploye: (state, { payload }) => {
            state.errorMessage = payload;
            state.isLoading = false;
        },
        onSendServerErrorMessageEmploye: (state, { payload }) => {
            state.serverMessage = payload;
            state.isLoading = false;
        },
        onClearMessageEmploye: (state) => {
            state.errorMessage = null;
            state.serverMessage = null;
        },
        onConfirmDeleteEmploye: (state) => {
            state.confirm = !state.confirm;
        },
        onCloseModalEmploye: (state) => {
            state.active = null;
            state.errorMessage = null;
            state.serverMessage = null;
        }
    }
});

export const {
    onIsLoadingEmploye,
    onLoadEmployes,
    onSetActiveEmploye,
    onAddNewEmploye,
    onUpdateEmploye,
    onReactivateEmploye,
    onSendErrorMessageEmploye,
    onSendServerErrorMessageEmploye,
    onClearMessageEmploye,
    onConfirmDeleteEmploye,
    onCloseModalEmploye,
} = employeSlices.actions;