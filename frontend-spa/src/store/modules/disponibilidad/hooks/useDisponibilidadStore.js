import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    onIsLoadingDisponibilidad,
    onLoadDisponibilidades,
    onSetActiveDisponibilidad,
    onAddNewDisponibilidad,
    onUpdateDisponibilidad,
    onSendErrorMessageDisponibilidad,
    onSendServerErrorMessageDisponibilidad,
    onClearMessageDisponibilidad,
    onConfirmDeleteDisponibilidad,
    onCloseModalDisponibilidad,
} from "../slices";
import { spaApi } from "../../../../api";

export const useDisponibilidadStore = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        isLoading,
        disponibilidades,
        active,
        serverMessage,
        errorMessage,
        confirm,
        pagination,
    } = useSelector(state => state.disponibilidad);
    const [errorAtributes, setErrorAtributes] = useState([]);

    const startLoadingDisponibilidad = async (queryParams = {}) => {
        dispatch(onIsLoadingDisponibilidad());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.disponible !== undefined && { disponible: queryParams.disponible }),
                ...(queryParams.search && { search: queryParams.search }),
                ...(queryParams.fecha && { fecha: queryParams.fecha }),
                ...(queryParams.empleado_id && { empleado_id: queryParams.empleado_id })
            });

            const { data } = await spaApi.get(`/disponibilidad?${params}`);
            dispatch(onLoadDisponibilidades(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageDisponibilidad(error.response?.data?.message || 'Error al cargar disponibilidades'));
        }
    };

    const startLoadingActiveDisponibilidades = async (queryParams = {}) => {
        dispatch(onIsLoadingDisponibilidad());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.search && { search: queryParams.search }),
                ...(queryParams.fecha && { fecha: queryParams.fecha }),
                ...(queryParams.empleado_id && { empleado_id: queryParams.empleado_id })
            });

            const { data } = await spaApi.get(`/disponibilidad/active?${params}`);
            dispatch(onLoadDisponibilidades(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageDisponibilidad(error.response?.data?.message || 'Error al cargar disponibilidades activas'));
        }
    };

    const startLoadingDisponibilidadById = async (id) => {
        dispatch(onIsLoadingDisponibilidad());
        try {
            const { data } = await spaApi(`/disponibilidad/${id}`);
            dispatch(onSetActiveDisponibilidad(data.data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageDisponibilidad(error.response?.data?.message || 'Error al cargar disponibilidad'));
        }
    };

    const startLoadingDisponibilidadStats = async () => {
        dispatch(onIsLoadingDisponibilidad());
        try {
            const { data } = await spaApi.get('/disponibilidad/stats');
            return data;
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageDisponibilidad(error.response?.data?.message || 'Error al cargar estadísticas'));
        }
    };

    const startLoadingDisponibilidadByEmployee = async (empleado_id, queryParams = {}) => {
        dispatch(onIsLoadingDisponibilidad());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.fecha && { fecha: queryParams.fecha }),
                ...(queryParams.disponible !== undefined && { disponible: queryParams.disponible })
            });

            const { data } = await spaApi.get(`/disponibilidad/employee/${empleado_id}?${params}`);
            dispatch(onLoadDisponibilidades(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageDisponibilidad(error.response?.data?.message || 'Error al cargar disponibilidades del empleado'));
        }
    };

    const startLoadingAvailableSlots = async (queryParams = {}) => {
        dispatch(onIsLoadingDisponibilidad());
        try {
            const params = new URLSearchParams({
                ...(queryParams.fecha && { fecha: queryParams.fecha }),
                ...(queryParams.empleado_id && { empleado_id: queryParams.empleado_id }),
                ...(queryParams.servicio_id && { servicio_id: queryParams.servicio_id })
            });

            const { data } = await spaApi.get(`/disponibilidad/available-slots?${params}`);
            return data;
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageDisponibilidad(error.response?.data?.message || 'Error al cargar horarios disponibles'));
        }
    };

    const startGenerateAutoSchedule = async (empleado_id, scheduleData) => {
        dispatch(onIsLoadingDisponibilidad());
        try {
            const { data } = await spaApi.post(`/disponibilidad/employee/${empleado_id}/auto-generate`, scheduleData);
            dispatch(onSendServerErrorMessageDisponibilidad(data.message));
            return data;
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageDisponibilidad(error.response?.data?.message || 'Error al generar horario automático'));
        }
    };

    const startBlockSchedule = async (blockData) => {
        dispatch(onIsLoadingDisponibilidad());
        try {
            const { data } = await spaApi.post('/disponibilidad/block', blockData);
            dispatch(onAddNewDisponibilidad(data.data));
            dispatch(onSendServerErrorMessageDisponibilidad(data.message));
        } catch (error) {
            console.log(error);
            if (error.response?.status === 400) {
                const errorData = error.response.data;
                if (typeof errorData === 'object' && !errorData.message) {
                    const claves = Object.keys(errorData);
                    setErrorAtributes(errorData);
                    const firstValue = errorData[claves[0]];
                    dispatch(onSendErrorMessageDisponibilidad(`${firstValue[0]}`));
                } else {
                    dispatch(onSendErrorMessageDisponibilidad(errorData.message || 'Error de validación'));
                }
            }
        }
    };

    const startUnblockSchedule = async (id) => {
        dispatch(onIsLoadingDisponibilidad());
        try {
            const { data } = await spaApi.put(`/disponibilidad/${id}/unblock`);
            dispatch(onUpdateDisponibilidad(data.data));
            dispatch(onSendServerErrorMessageDisponibilidad(data.message));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageDisponibilidad(error.response?.data?.message || 'Error al desbloquear horario'));
        }
    };

    const startSetActiveDisponibilidad = (disponibilidad) => {
        dispatch(onSetActiveDisponibilidad(disponibilidad));
    };

    const startSavingDisponibilidad = async (disponibilidadData) => {
        dispatch(onIsLoadingDisponibilidad());
        try {
            if (disponibilidadData.id) {
                // Actualiza el registro
                const { data } = await spaApi.put(`/disponibilidad/${disponibilidadData.id}`, disponibilidadData);
                dispatch(onUpdateDisponibilidad(data.data));
                navigate(-1);
                return data;
            }
            // Crear nuevo registro
            const { data } = await spaApi.post('/disponibilidad', disponibilidadData);
            if (data.success) {
                dispatch(onAddNewDisponibilidad(data.data));
                navigate(-1);
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
                    dispatch(onSendErrorMessageDisponibilidad(`${firstValue[0]}`));
                } else {
                    // Si es un mensaje de error directo
                    dispatch(onSendErrorMessageDisponibilidad(errorData.message || 'Error de validación'));
                }
            }
        }
    };

    const startDeletingDisponibilidad = async (disponibilidad) => {
        dispatch(onIsLoadingDisponibilidad());
        try {
            const { data } = await spaApi.delete(`/disponibilidad/${disponibilidad.id}`);
            dispatch(onSetActiveDisponibilidad(null));
            dispatch(onSendServerErrorMessageDisponibilidad(data.message));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageDisponibilidad(error.response?.data?.message || 'Error al eliminar disponibilidad'));
        }
    };

    const startDebugEmployees = async () => {
        dispatch(onIsLoadingDisponibilidad());
        try {
            const { data } = await spaApi.get('/disponibilidad/debug/employees');
            return data;
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageDisponibilidad(error.response?.data?.message || 'Error al cargar información de empleados'));
        }
    };

    const startClearMessage = () => {
        dispatch(onClearMessageDisponibilidad());
        setErrorAtributes([]);
    };

    const startConfirmDelete = () => {
        dispatch(onConfirmDeleteDisponibilidad());
    };

    const startCloseDisponibilidad = () => {
        dispatch(onCloseModalDisponibilidad());
        setErrorAtributes([]);
    };

    return {
        // Atributos
        isLoading,
        disponibilidades,
        active,
        errorAtributes,
        serverMessage,
        errorMessage,
        confirm,
        pagination,
        // Métodos
        startLoadingDisponibilidad,
        startLoadingActiveDisponibilidades,
        startLoadingDisponibilidadById,
        startLoadingDisponibilidadStats,
        startLoadingDisponibilidadByEmployee,
        startLoadingAvailableSlots,
        startGenerateAutoSchedule,
        startBlockSchedule,
        startUnblockSchedule,
        startSetActiveDisponibilidad,
        startSavingDisponibilidad,
        startDeletingDisponibilidad,
        startDebugEmployees,
        startClearMessage,
        startConfirmDelete,
        startCloseDisponibilidad,
    }
}