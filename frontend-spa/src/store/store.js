import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./authSlice";
import { auditoriaSlice, disponibilidadSlices, employeSlices, notificacionesSlices, resservaSlices, serviceSlices, sugerenciaSlice, userSlices } from "./modules";

export const store = configureStore({
    reducer: {
        // SISTEMA
        auth: authSlice.reducer,

        // LÓGICA DE NEGOCIO
        user: userSlices.reducer,
        employe: employeSlices.reducer,
        service: serviceSlices.reducer,
        disponibilidad: disponibilidadSlices.reducer,
        reserva: resservaSlices.reducer,

        // Reportes Mongo
        auditoria: auditoriaSlice.reducer,
        notifiacion: notificacionesSlices.reducer,
        sugerencia: sugerenciaSlice.reducer,

    }
});