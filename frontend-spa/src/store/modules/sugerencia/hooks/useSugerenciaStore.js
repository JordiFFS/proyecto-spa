import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { spaApi } from '../../../../api';
import { onAddNewSugerencia, onClearMessageSugerencia, onCloseModalSugerencia, onConfirmDeleteSugerencia, onIsLoadingSugerencia, onLoadSugerencia, onReactivateSugerencia, onSendErrorMessageSugerencia, onSendServerErrorMessageSugerencia, onSetActiveSugerencia, onUpdateSugerencia } from '../slice';

export const useSugerenciaStore = () => {

    const dispatch = useDispatch();

    const {
        isLoading,
        sugerencias,
        active,
        serverMessage,
        errorMessage,
        confirm,
        pagination,
    } = useSelector(state => state.sugerencia);

    const [errorAtributes, setErrorAtributes] = useState([]);

    const startLoadingSugerencias = async (queryParams = {}) => {
        dispatch(onIsLoadingSugerencia());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.usuario_id && { usuario_id: queryParams.usuario_id }),
                ...(queryParams.tipo && { tipo: queryParams.tipo }),
                ...(queryParams.categoria && { categoria: queryParams.categoria }),
                ...(queryParams.prioridad && { prioridad: queryParams.prioridad }),
                ...(queryParams.estado && { estado: queryParams.estado }),
                ...(queryParams.respondido_por && { respondido_por: queryParams.respondido_por }),
                ...(queryParams.fecha_inicio && { fecha_inicio: queryParams.fecha_inicio }),
                ...(queryParams.fecha_fin && { fecha_fin: queryParams.fecha_fin }),
                ...(queryParams.search && { search: queryParams.search })
            });

            const { data } = await spaApi.get(`/sugerencia?${params}`);
            dispatch(onLoadSugerencia(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageSugerencia(error.response?.data?.message || 'Error al cargar sugerencias'));
        }
    };

    const startLoadingSugerenciaById = async (id) => {
        dispatch(onIsLoadingSugerencia());
        try {
            const { data } = await spaApi(`/sugerencia/${id}`);
            dispatch(onSetActiveSugerencia(data.data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageSugerencia(error.response?.data?.message || 'Error al cargar sugerencia'));
        }
    };

    const startLoadingSugerenciasByUsuario = async (usuarioId, queryParams = {}) => {
        dispatch(onIsLoadingSugerencia());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.tipo && { tipo: queryParams.tipo }),
                ...(queryParams.categoria && { categoria: queryParams.categoria }),
                ...(queryParams.prioridad && { prioridad: queryParams.prioridad }),
                ...(queryParams.estado && { estado: queryParams.estado }),
                ...(queryParams.fecha_inicio && { fecha_inicio: queryParams.fecha_inicio }),
                ...(queryParams.fecha_fin && { fecha_fin: queryParams.fecha_fin })
            });

            const { data } = await spaApi.get(`/sugerencia?usuario_id=${usuarioId}&${params}`);
            dispatch(onLoadSugerencia(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageSugerencia(error.response?.data?.message || 'Error al cargar sugerencias del usuario'));
        }
    };

    const startLoadingSugerenciasByTipo = async (tipo, queryParams = {}) => {
        dispatch(onIsLoadingSugerencia());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.usuario_id && { usuario_id: queryParams.usuario_id }),
                ...(queryParams.categoria && { categoria: queryParams.categoria }),
                ...(queryParams.prioridad && { prioridad: queryParams.prioridad }),
                ...(queryParams.estado && { estado: queryParams.estado }),
                ...(queryParams.fecha_inicio && { fecha_inicio: queryParams.fecha_inicio }),
                ...(queryParams.fecha_fin && { fecha_fin: queryParams.fecha_fin })
            });

            const { data } = await spaApi.get(`/sugerencia?tipo=${tipo}&${params}`);
            dispatch(onLoadSugerencia(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageSugerencia(error.response?.data?.message || 'Error al cargar sugerencias por tipo'));
        }
    };

    const startLoadingSugerenciasByEstado = async (estado, queryParams = {}) => {
        dispatch(onIsLoadingSugerencia());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.usuario_id && { usuario_id: queryParams.usuario_id }),
                ...(queryParams.tipo && { tipo: queryParams.tipo }),
                ...(queryParams.categoria && { categoria: queryParams.categoria }),
                ...(queryParams.prioridad && { prioridad: queryParams.prioridad }),
                ...(queryParams.fecha_inicio && { fecha_inicio: queryParams.fecha_inicio }),
                ...(queryParams.fecha_fin && { fecha_fin: queryParams.fecha_fin })
            });

            const { data } = await spaApi.get(`/sugerencia?estado=${estado}&${params}`);
            dispatch(onLoadSugerencia(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageSugerencia(error.response?.data?.message || 'Error al cargar sugerencias por estado'));
        }
    };

    const startLoadingSugerenciasByPrioridad = async (prioridad, queryParams = {}) => {
        dispatch(onIsLoadingSugerencia());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.usuario_id && { usuario_id: queryParams.usuario_id }),
                ...(queryParams.tipo && { tipo: queryParams.tipo }),
                ...(queryParams.categoria && { categoria: queryParams.categoria }),
                ...(queryParams.estado && { estado: queryParams.estado }),
                ...(queryParams.fecha_inicio && { fecha_inicio: queryParams.fecha_inicio }),
                ...(queryParams.fecha_fin && { fecha_fin: queryParams.fecha_fin })
            });

            const { data } = await spaApi.get(`/sugerencia?prioridad=${prioridad}&${params}`);
            dispatch(onLoadSugerencia(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageSugerencia(error.response?.data?.message || 'Error al cargar sugerencias por prioridad'));
        }
    };

    const startSetActivateSugerencia = (sugerencia) => {
        dispatch(onSetActiveSugerencia(sugerencia));
    };

    const startSavingSugerencia = async (sugerenciaData) => {
        dispatch(onIsLoadingSugerencia());
        try {
            if (sugerenciaData.id) {
                // Actualiza la sugerencia
                const { data } = await spaApi.put(`/sugerencia/${sugerenciaData.id}`, sugerenciaData);
                dispatch(onUpdateSugerencia(data.data));
                // navigate(-1);
                return;
            }
            // Crear nueva sugerencia
            const { data } = await spaApi.post('/sugerencia', sugerenciaData);
            if (data.success) {
                dispatch(onAddNewSugerencia(data.data));
                // navigate(-1);
            }
        } catch (error) {
            if (error.response?.status === 400) {
                const errorData = error.response.data;
                if (typeof errorData === 'object' && !errorData.message) {
                    // Si son errores de validación por campo
                    const claves = Object.keys(errorData);
                    setErrorAtributes(errorData);
                    const firstValue = errorData[claves[0]];
                    dispatch(onSendErrorMessageSugerencia(`${firstValue[0]}`));
                } else {
                    // Si es un mensaje de error directo
                    dispatch(onSendErrorMessageSugerencia(errorData.message || 'Error de validación'));
                }
            }
        }
    };

    const startDeletingSugerencia = async (sugerencia) => {
        dispatch(onIsLoadingSugerencia());
        try {
            const { data } = await spaApi.delete(`/sugerencia/${sugerencia.id}`);
            dispatch(onConfirmDeleteSugerencia(sugerencia.id));
            dispatch(onSetActiveSugerencia(null));
            dispatch(onSendServerErrorMessageSugerencia(data.message));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageSugerencia(error.response?.data?.message || 'Error al eliminar sugerencia'));
        }
    };

    const startCambiarEstadoSugerencia = async (sugerenciaId, nuevoEstado) => {
        dispatch(onIsLoadingSugerencia());
        try {
            const { data } = await spaApi.patch(`/sugerencia/${sugerenciaId}/estado`, { estado: nuevoEstado });
            dispatch(onUpdateSugerencia(data.data));
            dispatch(onSendServerErrorMessageSugerencia(`Estado cambiado a ${nuevoEstado}`));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageSugerencia(error.response?.data?.message || 'Error al cambiar estado'));
        }
    };

    const startResponderSugerencia = async (sugerenciaId, respuestaData) => {
        dispatch(onIsLoadingSugerencia());
        try {
            const { data } = await spaApi.patch(`/sugerencia/${sugerenciaId}/respuesta`, respuestaData);
            dispatch(onUpdateSugerencia(data.data));
            dispatch(onSendServerErrorMessageSugerencia('Respuesta enviada correctamente'));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageSugerencia(error.response?.data?.message || 'Error al enviar respuesta'));
        }
    };

    const startCambiarPrioridadSugerencia = async (sugerenciaId, nuevaPrioridad) => {
        dispatch(onIsLoadingSugerencia());
        try {
            const { data } = await spaApi.patch(`/sugerencia/${sugerenciaId}/prioridad`, { prioridad: nuevaPrioridad });
            dispatch(onUpdateSugerencia(data.data));
            dispatch(onSendServerErrorMessageSugerencia(`Prioridad cambiada a ${nuevaPrioridad}`));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageSugerencia(error.response?.data?.message || 'Error al cambiar prioridad'));
        }
    };

    const startGetSugerenciasStats = async (queryParams = {}) => {
        dispatch(onIsLoadingSugerencia());
        try {
            const params = new URLSearchParams({
                ...(queryParams.usuario_id && { usuario_id: queryParams.usuario_id }),
                ...(queryParams.fecha_inicio && { fecha_inicio: queryParams.fecha_inicio }),
                ...(queryParams.fecha_fin && { fecha_fin: queryParams.fecha_fin })
            });

            const endpoint = `/sugerencia/stats${params.toString() ? `?${params}` : ''}`;
            const { data } = await spaApi.get(endpoint);
            return data;
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageSugerencia(error.response?.data?.message || 'Error al obtener estadísticas'));
        }
    };

    const startClearMessage = () => {
        dispatch(onClearMessageSugerencia());
        setErrorAtributes([]);
    };

    const startConfirmDelete = () => {
        dispatch(onConfirmDeleteSugerencia());
    };

    const startCloseSugerencia = () => {
        dispatch(onCloseModalSugerencia());
        setErrorAtributes([]);
    };

    const startReactivateSugerencia = async (sugerenciaId) => {
        dispatch(onIsLoadingSugerencia());
        try {
            await spaApi.patch(`/sugerencia/${sugerenciaId}/reactivar`);
            dispatch(onReactivateSugerencia(sugerenciaId));
            dispatch(onSendServerErrorMessageSugerencia('Sugerencia reactivada correctamente'));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageSugerencia(error.response?.data?.message || 'Error al reactivar sugerencia'));
        }
    };

    return {
        // State
        isLoading,
        sugerencias,
        active,
        serverMessage,
        errorMessage,
        confirm,
        pagination,
        errorAtributes,

        // Actions
        startLoadingSugerencias,
        startLoadingSugerenciaById,
        startLoadingSugerenciasByUsuario,
        startLoadingSugerenciasByTipo,
        startLoadingSugerenciasByEstado,
        startLoadingSugerenciasByPrioridad,
        startSetActivateSugerencia,
        startSavingSugerencia,
        startDeletingSugerencia,
        startCambiarEstadoSugerencia,
        startResponderSugerencia,
        startCambiarPrioridadSugerencia,
        startGetSugerenciasStats,
        startClearMessage,
        startConfirmDelete,
        startCloseSugerencia,
        startReactivateSugerencia,
    }
}