import { Navigate, Route, Routes } from 'react-router-dom'
import { EmployeDashboard } from "../pages"
import { DisponibilidadForm, DisponibilidadPages, NotificacionesPages, ReservacionCalendario, ReservaEstadisticas, ReservaPages, ReservaView, ServicesForm, ServicesPages } from '../../admin'

export const EmployeRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<EmployeDashboard />} />

            {/* Servicios */}
            <Route path="/servicios" element={<ServicesPages />} />
            <Route path="/servicios/form" element={<ServicesForm />} />

            {/* reserva */}
            <Route path="/reservas" element={<ReservaPages />} />
            {/* <Route path="/reservas/form" element={<ReservaForm />} /> */}
            <Route path="/reservas/view" element={<ReservaView />} />


            <Route path="/mis-reservas" element={<ReservacionCalendario />} />

            {/* disponibilidad */}
            <Route path="/disponibilidad" element={<DisponibilidadPages />} />
            <Route path="/disponibilidad/form" element={<DisponibilidadForm />} />

            {/* Historial  */}
            <Route path="/historial" element={<ReservaEstadisticas />} />

            {/* Notificaciones */}
            <Route path="/notificaciones" element={<NotificacionesPages />} />

            <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
    )
}
