import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    onIsLoadingEmploye,
    onLoadEmployes,
    onSetActiveEmploye,
    onAddNewEmploye,
    onUpdateEmploye,
    onReactivateEmploye,
    onSendErrorMessageEmploye,
    onSendServerErrorMessageEmploye,
    onClearMessageEmploye,
    onConfirmDeleteEmploye,
    onCloseModalEmploye,
} from "../slices";
import { spaApi } from "../../../../api";

export const useEmployeStore = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        isLoading,
        employes,
        active,
        serverMessage,
        errorMessage,
        confirm,
        pagination,
    } = useSelector(state => state.employe);
    const [errorAtributes, setErrorAtributes] = useState([]);

    const startLoadinEmploye = async (queryParams = {}) => {
        dispatch(onIsLoadingEmploye());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.rol && { rol: queryParams.rol }),
                ...(queryParams.activo !== undefined && { activo: queryParams.activo }),
                ...(queryParams.search && { search: queryParams.search })
            });

            const { data } = await spaApi.get(`/empleado?${params}`);
            dispatch(onLoadEmployes(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageEmploye(error.response?.data?.message || 'Error al cargar empleados'));
        }
    };

    const startLoadingEmployeById = async (id) => {
        dispatch(onIsLoadingEmploye());
        try {
            const { data } = await spaApi(`/empleado/${id}`);
            dispatch(onSetActiveEmploye(data.data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageEmploye(error.response?.data?.message || 'Error al cargar empleado'));
        }
    };

    const startSetActivateEmploye = (employe) => {
        dispatch(onSetActiveEmploye(employe));
    };

    const startSavingEmploye = async (employeData) => {
        dispatch(onIsLoadingEmploye());
        try {
            if (employeData.id) {
                // Actualiza el registro
                const { data } = await spaApi.put(`/empleado/${employeData.id}`, employeData);
                dispatch(onUpdateEmploye(data.data));
                navigate(-1);
                return data;
            }
            // Crear nuevo registro
            const { data } = await spaApi.post('/empleado', employeData);
            if (data.success) {
                // startCloseEmploye();
                dispatch(onAddNewEmploye(data.data));
                navigate(-1);
                return data;
            }
        } catch (error) {
            if (error.response?.status === 400) {
                const errorDAta = error.response.data;
                if (typeof errorDAta === 'object' && !errorDAta.message) {
                    // Si son errores de validación por campo
                    const claves = Object.keys(errorDAta);
                    setErrorAtributes(errorDAta);
                    const firstValue = errorDAta[claves[0]];
                    dispatch(onSendErrorMessageEmploye(`${firstValue[0]}`));
                } else {
                    // Si es un mensaje de error directo
                    dispatch(onSendErrorMessageEmploye(errorDAta.message || 'Error de validación'));
                }
            }
        }
    };

    const startDeletingEmploye = async (employe) => {
        dispatch(onIsLoadingEmploye());
        try {
            const { data } = await spaApi.delete(`/empleado/${employe.id}`);
            dispatch(onUpdateEmploye({ ...employe, activo: false }));
            dispatch(onSetActiveEmploye(null));
            dispatch(onSendServerErrorMessageEmploye(data.message));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageEmploye(error.response?.data?.message || 'Error al eliminar empleado'));
        }
    };

    const startReactivateEmploye = async (employeId) => {
        dispatch(onIsLoadingEmploye());
        try {
            const { data } = await spaApi.put(`/empleado/${employeId}/reactivate`);
            dispatch(onReactivateEmploye(employeId));
            dispatch(onSendServerErrorMessageEmploye(data.message));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageEmploye(error.response?.data?.message || 'Error al reactivar empleado'));
        }
    };

    const startClearMessage = () => {
        dispatch(onClearMessageEmploye());
        setErrorAtributes([]);
    };

    const startConfirmDelete = () => {
        dispatch(onConfirmDeleteEmploye());
    };

    const startCloseEmploye = () => {
        dispatch(onCloseModalEmploye());
        setErrorAtributes([]);
    };

    return {
        // Atributos
        isLoading,
        employes,
        active,
        errorAtributes,
        serverMessage,
        errorMessage,
        confirm,
        pagination,
        // 
        startLoadinEmploye,
        startLoadingEmployeById,
        startSetActivateEmploye,
        startSavingEmploye,
        startDeletingEmploye,
        startReactivateEmploye,
        startClearMessage,
        startConfirmDelete,
        startCloseEmploye,
    }
}
