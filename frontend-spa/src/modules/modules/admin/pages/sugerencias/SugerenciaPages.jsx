import React, { useState, useEffect } from 'react';
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
    Avatar,
    LinearProgress
} from '@mui/material';
import {
    Lightbulb,
    Edit,
    Delete,
    Add,
    FilterList,
    Search,
    MoreVert,
    Reply,
    CheckCircle,
    Cancel,
    Refresh,
    Person,
    DateRange,
    Assignment,
    Star,
    StarBorder,
    Info,
    Warning,
    Error,
    Build,
    Schedule,
    AccessTime,
    TrendingUp,
    Group,
    Business,
    Public,
    Close
} from '@mui/icons-material';
import { useSugerenciaStore } from '../../../../../store/modules/sugerencia/hooks';
import { useGetComboxBox } from '../../../../components';
import * as Yup from 'yup';
import { useFormik } from 'formik';

export const SugerenciaPages = () => {
    const {
        isLoading,
        sugerencias,
        pagination,
        serverMessage,
        errorMessage,
        startLoadingSugerencias,
        startSavingSugerencia,
        startDeletingSugerencia,
        startCambiarEstadoSugerencia,
        startResponderSugerencia,
        startCambiarPrioridadSugerencia,
        startGetSugerenciasStats,
        startClearMessage
    } = useSugerenciaStore();

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
        categoria: '',
        prioridad: '',
        estado: '',
        usuario_id: '',
        fecha_inicio: '',
        fecha_fin: ''
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [respuestaModalOpen, setRespuestaModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [sugerenciaToDelete, setSugerenciaToDelete] = useState(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [selectedSugerencia, setSelectedSugerencia] = useState(null);
    const [estadisticas, setEstadisticas] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Formulario para respuesta
    const respuestaFormik = useFormik({
        initialValues: {
            respuesta: '',
            estado: 'revisada'
        },
        validationSchema: Yup.object({
            respuesta: Yup.string()
                .required('La respuesta es requerida')
                .min(10, 'La respuesta debe tener al menos 10 caracteres')
                .max(1000, 'La respuesta no puede exceder 1000 caracteres'),
            estado: Yup.string()
                .required('El estado es requerido')
                .oneOf(['nueva', 'revisada', 'implementada', 'rechazada'], 'Estado inválido')
        }),
        onSubmit: async (values) => {
            if (selectedSugerencia) {
                await startResponderSugerencia(selectedSugerencia._id, values);
                setRespuestaModalOpen(false);
                cargarSugerencias();
                cargarEstadisticas();
                respuestaFormik.resetForm();
            }
        }
    });

    console.log('estadisticas', estadisticas?.estadisticas);

    // Formulario para crear/editar sugerencia
    const formik = useFormik({
        initialValues: {
            tipo: 'general',
            contenido: '',
            categoria: 'general',
            prioridad: 'media',
            estado: 'nueva',
            usuario_id: ''
        },
        validationSchema: Yup.object({
            tipo: Yup.string()
                .required('El tipo es requerido')
                .oneOf(['servicio', 'empleado', 'horario', 'general'], 'Tipo inválido'),
            contenido: Yup.string()
                .required('El contenido es requerido')
                .min(10, 'El contenido debe tener al menos 10 caracteres')
                .max(1000, 'El contenido no puede exceder 1000 caracteres'),
            categoria: Yup.string()
                .required('La categoría es requerida'),
            prioridad: Yup.string()
                .required('La prioridad es requerida')
                .oneOf(['baja', 'media', 'alta'], 'Prioridad inválida'),
            usuario_id: Yup.string()
                .required('El usuario es requerido')
        }),
        onSubmit: async (values) => {
            await startSavingSugerencia(values);
            handleCloseModal();
            cargarSugerencias();
            cargarEstadisticas();
        }
    });

    useEffect(() => {
        cargarSugerencias();
        cargarEstadisticas();
        startGetUserCbx();
    }, [page, rowsPerPage, filtros]);

    useEffect(() => {
        if (serverMessage || errorMessage) {
            setTimeout(() => {
                startClearMessage();
            }, 3000);
        }
    }, [serverMessage, errorMessage]);

    const cargarSugerencias = async () => {
        const params = {
            page: page + 1,
            limit: rowsPerPage,
            ...filtros
        };
        await startLoadingSugerencias(params);
    };

    const cargarEstadisticas = async () => {
        const stats = await startGetSugerenciasStats();
        setEstadisticas(stats);
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

    const handleOpenModal = (sugerencia = null) => {
        if (sugerencia) {
            formik.setValues({
                id: sugerencia._id,
                tipo: sugerencia.tipo,
                contenido: sugerencia.contenido,
                categoria: sugerencia.categoria,
                prioridad: sugerencia.prioridad,
                estado: sugerencia.estado,
                usuario_id: sugerencia.usuario_id
            });
        } else {
            formik.resetForm();
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        formik.resetForm();
    };

    const handleOpenRespuestaModal = (sugerencia) => {
        setSelectedSugerencia(sugerencia);
        respuestaFormik.setValues({
            respuesta: sugerencia.respuesta || '',
            estado: sugerencia.estado
        });
        setRespuestaModalOpen(true);
    };

    const handleCloseRespuestaModal = () => {
        setRespuestaModalOpen(false);
        respuestaFormik.resetForm();
        setSelectedSugerencia(null);
    };

    const handleDeleteConfirm = (sugerencia) => {
        setSugerenciaToDelete(sugerencia);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteSugerencia = async () => {
        if (sugerenciaToDelete) {
            await startDeletingSugerencia(sugerenciaToDelete);
            setDeleteConfirmOpen(false);
            setSugerenciaToDelete(null);
            cargarSugerencias();
            cargarEstadisticas();
        }
    };

    const handleMenuClick = (event, sugerencia) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedSugerencia(sugerencia);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setSelectedSugerencia(null);
    };

    const handleCambiarEstado = async (sugerenciaId, nuevoEstado) => {
        await startCambiarEstadoSugerencia(sugerenciaId, nuevoEstado);
        cargarSugerencias();
        cargarEstadisticas();
        handleMenuClose();
    };

    const handleCambiarPrioridad = async (sugerenciaId, nuevaPrioridad) => {
        await startCambiarPrioridadSugerencia(sugerenciaId, nuevaPrioridad);
        cargarSugerencias();
        cargarEstadisticas();
        handleMenuClose();
    };

    const getTipoColor = (tipo) => {
        switch (tipo) {
            case 'servicio': return 'primary';
            case 'empleado': return 'secondary';
            case 'horario': return 'warning';
            case 'general': return 'info';
            default: return 'default';
        }
    };

    const getTipoIcon = (tipo) => {
        switch (tipo) {
            case 'servicio': return <Build />;
            case 'empleado': return <Person />;
            case 'horario': return <Schedule />;
            case 'general': return <Info />;
            default: return <Lightbulb />;
        }
    };

    const getPrioridadColor = (prioridad) => {
        switch (prioridad) {
            case 'alta': return 'error';
            case 'media': return 'warning';
            case 'baja': return 'success';
            default: return 'default';
        }
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'nueva': return 'info';
            case 'revisada': return 'warning';
            case 'implementada': return 'success';
            case 'rechazada': return 'error';
            default: return 'default';
        }
    };

    const getEstadoIcon = (estado) => {
        switch (estado) {
            case 'nueva': return <Info />;
            case 'revisada': return <Warning />;
            case 'implementada': return <CheckCircle />;
            case 'rechazada': return <Cancel />;
            default: return <Info />;
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

    const getPrioridadProgress = (prioridad) => {
        switch (prioridad) {
            case 'baja': return 33;
            case 'media': return 66;
            case 'alta': return 100;
            default: return 0;
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            {/* Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Badge
                            badgeContent={estadisticas?.estadisticas?.nueva || 0}
                            color="error"
                            max={99}
                        >
                            <Lightbulb sx={{ fontSize: 40, color: 'primary.main' }} />
                        </Badge>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" color="primary">
                                Gestión de Sugerencias
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Administra todas las sugerencias de los usuarios
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
                                cargarSugerencias();
                                cargarEstadisticas();
                            }}
                        >
                            Actualizar
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Estadísticas rápidas */}
            {estadisticas && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 2, height: '100%' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary" fontWeight="bold">
                                    {estadisticas?.estadisticas?.total || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Sugerencias
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 2, height: '100%' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="info.main" fontWeight="bold">
                                    {estadisticas?.estadisticas?.nueva || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Nuevas
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 2, height: '100%' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="warning.main" fontWeight="bold">
                                    {estadisticas?.estadisticas?.revisada || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    En Revisión
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 2, height: '100%' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="success.main" fontWeight="bold">
                                    {estadisticas?.estadisticas?.implementada || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Implementadas
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
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Buscar"
                                placeholder="Contenido de la sugerencia..."
                                value={filtros.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                InputProps={{
                                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    value={filtros.tipo}
                                    label="Tipo"
                                    onChange={(e) => handleFilterChange('tipo', e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="servicio">Servicio</MenuItem>
                                    <MenuItem value="empleado">Empleado</MenuItem>
                                    <MenuItem value="horario">Horario</MenuItem>
                                    <MenuItem value="general">General</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Prioridad</InputLabel>
                                <Select
                                    value={filtros.prioridad}
                                    label="Prioridad"
                                    onChange={(e) => handleFilterChange('prioridad', e.target.value)}
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    <MenuItem value="baja">Baja</MenuItem>
                                    <MenuItem value="media">Media</MenuItem>
                                    <MenuItem value="alta">Alta</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    value={filtros.estado}
                                    label="Estado"
                                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="nueva">Nueva</MenuItem>
                                    <MenuItem value="revisada">Revisada</MenuItem>
                                    <MenuItem value="implementada">Implementada</MenuItem>
                                    <MenuItem value="rechazada">Rechazada</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Usuario</InputLabel>
                                <Select
                                    value={filtros.usuario_id}
                                    label="Usuario"
                                    onChange={(e) => handleFilterChange('usuario_id', e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {Array.isArray(user_cbx) && user_cbx.map((usuario) => (
                                        <MenuItem key={usuario.value} value={usuario.value}>
                                            {usuario.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Tabla de sugerencias */}
            <Paper elevation={2} sx={{ borderRadius: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Contenido</TableCell>
                                <TableCell>Usuario</TableCell>
                                <TableCell>Prioridad</TableCell>
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
                            ) : sugerencias?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No hay sugerencias disponibles
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sugerencias?.map((sugerencia) => (
                                    <TableRow key={sugerencia._id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {getTipoIcon(sugerencia.tipo)}
                                                <Chip
                                                    label={sugerencia.tipo}
                                                    color={getTipoColor(sugerencia.tipo)}
                                                    size="small"
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        maxWidth: '300px'
                                                    }}
                                                >
                                                    {sugerencia.contenido}
                                                </Typography>
                                                {sugerencia.categoria && (
                                                    <Chip
                                                        label={sugerencia.categoria}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ mt: 0.5 }}
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Avatar sx={{ width: 32, height: 32 }}>
                                                    <Person />
                                                </Avatar>
                                                <Typography variant="body2">
                                                    Usuario {sugerencia.usuario_id}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Chip
                                                    label={sugerencia.prioridad}
                                                    color={getPrioridadColor(sugerencia.prioridad)}
                                                    size="small"
                                                />
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={getPrioridadProgress(sugerencia.prioridad)}
                                                    color={getPrioridadColor(sugerencia.prioridad)}
                                                    sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {getEstadoIcon(sugerencia.estado)}
                                                <Chip
                                                    label={sugerencia.estado}
                                                    color={getEstadoColor(sugerencia.estado)}
                                                    size="small"
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2">
                                                    {formatFecha(sugerencia.createdAt)}
                                                </Typography>
                                                {sugerencia.updatedAt !== sugerencia.createdAt && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Act: {formatFecha(sugerencia.updatedAt)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                onClick={(e) => handleMenuClick(e, sugerencia)}
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

            {/* FAB para crear nueva sugerencia */}
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

            {/* Menu contextual */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleOpenModal(selectedSugerencia)}>
                    <ListItemIcon>
                        <Edit fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Editar</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => handleOpenRespuestaModal(selectedSugerencia)}>
                    <ListItemIcon>
                        <Reply fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Responder</ListItemText>
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => handleCambiarEstado(selectedSugerencia._id, 'revisada')}>
                    <ListItemIcon>
                        <Warning fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Marcar como Revisada</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => handleCambiarEstado(selectedSugerencia._id, 'implementada')}>
                    <ListItemIcon>
                        <CheckCircle fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Marcar como Implementada</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => handleCambiarEstado(selectedSugerencia._id, 'rechazada')}>
                    <ListItemIcon>
                        <Cancel fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Marcar como Rechazada</ListItemText>
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => handleCambiarPrioridad(selectedSugerencia._id, 'alta')}>
                    <ListItemIcon>
                        <Star fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Prioridad Alta</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => handleCambiarPrioridad(selectedSugerencia._id, 'media')}>
                    <ListItemIcon>
                        <StarBorder fontSize="small" color="warning" />
                    </ListItemIcon>
                    <ListItemText>Prioridad Media</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => handleCambiarPrioridad(selectedSugerencia._id, 'baja')}>
                    <ListItemIcon>
                        <StarBorder fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText>Prioridad Baja</ListItemText>
                </MenuItem>

                <Divider />

                <MenuItem
                    onClick={() => handleDeleteConfirm(selectedSugerencia)}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon>
                        <Delete fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Eliminar</ListItemText>
                </MenuItem>
            </Menu>

            {/* Modal para crear/editar sugerencia */}
            <Dialog
                open={modalOpen}
                onClose={handleCloseModal}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {formik.values.id ? 'Editar Sugerencia' : 'Nueva Sugerencia'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
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
                                    <MenuItem value="servicio">Servicio</MenuItem>
                                    <MenuItem value="empleado">Empleado</MenuItem>
                                    <MenuItem value="horario">Horario</MenuItem>
                                    <MenuItem value="general">General</MenuItem>
                                </Select>
                                {formik.touched.tipo && formik.errors.tipo && (
                                    <FormHelperText>{formik.errors.tipo}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Categoría"
                                name="categoria"
                                value={formik.values.categoria}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.categoria && Boolean(formik.errors.categoria)}
                                helperText={formik.touched.categoria && formik.errors.categoria}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={formik.touched.categoria && Boolean(formik.errors.categoria)}>
                                <InputLabel>Categoría</InputLabel>
                                <Select
                                    name="categoria"
                                    value={formik.values.categoria}
                                    label="Categoría"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    <MenuItem value="general">General</MenuItem>
                                    <MenuItem value="servicio">Servicio</MenuItem>
                                    <MenuItem value="instalaciones">Instalaciones</MenuItem>
                                    <MenuItem value="personal">Personal</MenuItem>
                                    <MenuItem value="horarios">Horarios</MenuItem>
                                    <MenuItem value="precios">Precios</MenuItem>
                                    <MenuItem value="otros">Otros</MenuItem>
                                </Select>
                                {formik.touched.categoria && formik.errors.categoria && (
                                    <FormHelperText>{formik.errors.categoria}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={formik.touched.prioridad && Boolean(formik.errors.prioridad)}>
                                <InputLabel>Prioridad</InputLabel>
                                <Select
                                    name="prioridad"
                                    value={formik.values.prioridad}
                                    label="Prioridad"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    <MenuItem value="baja">Baja</MenuItem>
                                    <MenuItem value="media">Media</MenuItem>
                                    <MenuItem value="alta">Alta</MenuItem>
                                </Select>
                                {formik.touched.prioridad && formik.errors.prioridad && (
                                    <FormHelperText>{formik.errors.prioridad}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={formik.touched.estado && Boolean(formik.errors.estado)}>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    name="estado"
                                    value={formik.values.estado}
                                    label="Estado"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    <MenuItem value="nueva">Nueva</MenuItem>
                                    <MenuItem value="revisada">Revisada</MenuItem>
                                    <MenuItem value="implementada">Implementada</MenuItem>
                                    <MenuItem value="rechazada">Rechazada</MenuItem>
                                </Select>
                                {formik.touched.estado && formik.errors.estado && (
                                    <FormHelperText>{formik.errors.estado}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={formik.touched.usuario_id && Boolean(formik.errors.usuario_id)}>
                                <InputLabel>Usuario</InputLabel>
                                <Select
                                    name="usuario_id"
                                    value={formik.values.usuario_id}
                                    label="Usuario"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    {Array.isArray(user_cbx) && user_cbx.map((usuario) => (
                                        <MenuItem key={usuario.value} value={usuario.value}>
                                            {usuario.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.usuario_id && formik.errors.usuario_id && (
                                    <FormHelperText>{formik.errors.usuario_id}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                name="contenido"
                                label="Contenido de la sugerencia"
                                value={formik.values.contenido}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.contenido && Boolean(formik.errors.contenido)}
                                helperText={formik.touched.contenido && formik.errors.contenido}
                                placeholder="Describe detalladamente la sugerencia..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={formik.handleSubmit}
                        variant="contained"
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={20} /> : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal para responder sugerencia */}
            <Dialog
                open={respuestaModalOpen}
                onClose={handleCloseRespuestaModal}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Reply />
                        Responder Sugerencia
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedSugerencia && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Sugerencia Original:
                            </Typography>
                            <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    {getTipoIcon(selectedSugerencia.tipo)}
                                    <Chip
                                        label={selectedSugerencia.tipo}
                                        color={getTipoColor(selectedSugerencia.tipo)}
                                        size="small"
                                    />
                                    <Chip
                                        label={selectedSugerencia.prioridad}
                                        color={getPrioridadColor(selectedSugerencia.prioridad)}
                                        size="small"
                                    />
                                </Box>
                                <Typography variant="body1">
                                    {selectedSugerencia.contenido}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                    {formatFecha(selectedSugerencia.createdAt)}
                                </Typography>
                            </Paper>
                        </Box>
                    )}

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={respuestaFormik.touched.estado && Boolean(respuestaFormik.errors.estado)}>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    name="estado"
                                    value={respuestaFormik.values.estado}
                                    label="Estado"
                                    onChange={respuestaFormik.handleChange}
                                    onBlur={respuestaFormik.handleBlur}
                                >
                                    <MenuItem value="nueva">Nueva</MenuItem>
                                    <MenuItem value="revisada">Revisada</MenuItem>
                                    <MenuItem value="implementada">Implementada</MenuItem>
                                    <MenuItem value="rechazada">Rechazada</MenuItem>
                                </Select>
                                {respuestaFormik.touched.estado && respuestaFormik.errors.estado && (
                                    <FormHelperText>{respuestaFormik.errors.estado}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                name="respuesta"
                                label="Respuesta a la sugerencia"
                                value={respuestaFormik.values.respuesta}
                                onChange={respuestaFormik.handleChange}
                                onBlur={respuestaFormik.handleBlur}
                                error={respuestaFormik.touched.respuesta && Boolean(respuestaFormik.errors.respuesta)}
                                helperText={respuestaFormik.touched.respuesta && respuestaFormik.errors.respuesta}
                                placeholder="Escribe tu respuesta a la sugerencia..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRespuestaModal}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={respuestaFormik.handleSubmit}
                        variant="contained"
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={20} /> : 'Enviar Respuesta'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de confirmación para eliminar */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Delete color="error" />
                        Confirmar Eliminación
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        ¿Estás seguro de que deseas eliminar esta sugerencia? Esta acción no se puede deshacer.
                    </Typography>
                    {sugerenciaToDelete && (
                        <Paper elevation={1} sx={{ p: 2, mt: 2, backgroundColor: 'grey.50' }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                {getTipoIcon(sugerenciaToDelete.tipo)}
                                <Chip
                                    label={sugerenciaToDelete.tipo}
                                    color={getTipoColor(sugerenciaToDelete.tipo)}
                                    size="small"
                                />
                            </Box>
                            <Typography variant="body2">
                                {sugerenciaToDelete.contenido}
                            </Typography>
                        </Paper>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteSugerencia}
                        variant="contained"
                        color="error"
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={20} /> : 'Eliminar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para mensajes */}
            <Snackbar
                open={Boolean(serverMessage)}
                autoHideDuration={6000}
                onClose={() => startClearMessage()}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert
                    onClose={() => startClearMessage()}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    {serverMessage}
                </Alert>
            </Snackbar>

            <Snackbar
                open={Boolean(errorMessage)}
                autoHideDuration={6000}
                onClose={() => startClearMessage()}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert
                    onClose={() => startClearMessage()}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};