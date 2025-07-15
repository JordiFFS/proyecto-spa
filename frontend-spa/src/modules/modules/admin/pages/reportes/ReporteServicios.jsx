import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Chip,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Avatar,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    CalendarToday,
    Pending,
    CheckCircle,
    Check,
    Cancel,
    AttachMoney,
    Assessment,
    RoomService,
    Group,
    FilterList,
    Print,
    FileDownload,
    Person,
    Schedule,
    Phone,
    Email
} from '@mui/icons-material';
import { useReservaStore, useServiceStore } from '../../../../../store';

export const ReporteServicios = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const tipoReporte = location.pathname.includes('empleados') ? 'empleados' : 'servicios';
    
    const [estadisticasServicio, setEstadisticasServicio] = useState(null);
    // const [reservas, setReservas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({
        fecha_inicio: '',
        fecha_fin: '',
        estado: '',
        empleado_id: '',
        servicio_id: ''
    });
    const [paginacion, setPaginacion] = useState({
        page: 0,
        limit: 10,
        total: 0
    });

    const { startLoadingReserva, reservas } = useReservaStore();

    const { startLoadingServiceStats } = useServiceStore();

    useEffect(() => {
        cargarDatos();
    }, [tipoReporte, paginacion.page, paginacion.limit]);

    const cargarDatos = async () => {
        setCargando(true);
        setError(null);
        try {
            // Cargar estadísticas de servicios
            const statsData = await startLoadingServiceStats();
            if (statsData && statsData.success) {
                setEstadisticasServicio(statsData.data);
            }

            // Cargar reservas con filtros
            const queryParams = {
                page: paginacion.page + 1,
                limit: paginacion.limit,
                ...filtros
            };
            
            await startLoadingReserva(queryParams);
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            setError('Error al cargar los datos del reporte');
        } finally {
            setCargando(false);
        }
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const aplicarFiltros = () => {
        setPaginacion(prev => ({ ...prev, page: 0 }));
        cargarDatos();
    };

    const limpiarFiltros = () => {
        setFiltros({
            fecha_inicio: '',
            fecha_fin: '',
            estado: '',
            empleado_id: '',
            servicio_id: ''
        });
        setPaginacion(prev => ({ ...prev, page: 0 }));
    };

    const obtenerColorEstado = (estado) => {
        switch (estado) {
            case 'pendiente':
                return '#ff9800';
            case 'confirmada':
                return '#4caf50';
            case 'completada':
                return '#2196f3';
            case 'cancelada':
                return '#f44336';
            default:
                return '#9e9e9e';
        }
    };

    const obtenerIconoEstado = (estado) => {
        switch (estado) {
            case 'pendiente':
                return <Pending />;
            case 'confirmada':
                return <CheckCircle />;
            case 'completada':
                return <Check />;
            case 'cancelada':
                return <Cancel />;
            default:
                return <CalendarToday />;
        }
    };

    const calcularEstadisticasReservas = () => {
        if (!reservas.length) return { total: 0, pendiente: 0, confirmada: 0, completada: 0, cancelada: 0, ingresoTotal: 0 };
        
        const estadisticas = reservas.reduce((acc, reserva) => {
            acc.total++;
            acc[reserva.estado] = (acc[reserva.estado] || 0) + 1;
            acc.ingresoTotal += parseFloat(reserva.precio_total || 0);
            return acc;
        }, { total: 0, pendiente: 0, confirmada: 0, completada: 0, cancelada: 0, ingresoTotal: 0 });

        return estadisticas;
    };

    const estadisticasReservas = calcularEstadisticasReservas();

    const handleChangePage = (event, newPage) => {
        setPaginacion(prev => ({ ...prev, page: newPage }));
    };

    const handleChangeRowsPerPage = (event) => {
        setPaginacion(prev => ({
            ...prev,
            limit: parseInt(event.target.value, 10),
            page: 0
        }));
    };

    const cambiarTipoReporte = (tipo) => {
        const ruta = tipo === 'empleados' ? '/admin/reportes/empleados' : '/admin/reportes/servicios';
        navigate(ruta);
    };

    if (cargando) {
        return (
            <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Cargando reporte...
                    </Typography>
                </Paper>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            {/* Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                        {tipoReporte === 'servicios' ? (
                            <RoomService sx={{ fontSize: 40, color: 'primary.main' }} />
                        ) : (
                            <Group sx={{ fontSize: 40, color: 'primary.main' }} />
                        )}
                        <Box>
                            <Typography variant="h4" fontWeight="bold" color="primary">
                                Reporte de {tipoReporte === 'servicios' ? 'Servicios' : 'Empleados'}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Análisis detallado de reservas y estadísticas
                            </Typography>
                        </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                        <Button
                            variant={tipoReporte === 'servicios' ? 'contained' : 'outlined'}
                            startIcon={<RoomService />}
                            onClick={() => cambiarTipoReporte('servicios')}
                        >
                            Servicios
                        </Button>
                        <Button
                            variant={tipoReporte === 'empleados' ? 'contained' : 'outlined'}
                            startIcon={<Group />}
                            onClick={() => cambiarTipoReporte('empleados')}
                        >
                            Empleados
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Filtros */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <FilterList />
                    <Typography variant="h6">Filtros</Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Fecha Inicio"
                            type="date"
                            value={filtros.fecha_inicio}
                            onChange={(e) => handleFiltroChange('fecha_inicio', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Fecha Fin"
                            type="date"
                            value={filtros.fecha_fin}
                            onChange={(e) => handleFiltroChange('fecha_fin', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={filtros.estado}
                                label="Estado"
                                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="pendiente">Pendiente</MenuItem>
                                <MenuItem value="confirmada">Confirmada</MenuItem>
                                <MenuItem value="completada">Completada</MenuItem>
                                <MenuItem value="cancelada">Cancelada</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={aplicarFiltros}
                            sx={{ height: 56 }}
                        >
                            Aplicar
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={limpiarFiltros}
                            sx={{ height: 56 }}
                        >
                            Limpiar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Estadísticas principales */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Total de reservas */}
                <Grid item xs={12} md={2.4}>
                    <Card
                        elevation={3}
                        sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            transition: 'transform 0.2s ease',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}
                    >
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <CalendarToday sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold">
                                {estadisticasReservas.total}
                            </Typography>
                            <Typography variant="body2">Total Reservas</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Pendiente */}
                <Grid item xs={12} md={2.4}>
                    <Card
                        elevation={3}
                        sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            transition: 'transform 0.2s ease',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}
                    >
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Pending sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold">
                                {estadisticasReservas.pendiente}
                            </Typography>
                            <Typography variant="body2">Pendiente</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Confirmada */}
                <Grid item xs={12} md={2.4}>
                    <Card
                        elevation={3}
                        sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white',
                            transition: 'transform 0.2s ease',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}
                    >
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold">
                                {estadisticasReservas.confirmada}
                            </Typography>
                            <Typography variant="body2">Confirmada</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Completada */}
                <Grid item xs={12} md={2.4}>
                    <Card
                        elevation={3}
                        sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                            color: 'white',
                            transition: 'transform 0.2s ease',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}
                    >
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Check sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold">
                                {estadisticasReservas.completada}
                            </Typography>
                            <Typography variant="body2">Completada</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Ingresos */}
                <Grid item xs={12} md={2.4}>
                    <Card
                        elevation={3}
                        sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            color: 'white',
                            transition: 'transform 0.2s ease',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}
                    >
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <AttachMoney sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold">
                                ${estadisticasReservas.ingresoTotal.toFixed(2)}
                            </Typography>
                            <Typography variant="body2">Ingresos</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Estadísticas de servicios */}
            {estadisticasServicio && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <Card elevation={2} sx={{ borderRadius: 2, p: 2 }}>
                            <Typography variant="h6" gutterBottom>Servicios Activos</Typography>
                            <Typography variant="h3" color="primary.main" fontWeight="bold">
                                {estadisticasServicio.activos}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                de {estadisticasServicio.total} servicios totales
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card elevation={2} sx={{ borderRadius: 2, p: 2 }}>
                            <Typography variant="h6" gutterBottom>Precio Promedio</Typography>
                            <Typography variant="h3" color="success.main" fontWeight="bold">
                                ${estadisticasServicio.precioPromedio}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                por servicio
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card elevation={2} sx={{ borderRadius: 2, p: 2 }}>
                            <Typography variant="h6" gutterBottom>Servicios Inactivos</Typography>
                            <Typography variant="h3" color="error.main" fontWeight="bold">
                                {estadisticasServicio.inactivos}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                servicios deshabilitados
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Tabla de reservas */}
            <Paper elevation={2} sx={{ borderRadius: 2 }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                        Detalle de Reservas
                    </Typography>
                    <Box display="flex" gap={1}>
                        <Tooltip title="Imprimir">
                            <IconButton>
                                <Print />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Exportar">
                            <IconButton>
                                <FileDownload />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
                <Divider />
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Cliente</TableCell>
                                {tipoReporte === 'servicios' ? (
                                    <TableCell>Servicio</TableCell>
                                ) : (
                                    <TableCell>Empleado</TableCell>
                                )}
                                <TableCell>Fecha</TableCell>
                                <TableCell>Hora</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Precio</TableCell>
                                <TableCell>Contacto</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reservas.map((reserva) => (
                                <TableRow key={reserva.id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Avatar sx={{ width: 32, height: 32 }}>
                                                <Person />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {reserva.Usuario?.nombre}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ID: {reserva.id}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    {tipoReporte === 'servicios' ? (
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {reserva.Servicio?.nombre}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {reserva.Servicio?.duracion} min
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    ) : (
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {reserva.Empleado?.Usuario?.nombre}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {reserva.Empleado?.especialidad}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <CalendarToday sx={{ fontSize: 16 }} />
                                            {new Date(reserva.fecha).toLocaleDateString()}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Schedule sx={{ fontSize: 16 }} />
                                            {reserva.hora_inicio} - {reserva.hora_fin}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={reserva.estado}
                                            icon={obtenerIconoEstado(reserva.estado)}
                                            sx={{
                                                backgroundColor: obtenerColorEstado(reserva.estado),
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold" color="success.main">
                                            ${reserva.precio_total}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" gap={1}>
                                            <Tooltip title={reserva.Usuario?.telefono}>
                                                <IconButton size="small">
                                                    <Phone sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={reserva.Usuario?.email}>
                                                <IconButton size="small">
                                                    <Email sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={paginacion.total}
                    page={paginacion.page}
                    onPageChange={handleChangePage}
                    rowsPerPage={paginacion.limit}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Filas por página:"
                />
            </Paper>
        </Box>
    );
};