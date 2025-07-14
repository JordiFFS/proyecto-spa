import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { onAddNewAuditoria, onClearMessageAuditoria, onCloseModalAuditoria, onConfirmDeleteAuditoria, onIsLoadingAuditoria, onLoadAuditoria, onSendErrorMessageAuditoria, onSendServerErrorMessageAuditoria, onSetActiveAuditoria, onUpdateAuditoria } from '../slices';
import { spaApi } from '../../../../api';

export const useAuditoriaStore = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        isLoading,
        auditoriaData,
        active,
        serverMessage,
        errorMessage,
        confirm,
        pagination,
    } = useSelector(state => state.auditoria);

    const [errorAtributes, setErrorAtributes] = useState([]);

    const startLoadingAuditoria = async (queryParams = {}) => {
        dispatch(onIsLoadingAuditoria());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 25,
                ...(queryParams.usuario_id && { usuario_id: queryParams.usuario_id }),
                ...(queryParams.accion && { accion: queryParams.accion }),
                ...(queryParams.tabla_afectada && { tabla_afectada: queryParams.tabla_afectada }),
                ...(queryParams.resultado && { resultado: queryParams.resultado }),
                ...(queryParams.fecha_inicio && { fecha_inicio: queryParams.fecha_inicio }),
                ...(queryParams.fecha_fin && { fecha_fin: queryParams.fecha_fin }),
                ...(queryParams.search && { search: queryParams.search })
            });

            const { data } = await spaApi.get(`/auditoria?${params}`);
            dispatch(onLoadAuditoria(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageAuditoria(error.response?.data?.message || 'Error al cargar registros de auditoría'));
        }
    };

    const startLoadingAuditoriaById = async (id) => {
        dispatch(onIsLoadingAuditoria());
        try {
            const { data } = await spaApi(`/auditoria/${id}`);
            dispatch(onSetActiveAuditoria(data.data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageAuditoria(error.response?.data?.message || 'Error al cargar registro de auditoría'));
        }
    };

    const startLoadingAuditoriaStats = async () => {
        dispatch(onIsLoadingAuditoria());
        try {
            const { data } = await spaApi.get('/auditoria/estadisticas');
            return data;
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageAuditoria(error.response?.data?.message || 'Error al cargar estadísticas de auditoría'));
        }
    };

    const startLoadingAuditoriaByUsuario = async (usuarioId, queryParams = {}) => {
        dispatch(onIsLoadingAuditoria());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 25,
                ...(queryParams.accion && { accion: queryParams.accion }),
                ...(queryParams.tabla_afectada && { tabla_afectada: queryParams.tabla_afectada }),
                ...(queryParams.resultado && { resultado: queryParams.resultado }),
                ...(queryParams.fecha_inicio && { fecha_inicio: queryParams.fecha_inicio }),
                ...(queryParams.fecha_fin && { fecha_fin: queryParams.fecha_fin })
            });

            const { data } = await spaApi.get(`/auditoria/usuario/${usuarioId}?${params}`);
            dispatch(onLoadAuditoria(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageAuditoria(error.response?.data?.message || 'Error al cargar auditoría por usuario'));
        }
    };

    const startLoadingAuditoriaByTabla = async (tabla, queryParams = {}) => {
        dispatch(onIsLoadingAuditoria());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 25,
                ...(queryParams.accion && { accion: queryParams.accion }),
                ...(queryParams.usuario_id && { usuario_id: queryParams.usuario_id }),
                ...(queryParams.resultado && { resultado: queryParams.resultado }),
                ...(queryParams.fecha_inicio && { fecha_inicio: queryParams.fecha_inicio }),
                ...(queryParams.fecha_fin && { fecha_fin: queryParams.fecha_fin })
            });

            const { data } = await spaApi.get(`/auditoria/tabla/${tabla}?${params}`);
            dispatch(onLoadAuditoria(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageAuditoria(error.response?.data?.message || 'Error al cargar auditoría por tabla'));
        }
    };

    const startSetActivateAuditoria = (auditoria) => {
        dispatch(onSetActiveAuditoria(auditoria));
    };

    const startSavingAuditoria = async (auditoriaData) => {
        dispatch(onIsLoadingAuditoria());
        try {
            if (auditoriaData.id) {
                // Actualiza el registro
                const { data } = await spaApi.put(`/auditoria/${auditoriaData.id}`, auditoriaData);
                dispatch(onUpdateAuditoria(data.data));
                navigate(-1);
                return;
            }
            // Crear nuevo registro
            const { data } = await spaApi.post('/auditoria', auditoriaData);
            if (data.success) {
                dispatch(onAddNewAuditoria(data.data));
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
                    dispatch(onSendErrorMessageAuditoria(`${firstValue[0]}`));
                } else {
                    // Si es un mensaje de error directo
                    dispatch(onSendErrorMessageAuditoria(errorData.message || 'Error de validación'));
                }
            }
        }
    };

    const startDeletingAuditoria = async (auditoria) => {
        dispatch(onIsLoadingAuditoria());
        try {
            const { data } = await spaApi.delete(`/auditoria/${auditoria.id}`);
            dispatch(onConfirmDeleteAuditoria(auditoria.id));
            dispatch(onSetActiveAuditoria(null));
            dispatch(onSendServerErrorMessageAuditoria(data.message));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageAuditoria(error.response?.data?.message || 'Error al eliminar registro de auditoría'));
        }
    };

    const startExportAuditoria = async (queryParams = {}) => {
        dispatch(onIsLoadingAuditoria());
        try {
            const params = new URLSearchParams({
                ...(queryParams.usuario_id && { usuario_id: queryParams.usuario_id }),
                ...(queryParams.accion && { accion: queryParams.accion }),
                ...(queryParams.tabla_afectada && { tabla_afectada: queryParams.tabla_afectada }),
                ...(queryParams.resultado && { resultado: queryParams.resultado }),
                ...(queryParams.fecha_inicio && { fecha_inicio: queryParams.fecha_inicio }),
                ...(queryParams.fecha_fin && { fecha_fin: queryParams.fecha_fin }),
                format: queryParams.format || 'excel'
            });

            const response = await spaApi.get(`/auditoria/export?${params}`, {
                responseType: 'blob'
            });

            // Crear enlace de descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `auditoria_${new Date().toISOString().split('T')[0]}.${queryParams.format === 'pdf' ? 'pdf' : 'xlsx'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageAuditoria(error.response?.data?.message || 'Error al exportar auditoría'));
        }
    };

    const startClearMessage = () => {
        dispatch(onClearMessageAuditoria());
        setErrorAtributes([]);
    };

    const startConfirmDelete = () => {
        dispatch(onConfirmDeleteAuditoria());
    };

    const startCloseAuditoria = () => {
        dispatch(onCloseModalAuditoria());
        setErrorAtributes([]);
    };

    return {
        isLoading,
        auditoriaData,
        active,
        serverMessage,
        errorMessage,
        confirm,
        pagination,
        startLoadingAuditoria,
        startLoadingAuditoriaById,
        startLoadingAuditoriaStats,
        startLoadingAuditoriaByUsuario,
        startLoadingAuditoriaByTabla,
        startSetActivateAuditoria,
        startSavingAuditoria,
        startDeletingAuditoria,
        startExportAuditoria,
        startClearMessage,
        startConfirmDelete,
        startCloseAuditoria,
    }
}
