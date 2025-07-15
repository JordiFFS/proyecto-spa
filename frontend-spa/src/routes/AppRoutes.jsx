import { Navigate, Route, Routes } from "react-router-dom"
import { useAuthStore } from "../hooks"
import { AuthRoutes } from "../auth";
import { ModuleRoutes } from "../modules";
import { CheckingAuth } from "../ui";

export const AppRoutes = () => {

    const {
        // user,
        status,
    } = useAuthStore();

    if (status === 'checking') return <CheckingAuth msg="Validando credenciales ..." />;

    return (
        <Routes>
            {(status === 'authenticated') ?
                (
                    <>
                        <Route path="/*" element={<ModuleRoutes />} />
                        <Route path="/auth/*" element={<Navigate to="/" />} />
                    </>
                ) : (
                    <>
                        <Route path="/auth/*" element={<AuthRoutes />} />
                        <Route path="/*" element={<Navigate to="/auth/login" />} />
                    </>
                )}

        </Routes>
    )
}
