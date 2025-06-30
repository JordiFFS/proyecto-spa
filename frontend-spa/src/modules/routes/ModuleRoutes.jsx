import { Navigate, Route, Routes } from 'react-router-dom'
import { ModulesLayout } from '../layout'
import { ProtectedRoute } from '../components'
import { AdminRoutes, ClientRoutes, EmployeRoutes } from '../modules'
import { useAuthStore } from '../../hooks'

export const ModuleRoutes = () => {
    
    const { user } = useAuthStore();

    const getDefaultRoute = () => {
        switch (user?.rol) {
            case 'admin': return '/admin';
            case 'empleado': return '/employe';
            case 'cliente': return '/client';
            default: return '/unauthorized';
        }
    };

    return (
        <ModulesLayout>
            <Routes>
                <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminRoutes />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employe/*"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'empleado']}>
                            <EmployeRoutes />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/client/*"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'empleado', 'cliente']}>
                            <ClientRoutes />
                        </ProtectedRoute>
                    }
                />

                <Route path="/*" element={<Navigate to={getDefaultRoute()} replace />} />
            </Routes>
        </ModulesLayout>
    )
}