import { createSlice } from "@reduxjs/toolkit";

export const serviceSlices = createSlice({
    name: "service",
    initialState: {
        isLoading: false,
        services: [],
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
        onIsLoadingService: (state) => {
            state.isLoading = true;
            state.errorMessage = null;
            state.serverMessage = null;
        },
        onLoadServices: (state, { payload }) => {
            state.isLoading = false;
            state.services = payload.data || [];
            state.pagination = payload.pagination || {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            };
        },
        onSetActiveService: (state, { payload }) => {
            state.active = payload;
        },
        onAddNewService: (state, { payload }) => {
            state.services.push(payload);
            state.isLoading = false;
        },
        onUpdateService: (state, { payload }) => {
            state.services = state.services.map(user =>
                user.id === payload.id ? payload : user
            );
            state.active = payload;
            state.isLoading = false;
        },
        onReactivateService: (state, { payload }) => {
            state.services = state.services.map(user =>
                user.id === payload ? { ...user, activo: true } : user
            );
            state.isLoading = false;
        },
        onSendErrorMessageService: (state, { payload }) => {
            state.errorMessage = payload;
            state.isLoading = false;
        },
        onSendServerErrorMessageService: (state, { payload }) => {
            state.serverMessage = payload;
            state.isLoading = false;
        },
        onClearMessageService: (state) => {
            state.errorMessage = null;
            state.serverMessage = null;
        },
        onConfirmDeleteService: (state) => {
            state.confirm = !state.confirm;
        },
        onCloseModalService: (state) => {
            state.active = null;
            state.errorMessage = null;
            state.serverMessage = null;
        }
    }
});

export const {
    onIsLoadingService,
    onLoadServices,
    onSetActiveService,
    onAddNewService,
    onUpdateService,
    onReactivateService,
    onSendErrorMessageService,
    onSendServerErrorMessageService,
    onClearMessageService,
    onConfirmDeleteService,
    onCloseModalService,
} = serviceSlices.actions;