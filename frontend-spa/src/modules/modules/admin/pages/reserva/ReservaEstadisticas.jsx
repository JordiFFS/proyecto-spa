import { useState, useEffect } from 'react';
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
    Divider
} from '@mui/material';
import {
    CalendarToday,
    Pending,
    CheckCircle,
    Check,
    Cancel,
    AttachMoney,
    Assessment
} from '@mui/icons-material';
import { useReservaStore } from '../../../../../store';
import { useAuthStore } from '../../../../../hooks';

export const ReservaEstadisticas = () => {
    const [estadisticas, setEstadisticas] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const { startLoadingReservaStats } = useReservaStore();

    const {
        user
    } = useAuthStore();

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        setCargando(true);
        setError(null);
        try {
            // Enviar el rol y ID del usuario para filtrar las estadísticas
            if (user.rol === "cliente") {
                const filtros = {
                    rol: user.rol, 
                    userId: user.id
                };
                const data = await startLoadingReservaStats(filtros);
                if (data && data.success) {
                    setEstadisticas(data.data);
                } else {
                    setError('No se pudieron cargar las estadísticas');
                }
            } else {
                const data = await startLoadingReservaStats();
                if (data && data.success) {
                    setEstadisticas(data.data);
                } else {
                    setError('No se pudieron cargar las estadísticas');
                }
            }

        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            setError('Error al cargar las estadísticas');
        } finally {
            setCargando(false);
        }
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

    const calcularPorcentaje = (valor, total) => {
        return total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
    };

    if (cargando) {
        return (
            <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Cargando estadísticas...
                    </Typography>
                </Paper>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!estadisticas) {
        return (
            <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No hay estadísticas disponibles
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Assessment sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color="primary">
                            Estadísticas de Reservas
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Resumen del estado actual de las reservas
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Estadísticas principales */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Total de reservas */}
                <Grid item xs={12} md={3}>
                    <Card
                        elevation={3}
                        sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)'
                            }
                        }}
                    >
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <CalendarToday sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h3" fontWeight="bold">
                                {estadisticas.total}
                            </Typography>
                            <Typography variant="h6">
                                Total de Reservas
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Pendientes */}
                <Grid item xs={12} md={3}>
                    <Card
                        elevation={3}
                        sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)'
                            }
                        }}
                    >
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <Pending sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h3" fontWeight="bold">
                                {estadisticas.pendientes}
                            </Typography>
                            <Typography variant="h6">
                                Pendientes
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                                {calcularPorcentaje(estadisticas.pendientes, estadisticas.total)}% del total
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Confirmadas */}
                <Grid item xs={12} md={3}>
                    <Card
                        elevation={3}
                        sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white',
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)'
                            }
                        }}
                    >
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <CheckCircle sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h3" fontWeight="bold">
                                {estadisticas.confirmadas}
                            </Typography>
                            <Typography variant="h6">
                                Confirmadas
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                                {calcularPorcentaje(estadisticas.confirmadas, estadisticas.total)}% del total
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Ingresos */}
                <Grid item xs={12} md={3}>
                    <Card
                        elevation={3}
                        sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            color: 'white',
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)'
                            }
                        }}
                    >
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <AttachMoney sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h3" fontWeight="bold">
                                ${estadisticas.ingresoTotal}
                            </Typography>
                            <Typography variant="h6">
                                Ingresos Total
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Detalles por estado */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                    Desglose por Estado
                </Typography>

                <Grid container spacing={2}>
                    {/* Completadas */}
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                backgroundColor: 'grey.50'
                            }}
                        >
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    backgroundColor: obtenerColorEstado('completada'),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}
                            >
                                {obtenerIconoEstado('completada')}
                            </Box>
                            <Box flex={1}>
                                <Typography variant="h6" fontWeight="bold">
                                    {estadisticas.completadas}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Completadas
                                </Typography>
                            </Box>
                            <Chip
                                label={`${calcularPorcentaje(estadisticas.completadas, estadisticas.total)}%`}
                                sx={{
                                    backgroundColor: obtenerColorEstado('completada'),
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                            />
                        </Box>
                    </Grid>

                    {/* Canceladas */}
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                backgroundColor: 'grey.50'
                            }}
                        >
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    backgroundColor: obtenerColorEstado('cancelada'),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}
                            >
                                {obtenerIconoEstado('cancelada')}
                            </Box>
                            <Box flex={1}>
                                <Typography variant="h6" fontWeight="bold">
                                    {estadisticas.canceladas}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Canceladas
                                </Typography>
                            </Box>
                            <Chip
                                label={`${calcularPorcentaje(estadisticas.canceladas, estadisticas.total)}%`}
                                sx={{
                                    backgroundColor: obtenerColorEstado('cancelada'),
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                            />
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Resumen */}
                <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h6" color="text.secondary">
                        Resumen General
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        De un total de <strong>{estadisticas.total} reservas</strong>,
                        hay <strong>{estadisticas.pendientes} pendientes</strong> y{' '}
                        <strong>{estadisticas.confirmadas} confirmadas</strong>.
                    </Typography>
                    {estadisticas.total > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Estado más frecuente: {' '}
                            <Chip
                                label={
                                    estadisticas.pendientes >= estadisticas.confirmadas ?
                                        'Pendiente' : 'Confirmada'
                                }
                                size="small"
                                sx={{
                                    backgroundColor: estadisticas.pendientes >= estadisticas.confirmadas ?
                                        obtenerColorEstado('pendiente') : obtenerColorEstado('confirmada'),
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                            />
                        </Typography>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};