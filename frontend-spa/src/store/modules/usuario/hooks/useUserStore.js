import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// import { decryptData } from "../../../../hooks";
import { useState } from "react";
import {
    onAddNewUser,
    onClearMessageUser,
    onCloseModalUser,
    onConfirmDeleteUser,
    onIsLoadingUser,
    onLoadUsers,
    onSendErrorMessageUser,
    onSendServerErrorMessageUser,
    onSetActiveUser,
    onUpdateUser,
    onReactivateUser
} from "../slices";
import { spaApi } from "../../../../api";

export const useUserStore = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    // const companyInfo = localStorage.getItem("Company");
    // const decryptedData = JSON.parse(decryptData(companyInfo));

    const { isLoading, users, active, serverMessage, errorMessage, confirm, pagination } = useSelector(state => state.user);
    const [errorAtributes, setErrorAtributes] = useState([]);

    // Cargar usuarios con paginación y filtros
    const startLoadingUsers = async (queryParams = {}) => {
        dispatch(onIsLoadingUser());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.rol && { rol: queryParams.rol }),
                ...(queryParams.activo !== undefined && { activo: queryParams.activo }),
                ...(queryParams.search && { search: queryParams.search })
            });

            const { data } = await spaApi.get(`/usuario?${params}`);
            dispatch(onLoadUsers(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageUser(error.response?.data?.message || 'Error al cargar usuarios'));
        }
    }

    // Cargar usuario por ID
    const startLoadingUserById = async (id) => {
        dispatch(onIsLoadingUser());
        try {
            const { data } = await spaApi.get(`/usuario/${id}`);
            dispatch(onSetActiveUser(data.data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageUser(error.response?.data?.message || 'Error al cargar usuario'));
        }
    }

    const startSetActiveUser = (user) => {
        dispatch(onSetActiveUser(user));
    }

    const startSavingUser = async (userData) => {
        dispatch(onIsLoadingUser());
        try {
            if (userData.id) {
                // Actualizando
                const { data } = await spaApi.put(`/usuario/${userData.id}`, userData);
                dispatch(onUpdateUser(data.data));
                navigate(-1);
                return data;
            }

            // Creando
            const { data } = await spaApi.post('/usuario', userData);
            if (data.success) {
                startCloseUser();
                dispatch(onAddNewUser(data.data));
                return data;
            }

        } catch (error) {
            if (error.response?.status === 400) {
                const errorData = error.response.data;
                if (typeof errorData === 'object' && !errorData.message) {
                    // Si son errores de validación por campo
                    const claves = Object.keys(errorData);
                    setErrorAtributes(errorData);
                    const firstValue = errorData[claves[0]];
                    dispatch(onSendErrorMessageUser(`${firstValue[0]}`));
                } else {
                    // Si es un mensaje de error directo
                    dispatch(onSendErrorMessageUser(errorData.message || 'Error de validación'));
                }
            } else {
                dispatch(onSendServerErrorMessageUser(error.response?.data?.message || 'Error del servidor'));
            }
        }
    }

    // Cambiar contraseña
    const startChangingPassword = async (userId, passwordData) => {
        dispatch(onIsLoadingUser());
        try {
            const { data } = await spaApi.put(`/usuario/${userId}/password`, passwordData);
            dispatch(onSendServerErrorMessageUser(data.message)); // Usar para mensaje de éxito
        } catch (error) {
            if (error.response?.status === 400) {
                dispatch(onSendErrorMessageUser(error.response.data.message));
            } else {
                dispatch(onSendServerErrorMessageUser(error.response?.data?.message || 'Error al cambiar contraseña'));
            }
        }
    }

    // Desactivar usuario (soft delete)
    const startDeletingUser = async (user) => {
        try {
            const { data } = await spaApi.delete(`/usuario/${user.id}`);
            dispatch(onUpdateUser({ ...user, activo: false }));
            dispatch(onSetActiveUser(null));
            dispatch(onSendServerErrorMessageUser(data.message)); // mensaje de éxito
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageUser(error.response?.data?.message || 'Error al desactivar usuario'));
        }
    };

    // Reactivar usuario
    const startReactivatingUser = async (userId) => {
        try {
            const { data } = await spaApi.put(`/usuario/${userId}/reactivate`);
            dispatch(onReactivateUser(userId));
            dispatch(onSendServerErrorMessageUser(data.message)); // Usar para mensaje de éxito
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageUser(error.response?.data?.message || 'Error al reactivar usuario'));
        }
    }

    const startClearMessage = () => {
        dispatch(onClearMessageUser());
        setErrorAtributes([]);
    }

    const startConfirmDelete = () => {
        dispatch(onConfirmDeleteUser());
    }

    const startCloseUser = () => {
        dispatch(onCloseModalUser());
        setErrorAtributes([]);
    }

    return {
        /* ATRIBUTOS */
        active,
        users,
        confirm,
        errorAtributes,
        errorMessage,
        serverMessage,
        isLoading,
        pagination,

        /* METODOS */
        startLoadingUsers,
        startLoadingUserById,
        startSetActiveUser,
        startSavingUser,
        startChangingPassword,
        startDeletingUser,
        startReactivatingUser,
        startClearMessage,
        startConfirmDelete,
        startCloseUser
    }
}