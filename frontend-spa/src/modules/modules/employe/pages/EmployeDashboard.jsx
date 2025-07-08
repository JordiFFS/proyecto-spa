import { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    // Timeline,
    // TimelineItem,
    // TimelineSeparator,
    // TimelineConnector,
    // TimelineContent,
    // TimelineDot,
    // Divider,
    IconButton,
    Badge,
    Paper,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem
} from '@mui/material';
import {
    CalendarToday,
    Schedule,
    EventNote,
    RoomService,
    Star,
    AccessTime,
    Person,
    CheckCircle,
    Pending,
    Cancel,
    Assessment,
    Notifications,
    TrendingUp,
    WorkOutline,
    Edit,
    Add,
    Visibility,
    AttachMoney,
    Groups,
    Today
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../hooks';

export const EmployeDashboard = () => {

    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Estados para las métricas del empleado
    const [todayStats, setTodayStats] = useState({
        reservasHoy: 0,
        reservasCompletadas: 0,
        reservasPendientes: 0,
        reservasCanceladas: 0,
        horasTrabajadasHoy: 0,
        proximaReserva: null,
        calificacionPromedio: 0,
        gananciasDia: 0
    });

    const [reservasHoy, setReservasHoy] = useState([]);

    const [weeklyStats, setWeeklyStats] = useState({
        totalReservas: 0,
        reservasCompletadas: 0,
        horasTabajadas: 0,
        gananciasSemana: 0,
        calificacionSemana: 0,
        clientesAtendidos: 0
    });

    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [statusUpdate, setStatusUpdate] = useState('');
    const [notas, setNotas] = useState('');

    // Funciones para cargar datos desde API
    const loadTodayStats = async () => {
        try {
            // TODO: Implementar llamada a API
            // const response = await api.get(`/empleado/${user.id}/stats/today`);
            // setTodayStats(response.data);
        } catch (error) {
            console.error('Error cargando estadísticas del día:', error);
        }
    };

    const loadTodayReservations = async () => {
        try {
            // TODO: Implementar llamada a API
            // const response = await api.get(`/empleado/${user.id}/reservas/today`);
            // setReservasHoy(response.data);
        } catch (error) {
            console.error('Error cargando reservas del día:', error);
        }
    };

    const loadWeeklyStats = async () => {
        try {
            // TODO: Implementar llamada a API
            // const response = await api.get(`/empleado/${user.id}/stats/weekly`);
            // setWeeklyStats(response.data);
        } catch (error) {
            console.error('Error cargando estadísticas semanales:', error);
        }
    };

    const loadNotifications = async () => {
        try {
            // TODO: Implementar llamada a API
            // const response = await api.get(`/empleado/${user.id}/notificaciones`);
            // setNotificaciones(response.data);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
        }
    };

    const updateReservationStatus = async (reservaId, nuevoEstado, comentarios = '') => {
        try {
            // TODO: Implementar llamada a API
            // const response = await api.put(`/reservas/${reservaId}/status`, {
            //     estado: nuevoEstado,
            //     notas: comentarios,
            //     empleado_id: user.id
            // });

            // Actualizar estado local
            setReservasHoy(prev =>
                prev.map(reserva =>
                    reserva.id === reservaId
                        ? { ...reserva, estado: nuevoEstado, notas: comentarios }
                        : reserva
                )
            );

            // Recargar estadísticas
            loadTodayStats();

        } catch (error) {
            console.error('Error actualizando estado de reserva:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                loadTodayStats(),
                loadTodayReservations(),
                loadWeeklyStats(),
                loadNotifications()
            ]);
            setLoading(false);
        };

        if (user?.id) {
            loadData();
        }
    }, [user]);

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'completada': return '#4caf50';
            case 'confirmada': return '#2196f3';
            case 'pendiente': return '#ff9800';
            case 'cancelada': return '#f44336';
            default: return '#757575';
        }
    };

    const getEstadoIcon = (estado) => {
        switch (estado) {
            case 'completada': return <CheckCircle />;
            case 'confirmada': return <Schedule />;
            case 'pendiente': return <Pending />;
            case 'cancelada': return <Cancel />;
            default: return <Schedule />;
        }
    };

    const MetricCard = ({ title, value, subtitle, icon, color, trend }) => (
        <Card sx={{
            height: '100%',
            background: `linear-gradient(135deg, ${color}15, ${color}05)`,
            border: `1px solid ${color}30`,
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${color}40`
            }
        }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: color, mb: 1 }}>
                            {value}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
                            {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                        {trend && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} />
                                <Typography variant="caption" sx={{ ml: 0.5, color: '#4caf50' }}>
                                    {trend}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
                        {icon}
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );

    const handleStatusChange = (reserva) => {
        setSelectedReserva(reserva);
        setStatusUpdate(reserva.estado);
        setNotas(reserva.notas || '');
        setDialogOpen(true);
    };

    const handleSaveStatusChange = async () => {
        if (selectedReserva && statusUpdate) {
            await updateReservationStatus(selectedReserva.id, statusUpdate, notas);
            setDialogOpen(false);
            setSelectedReserva(null);
            setStatusUpdate('');
            setNotas('');
        }
    };

    const getCurrentTime = () => {
        return new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const [currentTime, setCurrentTime] = useState(getCurrentTime());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(getCurrentTime());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    if (loading) {
        return (
            <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
                <LinearProgress sx={{ mb: 3 }} />
                <Typography>Cargando información del empleado...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a202c', mb: 1 }}>
                            ¡Hola, {user?.nombre || 'Empleado'}! 👋
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {new Date().toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })} - {currentTime}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Badge badgeContent={notificaciones.filter(n => !n.leida).length} color="error">
                            <IconButton
                                sx={{ bgcolor: '#A8D8B9', color: '#fff' }}
                                onClick={() => navigate('/empleado/notificaciones')}
                            >
                                <Notifications />
                            </IconButton>
                        </Badge>
                        <Button
                            variant="contained"
                            startIcon={<Edit />}
                            sx={{
                                bgcolor: '#A8D8B9',
                                color: '#333',
                                '&:hover': { bgcolor: '#98c9a9' }
                            }}
                            onClick={() => navigate('/empleado/disponibilidad')}
                        >
                            Actualizar Disponibilidad
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Métricas del Día */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Reservas Hoy"
                        value={todayStats.reservasHoy}
                        subtitle={`${todayStats.reservasPendientes} pendientes`}
                        icon={<EventNote />}
                        color="#A8D8B9"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Completadas"
                        value={todayStats.reservasCompletadas}
                        subtitle="Servicios finalizados"
                        icon={<CheckCircle />}
                        color="#4caf50"
                        trend={weeklyStats.totalReservas > 0 ? "↑12% vs semana anterior" : null}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Calificación"
                        value={todayStats.calificacionPromedio > 0 ? `${todayStats.calificacionPromedio}/5` : 'N/A'}
                        subtitle="Promedio de estrellas"
                        icon={<Star />}
                        color="#ffc107"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Ganancias Hoy"
                        value={`$${todayStats.gananciasDia}`}
                        subtitle="Ingresos del día"
                        icon={<AttachMoney />}
                        color="#9c27b0"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Reservas de Hoy */}
                <Grid item xs={12} lg={8}>
                    <Card sx={{ height: 'fit-content' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Reservas de Hoy ({reservasHoy.length})
                                </Typography>
                                <Button
                                    startIcon={<Today />}
                                    onClick={() => navigate('/empleado/agenda')}
                                    size="small"
                                >
                                    Ver Agenda Completa
                                </Button>
                            </Box>

                            {/* {reservasHoy.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No tienes reservas programadas para hoy
                      </Typography>
                    </Box>
                  ) : (
                    <Timeline>
                      {reservasHoy.map((reserva, index) => (
                        <TimelineItem key={reserva.id}>
                          <TimelineSeparator>
                            <TimelineDot sx={{ bgcolor: getEstadoColor(reserva.estado) }}>
                              {getEstadoIcon(reserva.estado)}
                            </TimelineDot>
                            {index < reservasHoy.length - 1 && <TimelineConnector />}
                          </TimelineSeparator>
                          <TimelineContent>
                            <Paper sx={{ p: 2, mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {reserva.servicio?.nombre || 'Servicio'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    <Person sx={{ fontSize: 16, mr: 0.5 }} />
                                    Cliente: {reserva.usuario?.nombre || 'Cliente'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                                    {reserva.hora_inicio} - {reserva.hora_fin}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    <AttachMoney sx={{ fontSize: 16, mr: 0.5 }} />
                                    ${reserva.precio_total}
                                  </Typography>
                                  {reserva.notas && (
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                      Notas: {reserva.notas}
                                    </Typography>
                                  )}
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  <Chip
                                    label={reserva.estado}
                                    size="small"
                                    sx={{
                                      bgcolor: getEstadoColor(reserva.estado),
                                      color: 'white',
                                      textTransform: 'capitalize'
                                    }}
                                  />
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleStatusChange(reserva)}
                                  >
                                    Actualizar
                                  </Button>
                                </Box>
                              </Box>
                            </Paper>
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  )} */}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Panel Lateral */}
                <Grid item xs={12} lg={4}>
                    {/* Estadísticas Semanales */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                Resumen Semanal
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Total Reservas:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {weeklyStats.totalReservas}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Completadas:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {weeklyStats.reservasCompletadas}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Horas Trabajadas:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {weeklyStats.horasTabajadas}h
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Ganancias:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                                        ${weeklyStats.gananciasSemana}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Calificación:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {weeklyStats.calificacionSemana > 0 ? `${weeklyStats.calificacionSemana}/5` : 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Notificaciones Recientes */}
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Notificaciones
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => navigate('/empleado/notificaciones')}
                                >
                                    <Visibility />
                                </IconButton>
                            </Box>

                            {notificaciones.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No hay notificaciones nuevas
                                </Typography>
                            ) : (
                                <List sx={{ p: 0 }}>
                                    {notificaciones.slice(0, 5).map((notif) => (
                                        <ListItem key={notif.id} sx={{ px: 0 }}>
                                            <ListItemIcon>
                                                <Badge
                                                    variant="dot"
                                                    color={notif.leida ? "default" : "error"}
                                                >
                                                    <Notifications
                                                        sx={{
                                                            fontSize: 20,
                                                            color: notif.leida ? '#757575' : '#1976d2'
                                                        }}
                                                    />
                                                </Badge>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={notif.titulo}
                                                secondary={notif.mensaje}
                                                primaryTypographyProps={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: notif.leida ? 400 : 600
                                                }}
                                                secondaryTypographyProps={{
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Dialog para actualizar estado de reserva */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Actualizar Estado de Reserva</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            select
                            fullWidth
                            label="Estado"
                            value={statusUpdate}
                            onChange={(e) => setStatusUpdate(e.target.value)}
                            sx={{ mb: 2 }}
                        >
                            <MenuItem value="pendiente">Pendiente</MenuItem>
                            <MenuItem value="confirmada">Confirmada</MenuItem>
                            <MenuItem value="completada">Completada</MenuItem>
                            <MenuItem value="cancelada">Cancelada</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Notas adicionales"
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder="Agregar comentarios sobre el servicio..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSaveStatusChange}
                        variant="contained"
                        sx={{ bgcolor: '#A8D8B9', '&:hover': { bgcolor: '#98c9a9' } }}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
