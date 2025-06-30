import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks';

export const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = '/unauthorized' }) => {
    const { user } = useAuthStore();

    if (!user?.rol) {
        return <Navigate to="/auth/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};