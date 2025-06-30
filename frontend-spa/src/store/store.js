import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./authSlice";
import { userSlices } from "./modules";

export const store = configureStore({
    reducer: {
        // SISTEMA
        auth: authSlice.reducer,

        // LÓGICA DE NEGOCIO
        user: userSlices.reducer,
    }
});