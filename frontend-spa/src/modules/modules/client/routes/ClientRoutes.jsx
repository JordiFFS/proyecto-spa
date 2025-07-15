import { Navigate, Route, Routes } from 'react-router-dom'
import { ClientPages } from '../pages'
import { EmployePages, NotificacionesPages, ReservacionCalendario, ReservaEstadisticas, ReservaForm, ReservaPages, ReservaView, ServicesPages, SugerenciaPages } from '../../admin'

export const ClientRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ClientPages />} />

            {/* Servicios */}

            <Route path="/servicios" element={<ServicesPages />} />

            {/* Empleados */}
            <Route path="/empleados" element={<EmployePages />} />

            {/* Reservas */}
            <Route path="/reservas" element={<ReservaPages />} />
            <Route path="/reservas/form" element={<ReservaForm />} />
            <Route path="/reservas/view" element={<ReservaView />} />

            {/* Calendario */}
            <Route path="/mis-reservas" element={<ReservacionCalendario />} />
            <Route path="/historial" element={<ReservaEstadisticas />} />

            {/* Notificaciones */}
            <Route path="/notificaciones" element={<NotificacionesPages />} />

            Sugerencias
            <Route path="/sugerencias" element={<SugerenciaPages />} />

            <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
    )
}
