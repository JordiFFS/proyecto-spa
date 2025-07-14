import { AdminPages, AuditoriaPages, DisponibilidadForm, DisponibilidadPages, EmployeForm, EmployePages, ReporteServicios, ReservacionCalendario, ReservaEstadisticas, ReservaForm, ReservaPages, ReservaView, ServicesForm, ServicesPages, UserForm, UserPages, NotificacionesPages, SugerenciaPages } from '../pages'
import { Navigate, Route, Routes } from 'react-router-dom'

export const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AdminPages />} />
            <Route path="/dashboard" element={<AdminPages />} />

            {/* Modulo de usuarios */}
            <Route path="/usuarios" element={<UserPages />} />
            <Route path="/usuarios/form" element={<UserForm />} />

            {/* modulo de empleados */}
            <Route path="/empleados" element={<EmployePages />} />
            <Route path="/empleados/form" element={<EmployeForm />} />

            {/* modulo de servicios */}
            <Route path="/servicios" element={<ServicesPages />} />
            <Route path="/servicios/form" element={<ServicesForm />} />

            {/* modulo de desponibilidad */}
            <Route path="/disponibilidad" element={<DisponibilidadPages />} />
            <Route path="/disponibilidad/form" element={<DisponibilidadForm />} />

            {/* Reservacion */}
            <Route path="/reservas" element={<ReservaPages />} />
            <Route path="/reservas/form" element={<ReservaForm />} />
            <Route path="/reservas/view" element={<ReservaView />} />

            {/* calendario */}
            <Route path="/calendario" element={<ReservacionCalendario />} />

            {/* Historial */}
            <Route path="/historial-reservas" element={<ReservaEstadisticas />} />

            {/* Reportes */}
            <Route path="/reportes/servicios" element={<ReporteServicios />} />
            <Route path="/reportes/empleados" element={<ReporteServicios />} />
            <Route path="/auditoria" element={<AuditoriaPages />} />

            {/* Notificaciones */}
            <Route path="/notificaciones" element={<NotificacionesPages />} />

            <Route path="/sugerencias" element={<SugerenciaPages />} />


            <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
    )
}
