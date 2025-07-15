import { useState } from "react";
import { spaApi } from "../../api";

export const useGetComboxBox = () => {
    const [user_cbx, setUser_cbx] = useState([]);
    const [users_cbx, setUsers_cbx] = useState([]);
    const [userRol_cbx, setUserRol_cbx] = useState([]);
    const [servicio_cbx, setServicio_cbx] = useState([]);

    const startGetUserCbx = async () => {
        try {
            const { data } = await spaApi.get('/usuario/combobox?activo=true');
            setUser_cbx(Array.isArray(data?.data) ? data.data : []);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            setUser_cbx([]); // fallback seguro
        }
    };

    const startGetUsersCbx = async () => {
        try {
            const { data } = await spaApi.get('/usuario/combobox');
            setUsers_cbx(Array.isArray(data?.data) ? data.data : []);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            setUsers_cbx([]); // fallback seguro
        }
    };

    const startGetUserRolCbx = async (rol) => {
        try {
            const { data } = await spaApi.get(`/empleado/combobox?rol=${rol}`);
            setUserRol_cbx(Array.isArray(data?.data) ? data.data : []);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            setUserRol_cbx([]); // fallback seguro
        }
    };

    const startGetServicioCbx = async () => {
        try {
            const { data } = await spaApi.get('/servicio/combobox');
            setServicio_cbx(Array.isArray(data?.data) ? data.data : []);
        } catch (error) {
            console.error("Error al obtener servicios:", error);
            setServicio_cbx([]); // fallback seguro
        }
    };

    return {
        user_cbx,
        users_cbx,
        userRol_cbx,
        servicio_cbx,
        startGetUserCbx,
        startGetUsersCbx,
        startGetUserRolCbx,
        startGetServicioCbx,
    };
};
