import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom";

import { clearErrorMessage, login, logout, sendServerMessage, checkingCredentials } from "../store";

import { spaApi } from "../api";

export const useAuthStore = () => {

    const { user, status, errorMessage } = useSelector((state) => state.auth);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const startErrorMessage = (msg) => {
        dispatch(sendServerMessage(msg));
    };

    const startClearErrorMessage = () => {
        dispatch(clearErrorMessage());
    };

    const startLogin = async ({ email, password }) => {
        dispatch(clearErrorMessage());
        try {
            const { data } = await spaApi.post("/auth/login", { email, password });
            localStorage.setItem("token", data.token);
            dispatch(login({ user: data.user, token: data.token }));
            return { resp: true };
        } catch (error) {
            console.error('Error en login:', error);
            const errorMsg = error.response?.data?.msg || 'Error de conexión';
            startErrorMessage(errorMsg);
            return { resp: false };
        }
    };

    const startlogout = () => {
        localStorage.clear();
        dispatch(logout());
    };

    const startRegister = async (values) => {
        dispatch(clearErrorMessage());
        dispatch(checkingCredentials());

        try {
            const { data } = await spaApi.post("/auth/register", values);
            localStorage.setItem("token", data.token);
            dispatch(logout());
            navigate("/auth/login");
            return { resp: true, data };
        } catch (error) {
            console.error('Error en register:', error);
            const errorMsg = error.response?.data?.msg || 'Error de conexión';
            dispatch(sendServerMessage(errorMsg));
            dispatch(logout());
            return { resp: false };
        }
    };

    const startRenewToken = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            dispatch(logout());
            return false;
        }

        dispatch(checkingCredentials());

        try {
            const { data } = await spaApi.get("/auth/renew");
            localStorage.setItem("token", data.token);
            dispatch(login({ user: data.user, token: data.token }));
            return true;
        } catch (error) {
            localStorage.removeItem('token');
            console.log(error);
            dispatch(logout());
            return false;
        }
    };

    return {
        // variables
        user,
        status,
        errorMessage,

        // metodos
        startLogin,
        startlogout,
        startRegister,
        startRenewToken,
        startErrorMessage,
        startClearErrorMessage
    }
}