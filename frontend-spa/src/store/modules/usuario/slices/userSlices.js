import { createSlice } from '@reduxjs/toolkit';

export const userSlices = createSlice({
    name: 'user',
    initialState: {
        isLoading: false,
        users: [],
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
        onIsLoadingUser: (state) => {
            state.isLoading = true;
            state.errorMessage = null;
            state.serverMessage = null;
        },
        onLoadUsers: (state, { payload }) => {
            state.isLoading = false;
            state.users = payload.data || [];
            state.pagination = payload.pagination || {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            };
        },
        onSetActiveUser: (state, { payload }) => {
            state.active = payload;
        },
        onAddNewUser: (state, { payload }) => {
            state.users.push(payload);
            state.isLoading = false;
        },
        onUpdateUser: (state, { payload }) => {
            state.users = state.users.map(user => 
                user.id === payload.id ? payload : user
            );
            state.active = payload;
            state.isLoading = false;
        },
        onReactivateUser: (state, { payload }) => {
            state.users = state.users.map(user => 
                user.id === payload ? { ...user, activo: true } : user
            );
            state.isLoading = false;
        },
        onSendErrorMessageUser: (state, { payload }) => {
            state.errorMessage = payload;
            state.isLoading = false;
        },
        onSendServerErrorMessageUser: (state, { payload }) => {
            state.serverMessage = payload;
            state.isLoading = false;
        },
        onClearMessageUser: (state) => {
            state.errorMessage = null;
            state.serverMessage = null;
        },
        onConfirmDeleteUser: (state) => {
            state.confirm = !state.confirm;
        },
        onCloseModalUser: (state) => {
            state.active = null;
            state.errorMessage = null;
            state.serverMessage = null;
        }
    }
});

export const {
    onIsLoadingUser,
    onLoadUsers,
    onSetActiveUser,
    onAddNewUser,
    onUpdateUser,
    onReactivateUser,
    onSendErrorMessageUser,
    onSendServerErrorMessageUser,
    onClearMessageUser,
    onConfirmDeleteUser,
    onCloseModalUser
} = userSlices.actions;