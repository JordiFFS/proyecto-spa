import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    onIsLoadingService,
    onLoadServices,
    onSetActiveService,
    onAddNewService,
    onUpdateService,
    onReactivateService,
    onSendErrorMessageService,
    onSendServerErrorMessageService,
    onClearMessageService,
    onConfirmDeleteService,
    onCloseModalService,
} from "../slices";
import { spaApi } from "../../../../api";

export const useServiceStore = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        isLoading,
        services,
        active,
        serverMessage,
        errorMessage,
        confirm,
        pagination,
    } = useSelector(state => state.service);
    const [errorAtributes, setErrorAtributes] = useState([]);

    const startLoadingService = async (queryParams = {}) => {
        dispatch(onIsLoadingService());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.activo !== undefined && { activo: queryParams.activo }),
                ...(queryParams.search && { search: queryParams.search })
            });

            const { data } = await spaApi.get(`/servicio?${params}`);
            dispatch(onLoadServices(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageService(error.response?.data?.message || 'Error al cargar servicios'));
        }
    };

    const startLoadingActiveServices = async (queryParams = {}) => {
        dispatch(onIsLoadingService());
        try {
            const params = new URLSearchParams({
                page: queryParams.page || 1,
                limit: queryParams.limit || 10,
                ...(queryParams.search && { search: queryParams.search })
            });

            const { data } = await spaApi.get(`/servicio/activos?${params}`);
            dispatch(onLoadServices(data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageService(error.response?.data?.message || 'Error al cargar servicios activos'));
        }
    };

    const startLoadingServiceById = async (id) => {
        dispatch(onIsLoadingService());
        try {
            const { data } = await spaApi(`/servicio/${id}`);
            dispatch(onSetActiveService(data.data));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageService(error.response?.data?.message || 'Error al cargar servicio'));
        }
    };

    const startLoadingServiceStats = async () => {
        dispatch(onIsLoadingService());
        try {
            const { data } = await spaApi.get('/servicio/estadisticas');
            return data;
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageService(error.response?.data?.message || 'Error al cargar estadísticas'));
        }
    };

    const startSetActivateService = (service) => {
        dispatch(onSetActiveService(service));
    };

    const startSavingService = async (serviceData) => {
        dispatch(onIsLoadingService());
        try {
            if (serviceData.id) {
                // Actualiza el registro
                const { data } = await spaApi.put(`/servicio/${serviceData.id}`, serviceData);
                dispatch(onUpdateService(data.data));
                navigate(-1);
                return;
            }
            // Crear nuevo registro
            const { data } = await spaApi.post('/servicio', serviceData);
            if (data.success) {
                dispatch(onAddNewService(data.data));
            }
        } catch (error) {
            if (error.response?.status === 400) {
                const errorData = error.response.data;
                if (typeof errorData === 'object' && !errorData.message) {
                    // Si son errores de validación por campo
                    const claves = Object.keys(errorData);
                    setErrorAtributes(errorData);
                    const firstValue = errorData[claves[0]];
                    dispatch(onSendErrorMessageService(`${firstValue[0]}`));
                } else {
                    // Si es un mensaje de error directo
                    dispatch(onSendErrorMessageService(errorData.message || 'Error de validación'));
                }
            }
        }
    };

    const startDeletingService = async (service) => {
        dispatch(onIsLoadingService());
        try {
            const { data } = await spaApi.delete(`/servicio/${service.id}`);
            dispatch(onUpdateService({ ...service, activo: false }));
            dispatch(onSetActiveService(null));
            dispatch(onSendServerErrorMessageService(data.message));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageService(error.response?.data?.message || 'Error al eliminar servicio'));
        }
    };

    const startReactivateService = async (serviceId) => {
        dispatch(onIsLoadingService());
        try {
            const { data } = await spaApi.put(`/servicio/${serviceId}/reactivate`);
            dispatch(onReactivateService(serviceId));
            dispatch(onSendServerErrorMessageService(data.message));
        } catch (error) {
            console.log(error);
            dispatch(onSendServerErrorMessageService(error.response?.data?.message || 'Error al reactivar servicio'));
        }
    };

    const startClearMessage = () => {
        dispatch(onClearMessageService());
        setErrorAtributes([]);
    };

    const startConfirmDelete = () => {
        dispatch(onConfirmDeleteService());
    };

    const startCloseService = () => {
        dispatch(onCloseModalService());
        setErrorAtributes([]);
    };

    return {
        // Atributos
        isLoading,
        services,
        active,
        errorAtributes,
        serverMessage,
        errorMessage,
        confirm,
        pagination,
        // Métodos
        startLoadingService,
        startLoadingActiveServices,
        startLoadingServiceById,
        startLoadingServiceStats,
        startSetActivateService,
        startSavingService,
        startDeletingService,
        startReactivateService,
        startClearMessage,
        startConfirmDelete,
        startCloseService,
    }
}