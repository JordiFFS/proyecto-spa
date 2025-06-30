import { Navigate, Route, Routes } from 'react-router-dom'
import { EmployePages } from "../pages"

export const EmployeRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<EmployePages />} />
            <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
    )
}
