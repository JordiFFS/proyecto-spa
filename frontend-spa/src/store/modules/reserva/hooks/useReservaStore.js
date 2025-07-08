import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    onIsLoadingReserva,
    onLoadReservas,
    onSetActiveReserva,
    onAddNewReserva,
    onUpdateReserva,
    onSendErrorMessageReserva,
    onSendServerErrorMessageReserva,
    onClearMessageReserva,
    onConfirmDeleteReserva,
    onCloseModalReserva,
} from "../slices";
import { spaApi } from "../../../../api";

export const useReservaStore = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        isLoading,
        reservas,
        active,
        serverMessage,
        errorMessage,
        confirm,
        pagination,
    } = useSelector(state => state.reserva);
    const [errorAtributes, setErrorAtributes] = useState([]);

    const startLoadingReserva = async (queryParams = {}) => {
        dispatch(onIsLoadingReserva());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.usuario_id && { usuario_id: queryParams.usuario_id }),
                ...(queryParams.empleado_id && { empleado_id: queryParams.empleado_id }),
                ...(queryParams.servicio_id && { servicio_id: queryParams.servicio_id }),
                ...(queryParams.fecha && { fecha: queryParams.fecha }),
                ...(queryParams.estado && { estado: queryParams.estado }),
                ...(queryParams.search && { search: queryParams.search }),
                ...(queryParams.fecha_inicio && { fecha_inicio: queryParams.fecha_inicio }),
                ...(queryParams.fecha_fin && { fecha_fin: queryParams.fecha_fin })
            });

            const { data } = await spaApi.get(`/reservacion?${params}`);
            dispatch(onLoadReservas(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageReserva(error.response?.data?.message || 'Error al cargar reservas'));
        }
    };

    const startLoadingReservaById = async (id) => {
        dispatch(onIsLoadingReserva());
        try {
            const { data } = await spaApi(`/reservacion/${id}`);
            dispatch(onSetActiveReserva(data.data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageReserva(error.response?.data?.message || 'Error al cargar reserva'));
        }
    };

    const startLoadingReservaStats = async () => {
        dispatch(onIsLoadingReserva());
        try {
            const { data } = await spaApi.get('/reservacion/stats');
            return data;
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageReserva(error.response?.data?.message || 'Error al cargar estadísticas de reservas'));
        }
    };

    const startLoadingReservaByEmployee = async (empleado_id, queryParams = {}) => {
        dispatch(onIsLoadingReserva());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.fecha && { fecha: queryParams.fecha }),
                ...(queryParams.estado && { estado: queryParams.estado }),
                ...(queryParams.fecha_inicio && { fecha_inicio: queryParams.fecha_inicio }),
                ...(queryParams.fecha_fin && { fecha_fin: queryParams.fecha_fin })
            });

            const { data } = await spaApi.get(`/reservacion/employee/${empleado_id}?${params}`);
            dispatch(onLoadReservas(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageReserva(error.response?.data?.message || 'Error al cargar reservas del empleado'));
        }
    };

    const startLoadingReservaByUser = async (usuario_id, queryParams = {}) => {
        dispatch(onIsLoadingReserva());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.fecha && { fecha: queryParams.fecha }),
                ...(queryParams.estado && { estado: queryParams.estado }),
                ...(queryParams.fecha_inicio && { fecha_inicio: queryParams.fecha_inicio }),
                ...(queryParams.fecha_fin && { fecha_fin: queryParams.fecha_fin })
            });

            const { data } = await spaApi.get(`/reservacion/user/${usuario_id}?${params}`);
            dispatch(onLoadReservas(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageReserva(error.response?.data?.message || 'Error al cargar reservas del usuario'));
        }
    };

    const startChangeReservaStatus = async (id, newStatus) => {
        dispatch(onIsLoadingReserva());
        try {
            const { data } = await spaApi.patch(`/reservacion/${id}/status`, { estado: newStatus });
            dispatch(onUpdateReserva(data.data));
            dispatch(onSendServerErrorMessageReserva(data.message));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageReserva(error.response?.data?.message || 'Error al cambiar el estado de la reserva'));
        }
    };

    const startSetActiveReserva = (reserva) => {
        dispatch(onSetActiveReserva(reserva));
    };

    const startSavingReserva = async (reservaData) => {
        dispatch(onIsLoadingReserva());
        try {
            if (reservaData.id) {
                // Actualiza el registro
                const { data } = await spaApi.put(`/reservacion/${reservaData.id}`, reservaData);
                dispatch(onUpdateReserva(data.data));
                navigate(-1);
                return;
            }
            // Crear nuevo registro
            const { data } = await spaApi.post('/reservacion', reservaData);
            if (data.success) {
                dispatch(onAddNewReserva(data.data));
                navigate(-1);
            }
        } catch (error) {
            if (error.response?.status === 400) {
                const errorData = error.response.data;
                if (typeof errorData === 'object' && !errorData.message) {
                    // Si son errores de validación por campo
                    const claves = Object.keys(errorData);
                    setErrorAtributes(errorData);
                    const firstValue = errorData[claves[0]];
                    dispatch(onSendErrorMessageReserva(`${firstValue[0]}`));
                } else {
                    // Si es un mensaje de error directo
                    dispatch(onSendErrorMessageReserva(errorData.message || 'Error de validación'));
                }
            }
        }
    };

    const startDeletingReserva = async (reserva) => {
        dispatch(onIsLoadingReserva());
        try {
            const { data } = await spaApi.delete(`/reservacion/${reserva.id}`);
            dispatch(onSetActiveReserva(null));
            dispatch(onSendServerErrorMessageReserva(data.message));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageReserva(error.response?.data?.message || 'Error al eliminar reserva'));
        }
    };

    const startClearMessage = () => {
        dispatch(onClearMessageReserva());
        setErrorAtributes([]);
    };

    const startConfirmDelete = () => {
        dispatch(onConfirmDeleteReserva());
    };

    const startCloseReserva = () => {
        dispatch(onCloseModalReserva());
        setErrorAtributes([]);
    };

    return {
        // Atributos
        isLoading,
        reservas,
        active,
        errorAtributes,
        serverMessage,
        errorMessage,
        confirm,
        pagination,
        // Métodos
        startLoadingReserva,
        startLoadingReservaById,
        startLoadingReservaStats,
        startLoadingReservaByEmployee,
        startLoadingReservaByUser,
        startChangeReservaStatus,
        startSetActiveReserva,
        startSavingReserva,
        startDeletingReserva,
        startClearMessage,
        startConfirmDelete,
        startCloseReserva,
    }
}