import { AdminPages, UserForm, UserPages } from '../pages'
import { Navigate, Route, Routes } from 'react-router-dom'

export const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AdminPages />} />
            <Route path="/dashboard" element={<AdminPages />} />
            <Route path="/usuarios" element={<UserPages />} />
            <Route path="/usuarios/form" element={<UserForm />} />
            <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
    )
}
