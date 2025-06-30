import { Navigate, Route, Routes } from 'react-router-dom'
import { ClientPages } from '../pages'

export const ClientRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ClientPages />} />
            <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
    )
}
