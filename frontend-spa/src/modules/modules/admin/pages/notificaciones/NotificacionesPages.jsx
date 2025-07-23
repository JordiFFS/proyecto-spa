import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    CircularProgress,
    FormHelperText,
    Alert,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    Menu,
    ListItemIcon,
    ListItemText,
    Divider,
    Badge,
    Fab,
    Snackbar,
    Switch,
    FormControlLabel,
    Checkbox,
    List,
    ListItem,
    Collapse
} from '@mui/material';
import {
    Notifications,
    Edit,
    Delete,
    Add,
    FilterList,
    Search,
    MoreVert,
    Send,
    MarkEmailRead,
    Cancel,
    Refresh,
    Email,
    Sms,
    Web,
    Person,
    CheckCircle,
    Schedule,
    Warning,
    Info,
    ExpandLess, ExpandMore, Email as EmailIcon
} from '@mui/icons-material';
import { useNotificacionesStore } from '../../../../../store/modules/notificacion/hooks';
import { useGetComboxBox } from '../../../../components';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useAuthStore } from '../../../../../hooks';

import { useMQTTNotifications } from '../../../../../hooks';
import { useNavigate } from 'react-router-dom';

export const NotificacionesPages = () => {


    const [showEmailOptions, setShowEmailOptions] = useState(false);
    const [showUsuariosList, setShowUsuariosList] = useState(false);

    const navigate = useNavigate();

    const {
        isLoading,
        notifiacions,
        pagination,
        serverMessage,
        estadisticas,
        errorMessage,
        startLoadingNotificaciones,
        startSavingNotificacion,
        startSavingNotificacionWithEmail,
        startEnvioMasivoNotificaciones,
        startDeletingNotificacion,
        startMarcarComoLeida,
        startMarcarComoEnviada,
        startGetNotificacionesStats,
        startClearMessage
    } = useNotificacionesStore();

    useMQTTNotifications();

    const {
        user
    } = useAuthStore();

    const {
        user_cbx,
        startGetUserCbx
    } = useGetComboxBox();

    // Estados locales
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filtros, setFiltros] = useState({
        search: '',
        tipo: '',
        leida: '',
        canal: '',
        enviada: '',
        fecha_inicio: '',
        fecha_fin: ''
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [notificacionToDelete, setNotificacionToDelete] = useState(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [selectedNotificacion, setSelectedNotificacion] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Estados para el envío por correo
    const [enviarPorEmail, setEnviarPorEmail] = useState(false);
    const [envioMasivo, setEnvioMasivo] = useState(false);
    const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);

    // Formulario para crear/editar notificación
    const formik = useFormik({
        initialValues: {
            titulo: '',
            mensaje: '',
            tipo: 'reserva', // Cambiar de 'info' a 'reserva'
            canal: 'app',
            usuario_id: '',
            fecha_programada: '',
            activa: true
        },
        validationSchema: Yup.object({
            titulo: Yup.string()
                .required('El título es requerido')
                .min(3, 'El título debe tener al menos 3 caracteres')
                .max(100, 'El título no puede exceder 100 caracteres'),
            mensaje: Yup.string()
                .required('El mensaje es requerido')
                .min(10, 'El mensaje debe tener al menos 10 caracteres')
                .max(500, 'El mensaje no puede exceder 500 caracteres'),
            tipo: Yup.string()
                .required('El tipo es requerido')
                .oneOf(['reserva', 'recordatorio', 'promocion', 'sistema', 'empleado'], 'Tipo inválido'),
            canal: Yup.string()
                .required('El canal es requerido')
                .oneOf(['app', 'email', 'sms', 'push'], 'Canal inválido'),
            usuario_id: Yup.string().when(['envioMasivo'], {
                is: (envioMasivo) => !envioMasivo,
                then: () => Yup.string().required('El usuario es requerido'),
                otherwise: () => Yup.string()
            }),
            fecha_programada: Yup.string().nullable()
        }),
        onSubmit: async (values) => {
            try {
                if (envioMasivo && usuariosSeleccionados.length > 0) {
                    // Envío masivo
                    const destinatarios = usuariosSeleccionados.map(userId => {
                        const usuario = user_cbx.find(u => u.value === userId);
                        return {
                            usuario_id: userId,
                            email: usuario?.email || ''
                        };
                    });

                    await startEnvioMasivoNotificaciones(values, destinatarios);
                    navigate('/notificaciones');
                } else if (enviarPorEmail) {
                    // Envío individual con email
                    const usuario = user_cbx.find(u => u.value === values.usuario_id);
                    const emailDestinatario = usuario?.email || user?.email;

                    await startSavingNotificacionWithEmail(values, true, emailDestinatario);
                    console.log('emailDestinatario', emailDestinatario);
                } else {
                    // Envío normal sin email
                    await startSavingNotificacion(values);
                }

                handleCloseModal();
                cargarNotificaciones();
                cargarEstadisticas();
            } catch (error) {
                console.error('Error al enviar notificación:', error);
            }
        }
    });

    useEffect(() => {
        if (user?.rol === 'admin' || user?.rol === 'empleado' || user?.rol === 'cliente') {
            cargarNotificaciones();
            if (user?.rol === 'admin') {
                startGetNotificacionesStats();
            }
        }
    }, [page, rowsPerPage, user?.rol]);

    useEffect(() => {
        if (user?.rol === 'admin' || user?.rol === 'empleado') {
            cargarNotificaciones();
        }
    }, [filtros]);

    useEffect(() => {
        if (user?.rol === 'cliente') {
            // Para clientes, solo aplicar filtros que no oculten notificaciones importantes
            const filtrosCliente = {
                page: page + 1,
                limit: rowsPerPage,
                usuario_id: user.id,
                // Solo aplicar filtros de búsqueda, tipo y canal
                ...(filtros.search && { search: filtros.search }),
                ...(filtros.tipo && { tipo: filtros.tipo }),
                ...(filtros.canal && { canal: filtros.canal }),
                // Para "leida", solo filtrar si quiere ver "no leídas", nunca ocultar las leídas
                ...(filtros.leida === 'false' && { leida: 'false' })
            };
            startLoadingNotificaciones(filtrosCliente);
        }
    }, [filtros, page, rowsPerPage, user]);

    useEffect(() => {
        if (serverMessage || errorMessage) {
            setTimeout(() => {
                startClearMessage();
            }, 3000);
        }
    }, [serverMessage, errorMessage]);

    const cargarNotificaciones = async () => {
        const params = {
            page: page + 1,
            limit: rowsPerPage,
            ...filtros
        };

        // Filtrar por rol del usuario
        if (user?.rol === 'cliente') {
            params.usuario_id = user.id; // Solo sus propias notificaciones
            // IMPORTANTE: Para clientes, NO aplicar filtros que oculten notificaciones
            // El cliente debe poder ver TODAS sus notificaciones (leídas y no leídas)
            delete params.leida; // Remover filtro de leída para clientes
            delete params.enviada; // Remover filtro de enviada para clientes
        } else if (user?.rol === 'empleado') {
            params.tipos_permitidos = ['reserva', 'recordatorio', 'sistema']; // Solo ciertos tipos
        }
        // Admin puede ver todas las notificaciones

        await startLoadingNotificaciones(params);
    };

    const tienePermiso = (accion) => {
        if (!user?.rol) return false;

        switch (accion) {
            case 'crear':
            case 'editar':
            case 'eliminar':
                return user.rol === 'admin'; // Solo admin puede crear/editar/eliminar
            case 'marcar_leida':
                return true; // Todos pueden marcar como leída
            case 'marcar_enviada':
                return user.rol === 'admin' || user.rol === 'empleado'; // Admin y empleado
            case 'ver_estadisticas':
                return user.rol === 'admin'; // Solo admin ve estadísticas
            case 'enviar_email':
                return user.rol === 'admin' || user.rol === 'empleado'; // Admin y empleado pueden enviar emails
            default:
                return false;
        }
    };

    const cargarEstadisticas = async () => {
        await startGetNotificacionesStats();
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (field, value) => {
        setFiltros(prev => ({
            ...prev,
            [field]: value
        }));
        setPage(0);
    };

    const handleOpenModal = (notificacion = null) => {
        if (notificacion) {
            formik.setValues({
                _id: notificacion._id,
                titulo: notificacion.titulo,
                mensaje: notificacion.mensaje,
                tipo: notificacion.tipo,
                canal: notificacion.canal,
                usuario_id: notificacion.usuario_id || '',
                fecha_programada: notificacion.fecha_programada || '',
                activa: notificacion.activa
            });
        } else {
            formik.resetForm();
        }

        // Resetear TODOS los estados de envío
        setEnviarPorEmail(false);
        setEnvioMasivo(false);
        setUsuariosSeleccionados([]);
        setShowEmailOptions(false);
        setShowUsuariosList(false);

        setModalOpen(true);
    };

    const handleEnviarPorEmailChange = (checked) => {
        setEnviarPorEmail(checked);
        if (!checked) {
            setEnvioMasivo(false);
            setUsuariosSeleccionados([]);
            setShowUsuariosList(false);
        }
        setShowEmailOptions(checked);
    };

    const handleEnvioMasivoChange = (checked) => {
        setEnvioMasivo(checked);
        if (checked) {
            // Si activa envío masivo, limpiar usuario individual
            formik.setFieldValue('usuario_id', '');
            setShowUsuariosList(true);
        } else {
            setUsuariosSeleccionados([]);
            setShowUsuariosList(false);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        formik.resetForm();
        setEnviarPorEmail(false);
        setEnvioMasivo(false);
        setUsuariosSeleccionados([]);
    };

    const handleSaveNotificacion = async () => {
        await formik.submitForm();
    };

    const handleDeleteConfirm = (notificacion) => {
        setNotificacionToDelete(notificacion);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteNotificacion = async () => {
        if (notificacionToDelete) {
            await startDeletingNotificacion(notificacionToDelete);
            setDeleteConfirmOpen(false);
            setNotificacionToDelete(null);
            cargarNotificaciones();
            cargarEstadisticas();
        }
    };

    const handleMenuClick = (event, notificacion) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedNotificacion(notificacion);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setSelectedNotificacion(null);
    };

    const handleMarcarComoLeida = async (notificacionId) => {
        await startMarcarComoLeida(notificacionId);

        // Solo recargar si NO es cliente, o si es cliente pero quiere ver el cambio inmediato
        // Para clientes, mejor actualizar el estado local
        if (user?.rol !== 'cliente') {
            cargarNotificaciones();
        } else {
            // Para clientes, actualizar el estado local sin recargar
            // La notificación ya se actualizó en el store por startMarcarComoLeida
        }

        handleMenuClose();
    };

    const handleMarcarComoEnviada = async (notificacionId) => {
        await startMarcarComoEnviada(notificacionId);
        cargarNotificaciones();
        handleMenuClose();
    };

    const handleUsuarioSeleccionChange = (userId, checked) => {
        setUsuariosSeleccionados(prev => {
            if (checked) {
                return [...prev, userId];
            } else {
                return prev.filter(id => id !== userId);
            }
        });
    };

    const handleSelectAllUsuarios = (checked) => {
        if (checked) {
            setUsuariosSeleccionados(user_cbx.map(usuario => usuario.value));
        } else {
            setUsuariosSeleccionados([]);
        }
    };

    const getTipoColor = (tipo) => {
        switch (tipo) {
            case 'reserva': return 'info';
            case 'recordatorio': return 'success';
            case 'promocion': return 'warning';
            case 'sistema': return 'error';
            case 'empleado': return 'default';
            default: return 'default';
        }
    };

    const getTipoIcon = (tipo) => {
        switch (tipo) {
            case 'reserva': return <Info />;
            case 'recordatorio': return <CheckCircle />;
            case 'promocion': return <Warning />;
            case 'sistema': return <Cancel />;
            case 'empleado': return <Cancel />;
            default: return <Notifications />;
        }
    };

    const getCanalIcon = (canal) => {
        switch (canal) {
            case 'email': return <Email />;
            case 'sms': return <Sms />;
            case 'push': return <Web />;
            case 'app': return <Web />;
            default: return <Notifications />;
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        startGetUserCbx();
    }, []);

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            {/* Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Badge
                            badgeContent={estadisticas?.pendientes || 0}
                            color="error"
                            max={99}
                        >
                            <Notifications sx={{ fontSize: 40, color: 'primary.main' }} />
                        </Badge>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" color="primary">
                                {user?.rol === 'cliente' ? 'Mis Notificaciones' :
                                    user?.rol === 'empleado' ? 'Notificaciones del Sistema' :
                                        'Gestión de Notificaciones'}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {user?.rol === 'cliente' ? 'Revisa tus notificaciones personales' :
                                    user?.rol === 'empleado' ? 'Notificaciones del sistema y reservas' :
                                        'Administra todas las notificaciones del sistema'}
                            </Typography>
                        </Box>
                    </Box>
                    <Box display="flex" gap={2}>
                        <Button
                            variant="outlined"
                            startIcon={<FilterList />}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            Filtros
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={() => {
                                cargarNotificaciones();
                                if (tienePermiso('ver_estadisticas')) {
                                    cargarEstadisticas();
                                }
                            }}
                        >
                            Actualizar
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Estadísticas rápidas */}
            {tienePermiso('ver_estadisticas') && estadisticas && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary" fontWeight="bold">
                                    {estadisticas.total}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Notificaciones
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="warning.main" fontWeight="bold">
                                    {estadisticas.no_leidas}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    No Leídas
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="success.main" fontWeight="bold">
                                    {estadisticas.enviadas}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Enviadas
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="info.main" fontWeight="bold">
                                    {estadisticas.pendientes}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Pendientes
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Filtros */}
            {showFilters && (
                <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Filtros</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Buscar"
                                placeholder="Título o mensaje..."
                                value={filtros.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                InputProps={{
                                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />
                        </Grid>
                        {user?.rol === 'admin' && (
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Tipo</InputLabel>
                                    <Select
                                        value={filtros.tipo}
                                        label="Tipo"
                                        onChange={(e) => handleFilterChange('tipo', e.target.value)}
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        <MenuItem value="reserva">Reserva</MenuItem>
                                        <MenuItem value="recordatorio">Recordatorio</MenuItem>
                                        <MenuItem value="promocion">Promoción</MenuItem>
                                        <MenuItem value="sistema">Sistema</MenuItem>
                                        <MenuItem value="empleado">Empleado</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Canal</InputLabel>
                                <Select
                                    value={filtros.canal}
                                    label="Canal"
                                    onChange={(e) => handleFilterChange('canal', e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="app">App</MenuItem>
                                    <MenuItem value="email">Email</MenuItem>
                                    <MenuItem value="sms">SMS</MenuItem>
                                    <MenuItem value="push">Web</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    value={filtros.leida}
                                    label="Estado"
                                    onChange={(e) => {
                                        // Para clientes, no aplicar filtro que oculte notificaciones
                                        if (user?.rol === 'cliente') {
                                            // Solo permitir ver "todas" o filtrar por "no leídas" 
                                            // pero nunca ocultar las leídas completamente
                                            if (e.target.value === 'false') {
                                                handleFilterChange('leida', e.target.value);
                                            } else {
                                                handleFilterChange('leida', ''); // Mostrar todas
                                            }
                                        } else {
                                            handleFilterChange('leida', e.target.value);
                                        }
                                    }}
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    <MenuItem value="false">No Leídas</MenuItem>
                                    {user?.rol !== 'cliente' && (
                                        <MenuItem value="true">Solo Leídas</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Solo admin y empleado pueden filtrar por enviadas */}
                        {(user?.rol === 'admin' || user?.rol === 'empleado') && (
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Enviadas</InputLabel>
                                    <Select
                                        value={filtros.enviada}
                                        label="Enviadas"
                                        onChange={(e) => handleFilterChange('enviada', e.target.value)}
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        <MenuItem value="true">Enviadas</MenuItem>
                                        <MenuItem value="false">Pendientes</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                </Paper>
            )}

            {/* Tabla de notificaciones */}
            <Paper elevation={2} sx={{ borderRadius: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Título</TableCell>
                                <TableCell>Canal</TableCell>
                                <TableCell>Usuario</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : notifiacions?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            {user?.rol === 'cliente' ? 'No tienes notificaciones disponibles' :
                                                'No hay notificaciones disponibles'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                notifiacions?.map((notificacion) => (
                                    <TableRow key={notificacion._id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {getTipoIcon(notificacion.tipo)}
                                                <Chip
                                                    label={notificacion.tipo}
                                                    color={getTipoColor(notificacion.tipo)}
                                                    size="small"
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {notificacion.titulo}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {notificacion.mensaje}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {getCanalIcon(notificacion.canal)}
                                                <Typography variant="body2">
                                                    {notificacion.canal}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {notificacion.usuario_id ? (
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Person fontSize="small" />
                                                    <Typography variant="body2">
                                                        {notificacion.usuario_id}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Todos
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" flexDirection="column" gap={0.5}>
                                                <Chip
                                                    label={notificacion.leida ? 'Leída' : 'No leída'}
                                                    color={notificacion.leida ? 'success' : 'warning'}
                                                    size="small"
                                                />
                                                <Chip
                                                    label={notificacion.enviada ? 'Enviada' : 'Pendiente'}
                                                    color={notificacion.enviada ? 'info' : 'default'}
                                                    size="small"
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatFecha(notificacion.fecha_creacion)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                onClick={(e) => handleMenuClick(e, notificacion)}
                                                size="small"
                                            >
                                                <MoreVert />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {pagination && (
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={pagination.total || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página:"
                        labelDisplayedRows={({ from, to, count }) =>
                            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                        }
                    />
                )}
            </Paper>

            {/* FAB para crear nueva notificación */}
            {tienePermiso('crear') && (
                <Fab
                    color="primary"
                    aria-label="add"
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                    }}
                    onClick={() => handleOpenModal()}
                >
                    <Add />
                </Fab>
            )}

            {/* Menu contextual */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
            >
                {/* Editar */}
                {tienePermiso('editar') && (
                    <MenuItem onClick={() => handleOpenModal(selectedNotificacion)}>
                        <ListItemIcon>
                            <Edit fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Editar</ListItemText>
                    </MenuItem>
                )}

                {/* Marcar como leída */}
                {selectedNotificacion && !selectedNotificacion.leida && (
                    <MenuItem onClick={() => handleMarcarComoLeida(selectedNotificacion._id)}>
                        <ListItemIcon>
                            <MarkEmailRead fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Marcar como leída</ListItemText>
                    </MenuItem>
                )}

                {/* Marcar como enviada */}
                {selectedNotificacion && !selectedNotificacion.enviada && tienePermiso('marcar_enviada') && (
                    <MenuItem onClick={() => handleMarcarComoEnviada(selectedNotificacion._id)}>
                        <ListItemIcon>
                            <Send fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Marcar como enviada</ListItemText>
                    </MenuItem>
                )}

                {/* Divider y Eliminar */}
                {tienePermiso('eliminar') && (
                    <>
                        <Divider />
                        <MenuItem
                            onClick={() => handleDeleteConfirm(selectedNotificacion)}
                            sx={{ color: 'error.main' }}
                        >
                            <ListItemIcon>
                                <Delete fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText>Eliminar</ListItemText>
                        </MenuItem>
                    </>
                )}
            </Menu>

            {/* Modal para crear/editar notificación */}
            <Dialog
                open={modalOpen}
                onClose={handleCloseModal}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {notifiacions._id ? 'Editar Notificación' : 'Nueva Notificación'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Título"
                                name="titulo"
                                value={formik.values.titulo}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.titulo && Boolean(formik.errors.titulo)}
                                helperText={formik.touched.titulo && formik.errors.titulo}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Mensaje"
                                name="mensaje"
                                multiline
                                rows={4}
                                value={formik.values.mensaje}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.mensaje && Boolean(formik.errors.mensaje)}
                                helperText={formik.touched.mensaje && formik.errors.mensaje}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={formik.touched.tipo && Boolean(formik.errors.tipo)}>
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    name="tipo"
                                    value={formik.values.tipo}
                                    label="Tipo"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    <MenuItem value="reserva">Reserva</MenuItem>
                                    <MenuItem value="recordatorio">Recordatorio</MenuItem>
                                    <MenuItem value="promocion">Promoción</MenuItem>
                                    <MenuItem value="sistema">Sistema</MenuItem>
                                    <MenuItem value="empleado">Empleado</MenuItem>
                                </Select>
                                {formik.touched.tipo && formik.errors.tipo && (
                                    <FormHelperText>{formik.errors.tipo}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={formik.touched.canal && Boolean(formik.errors.canal)}>
                                <InputLabel>Canal</InputLabel>
                                <Select
                                    name="canal"
                                    value={formik.values.canal}
                                    label="Canal"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    <MenuItem value="app">App</MenuItem>
                                    <MenuItem value="email">Email</MenuItem>
                                    <MenuItem value="sms">SMS</MenuItem>
                                    <MenuItem value="push">Push</MenuItem>
                                </Select>
                                {formik.touched.canal && formik.errors.canal && (
                                    <FormHelperText>{formik.errors.canal}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>

                        {/* NUEVA SECCIÓN: Opciones de Email */}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={enviarPorEmail}
                                        onChange={(e) => handleEnviarPorEmailChange(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <EmailIcon />
                                        <Typography>Enviar por Email</Typography>
                                    </Box>
                                }
                            />
                        </Grid>

                        {/* Opciones de Email expandibles */}
                        <Grid item xs={12}>
                            <Collapse in={showEmailOptions}>
                                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={envioMasivo}
                                                onChange={(e) => handleEnvioMasivoChange(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="Envío masivo a múltiples usuarios"
                                    />

                                    {envioMasivo && (
                                        <Box sx={{ mt: 2 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="h6">
                                                    Seleccionar Usuarios ({usuariosSeleccionados.length} seleccionados)
                                                </Typography>
                                                <Box>
                                                    <Button
                                                        size="small"
                                                        onClick={() => handleSelectAllUsuarios(true)}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Seleccionar Todos
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        onClick={() => handleSelectAllUsuarios(false)}
                                                    >
                                                        Deseleccionar Todos
                                                    </Button>
                                                </Box>
                                            </Box>

                                            <List dense sx={{ maxHeight: 200, overflow: 'auto', mt: 1 }}>
                                                {Array.isArray(user_cbx) && user_cbx.map((usuario) => (
                                                    <ListItem key={usuario.value} dense>
                                                        <Checkbox
                                                            checked={usuariosSeleccionados.includes(usuario.value)}
                                                            onChange={(e) => handleUsuarioSeleccionChange(usuario.value, e.target.checked)}
                                                            size="small"
                                                        />
                                                        <ListItemText
                                                            primary={usuario.label}
                                                            secondary={usuario.email || 'Sin email'}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}
                                </Paper>
                            </Collapse>
                        </Grid>

                        {/* Usuario individual (solo si NO es envío masivo) */}
                        {!envioMasivo && (
                            <Grid item xs={12}>
                                <FormControl
                                    fullWidth
                                    error={formik.touched.usuario_id && Boolean(formik.errors.usuario_id)}
                                    disabled={isLoading}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            minHeight: '56px',
                                            fontSize: '1.1rem'
                                        },
                                        '& .MuiInputLabel-root': {
                                            fontSize: '1.1rem'
                                        }
                                    }}
                                >
                                    <InputLabel
                                        id="usuario-label"
                                        sx={{
                                            fontSize: '1.1rem',
                                            fontWeight: 500
                                        }}
                                    >
                                        Usuario *
                                    </InputLabel>
                                    <Select
                                        labelId="usuario-label"
                                        id="usuario_id"
                                        name="usuario_id"
                                        value={formik.values.usuario_id}
                                        label="Usuario *"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    maxHeight: 300,
                                                    '& .MuiMenuItem-root': {
                                                        fontSize: '1rem',
                                                        minHeight: '48px',
                                                        padding: '12px 16px'
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        {Array.isArray(user_cbx) && user_cbx.map((usuario) => (
                                            <MenuItem key={usuario.value} value={usuario.value}>
                                                {usuario.label}
                                                {usuario.email && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                        ({usuario.email})
                                                    </Typography>
                                                )}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText sx={{ fontSize: '0.9rem', mt: 1 }}>
                                        {formik.touched.usuario_id && formik.errors.usuario_id}
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                        )}

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Fecha programada"
                                name="fecha_programada"
                                type="datetime-local"
                                value={formik.values.fecha_programada}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSaveNotificacion}
                        variant="contained"
                        disabled={
                            !formik.isValid ||
                            formik.isSubmitting ||
                            (envioMasivo && usuariosSeleccionados.length === 0) ||
                            (enviarPorEmail && !envioMasivo && !formik.values.usuario_id)
                        }
                        startIcon={enviarPorEmail ? <EmailIcon /> : null}
                    >
                        {envioMasivo ? `Enviar a ${usuariosSeleccionados.length} usuarios` :
                            enviarPorEmail ? 'Crear y Enviar Email' :
                                formik.values._id ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog de confirmación para eliminar */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Estás seguro de que deseas eliminar esta notificación?
                    </Typography>
                    {notificacionToDelete && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                {notificacionToDelete.titulo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {notificacionToDelete.mensaje}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteNotificacion}
                        color="error"
                        variant="contained"
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para mensajes */}
            <Snackbar
                open={Boolean(serverMessage)}
                autoHideDuration={3000}
                onClose={startClearMessage}
            >
                <Alert severity="success" onClose={startClearMessage}>
                    {serverMessage}
                </Alert>
            </Snackbar>

            <Snackbar
                open={Boolean(errorMessage)}
                autoHideDuration={3000}
                onClose={startClearMessage}
            >
                <Alert severity="error" onClose={startClearMessage}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};