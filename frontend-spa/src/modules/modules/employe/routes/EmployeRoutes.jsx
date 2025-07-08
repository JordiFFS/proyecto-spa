import { Navigate, Route, Routes } from 'react-router-dom'
import { EmployeDashboard } from "../pages"
import { ServicesForm, ServicesPages } from '../../admin'

export const EmployeRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<EmployeDashboard />} />
            <Route path="/servicios" element={<ServicesPages />} />
            <Route path="/servicios/form" element={<ServicesForm />} />
            <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
    )
}
