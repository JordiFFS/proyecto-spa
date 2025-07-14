import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    onAddNewNotifiacion, 
    onClearMessageNotifiacion, 
    onCloseModalNotifiacion, 
    onConfirmDeleteNotifiacion, 
    onIsLoadingNotifiacion, 
    onLoadNotifiacion, 
    onReactivateNotifiacion,
    onSendErrorMessageNotifiacion, 
    onSendServerErrorMessageNotifiacion, 
    onSetActiveNotifiacion, 
    onUpdateNotifiacion 
} from '../slices';
import { spaApi } from '../../../../api';

export const useNotificacionesStore = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        isLoading,
        notifiacions,
        active,
        serverMessage,
        errorMessage,
        confirm,
        pagination,
    } = useSelector(state => state.notifiacion);

    const [errorAtributes, setErrorAtributes] = useState([]);

    const startLoadingNotificaciones = async (queryParams = {}) => {
        dispatch(onIsLoadingNotifiacion());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.usuario_id && { usuario_id: queryParams.usuario_id }),
                ...(queryParams.tipo && { tipo: queryParams.tipo }),
                ...(queryParams.leida !== undefined && { leida: queryParams.leida }),
                ...(queryParams.canal && { canal: queryParams.canal }),
                ...(queryParams.enviada !== undefined && { enviada: queryParams.enviada }),
                ...(queryParams.fecha_inicio && { fecha_inicio: queryParams.fecha_inicio }),
                ...(queryParams.fecha_fin && { fecha_fin: queryParams.fecha_fin }),
                ...(queryParams.search && { search: queryParams.search })
            });

            const { data } = await spaApi.get(`/notificacion?${params}`);
            dispatch(onLoadNotifiacion(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageNotifiacion(error.response?.data?.message || 'Error al cargar notificaciones'));
        }
    };

    const startLoadingNotificacionById = async (id) => {
        dispatch(onIsLoadingNotifiacion());
        try {
            const { data } = await spaApi(`/notificacion/${id}`);
            dispatch(onSetActiveNotifiacion(data.data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageNotifiacion(error.response?.data?.message || 'Error al cargar notificación'));
        }
    };

    const startLoadingNotificacionesNoLeidas = async (usuarioId) => {
        dispatch(onIsLoadingNotifiacion());
        try {
            const { data } = await spaApi.get(`/notificacion/usuario/${usuarioId}/no-leidas`);
            dispatch(onLoadNotifiacion(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageNotifiacion(error.response?.data?.message || 'Error al cargar notificaciones no leídas'));
        }
    };

    const startLoadingNotificacionesByUsuario = async (usuarioId, queryParams = {}) => {
        dispatch(onIsLoadingNotifiacion());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.tipo && { tipo: queryParams.tipo }),
                ...(queryParams.leida !== undefined && { leida: queryParams.leida }),
                ...(queryParams.canal && { canal: queryParams.canal }),
                ...(queryParams.fecha_inicio && { fecha_inicio: queryParams.fecha_inicio }),
                ...(queryParams.fecha_fin && { fecha_fin: queryParams.fecha_fin })
            });

            const { data } = await spaApi.get(`/notificacion?usuario_id=${usuarioId}&${params}`);
            dispatch(onLoadNotifiacion(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageNotifiacion(error.response?.data?.message || 'Error al cargar notificaciones del usuario'));
        }
    };

    const startSetActivateNotificacion = (notificacion) => {
        dispatch(onSetActiveNotifiacion(notificacion));
    };

    const startSavingNotificacion = async (notificacionData) => {
        dispatch(onIsLoadingNotifiacion());
        try {
            if (notificacionData.id) {
                // Actualiza la notificación
                const { data } = await spaApi.put(`/notificacion/${notificacionData.id}`, notificacionData);
                dispatch(onUpdateNotifiacion(data.data));
                navigate(-1);
                return;
            }
            // Crear nueva notificación
            const { data } = await spaApi.post('/notificacion', notificacionData);
            if (data.success) {
                dispatch(onAddNewNotifiacion(data.data));
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
                    dispatch(onSendErrorMessageNotifiacion(`${firstValue[0]}`));
                } else {
                    // Si es un mensaje de error directo
                    dispatch(onSendErrorMessageNotifiacion(errorData.message || 'Error de validación'));
                }
            }
        }
    };

    const startDeletingNotificacion = async (notificacion) => {
        dispatch(onIsLoadingNotifiacion());
        try {
            const { data } = await spaApi.delete(`/notificacion/${notificacion.id}`);
            dispatch(onConfirmDeleteNotifiacion(notificacion.id));
            dispatch(onSetActiveNotifiacion(null));
            dispatch(onSendServerErrorMessageNotifiacion(data.message));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageNotifiacion(error.response?.data?.message || 'Error al eliminar notificación'));
        }
    };

    const startMarcarComoLeida = async (notificacionId) => {
        dispatch(onIsLoadingNotifiacion());
        try {
            const { data } = await spaApi.patch(`/notificacion/${notificacionId}/leida`);
            dispatch(onUpdateNotifiacion(data.data));
            dispatch(onSendServerErrorMessageNotifiacion('Notificación marcada como leída'));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageNotifiacion(error.response?.data?.message || 'Error al marcar como leída'));
        }
    };

    const startMarcarTodasComoLeidas = async (usuarioId) => {
        dispatch(onIsLoadingNotifiacion());
        try {
            const { data } = await spaApi.patch(`/notificacion/usuario/${usuarioId}/marcar-todas-leidas`);
            // Actualizar todas las notificaciones del usuario como leídas
            dispatch(onLoadNotifiacion(data));
            dispatch(onSendServerErrorMessageNotifiacion('Todas las notificaciones marcadas como leídas'));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageNotifiacion(error.response?.data?.message || 'Error al marcar todas como leídas'));
        }
    };

    const startMarcarComoEnviada = async (notificacionId) => {
        dispatch(onIsLoadingNotifiacion());
        try {
            const { data } = await spaApi.patch(`/notificacion/${notificacionId}/enviada`);
            dispatch(onUpdateNotifiacion(data.data));
            dispatch(onSendServerErrorMessageNotifiacion('Notificación marcada como enviada'));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageNotifiacion(error.response?.data?.message || 'Error al marcar como enviada'));
        }
    };

    const startGetNotificacionesStats = async (usuarioId = null) => {
        dispatch(onIsLoadingNotifiacion());
        try {
            const endpoint = usuarioId 
                ? `/notificacion/stats?usuario_id=${usuarioId}` 
                : '/notificacion/stats';
            const { data } = await spaApi.get(endpoint);
            return data;
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageNotifiacion(error.response?.data?.message || 'Error al obtener estadísticas'));
        }
    };

    const startClearMessage = () => {
        dispatch(onClearMessageNotifiacion());
        setErrorAtributes([]);
    };

    const startConfirmDelete = () => {
        dispatch(onConfirmDeleteNotifiacion());
    };

    const startCloseNotificacion = () => {
        dispatch(onCloseModalNotifiacion());
        setErrorAtributes([]);
    };

    const startReactivateNotificacion = async (notificacionId) => {
        dispatch(onIsLoadingNotifiacion());
        try {
            const { data } = await spaApi.patch(`/notificacion/${notificacionId}/reactivar`);
            dispatch(onReactivateNotifiacion(notificacionId));
            dispatch(onSendServerErrorMessageNotifiacion('Notificación reactivada correctamente'));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageNotifiacion(error.response?.data?.message || 'Error al reactivar notificación'));
        }
    };

    return {
        // State
        isLoading,
        notifiacions,
        active,
        serverMessage,
        errorMessage,
        confirm,
        pagination,
        errorAtributes,
        
        // Actions
        startLoadingNotificaciones,
        startLoadingNotificacionById,
        startLoadingNotificacionesNoLeidas,
        startLoadingNotificacionesByUsuario,
        startSetActivateNotificacion,
        startSavingNotificacion,
        startDeletingNotificacion,
        startMarcarComoLeida,
        startMarcarTodasComoLeidas,
        startMarcarComoEnviada,
        startGetNotificacionesStats,
        startClearMessage,
        startConfirmDelete,
        startCloseNotificacion,
        startReactivateNotificacion,
    }
}