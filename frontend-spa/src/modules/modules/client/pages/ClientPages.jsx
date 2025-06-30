import React, { useState, useEffect } from 'react';
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
  Rating,
  Fab,
  CardActions
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
  Today,
  History,
  BookOnline,
  Favorite,
  FavoriteBorder,
  Phone,
  Email,
  LocationOn,
  RateReview
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../hooks';

export const ClientPages = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Estados para las métricas del cliente
  const [clientStats, setClientStats] = useState({
    totalReservas: 0,
    reservasCompletadas: 0,
    reservasPendientes: 0,
    reservasCanceladas: 0,
    dineroGastado: 0,
    serviciosFavoritos: 0,
    calificacionPromedio: 0,
    proximaReserva: null
  });

  const [proximasReservas, setProximasReservas] = useState([]);
  const [historialReservas, setHistorialReservas] = useState([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para diálogos
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedReservaForRating, setSelectedReservaForRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedReservaForCancel, setSelectedReservaForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Funciones para cargar datos desde API
  const loadClientStats = async () => {
    try {
      // TODO: Implementar llamada a API
      // const response = await api.get(`/cliente/${user.id}/stats`);
      // setClientStats(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas del cliente:', error);
    }
  };

  const loadUpcomingReservations = async () => {
    try {
      // TODO: Implementar llamada a API
      // const response = await api.get(`/cliente/${user.id}/reservas/proximas`);
      // setProximasReservas(response.data);
    } catch (error) {
      console.error('Error cargando próximas reservas:', error);
    }
  };

  const loadReservationHistory = async () => {
    try {
      // TODO: Implementar llamada a API
      // const response = await api.get(`/cliente/${user.id}/reservas/historial`);
      // setHistorialReservas(response.data);
    } catch (error) {
      console.error('Error cargando historial de reservas:', error);
    }
  };

  const loadAvailableServices = async () => {
    try {
      // TODO: Implementar llamada a API
      // const response = await api.get('/servicios/disponibles');
      // setServiciosDisponibles(response.data);
    } catch (error) {
      console.error('Error cargando servicios disponibles:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      // TODO: Implementar llamada a API
      // const response = await api.get(`/cliente/${user.id}/notificaciones`);
      // setNotificaciones(response.data);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  const submitRating = async () => {
    if (!selectedReservaForRating || rating === 0) return;

    try {
      // TODO: Implementar llamada a API
      // await api.post(`/reservas/${selectedReservaForRating.id}/calificar`, {
      //     puntuacion: rating,
      //     comentario: reviewComment,
      //     usuario_id: user.id
      // });

      // Actualizar estado local
      setHistorialReservas(prev =>
        prev.map(reserva =>
          reserva.id === selectedReservaForRating.id
            ? { ...reserva, calificacion: { puntuacion: rating, comentario: reviewComment } }
            : reserva
        )
      );

      setRatingDialogOpen(false);
      setSelectedReservaForRating(null);
      setRating(0);
      setReviewComment('');

    } catch (error) {
      console.error('Error enviando calificación:', error);
    }
  };

  const cancelReservation = async () => {
    if (!selectedReservaForCancel) return;

    try {
      // TODO: Implementar llamada a API
      // await api.put(`/reservas/${selectedReservaForCancel.id}/cancelar`, {
      //     motivo: cancelReason,
      //     usuario_id: user.id
      // });

      // Actualizar estado local
      setProximasReservas(prev =>
        prev.filter(reserva => reserva.id !== selectedReservaForCancel.id)
      );

      setCancelDialogOpen(false);
      setSelectedReservaForCancel(null);
      setCancelReason('');

      // Recargar estadísticas
      loadClientStats();

    } catch (error) {
      console.error('Error cancelando reserva:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadClientStats(),
        loadUpcomingReservations(),
        loadReservationHistory(),
        loadAvailableServices(),
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

  const MetricCard = ({ title, value, subtitle, icon, color, onClick }) => (
    <Card sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}15, ${color}05)`,
      border: `1px solid ${color}30`,
      transition: 'all 0.3s ease',
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': {
        transform: onClick ? 'translateY(-2px)' : 'none',
        boxShadow: onClick ? `0 8px 25px ${color}40` : 'none'
      }
    }}
      onClick={onClick}
    >
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
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const handleRateService = (reserva) => {
    setSelectedReservaForRating(reserva);
    setRatingDialogOpen(true);
  };

  const handleCancelReservation = (reserva) => {
    setSelectedReservaForCancel(reserva);
    setCancelDialogOpen(true);
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
        <Typography>Cargando información del cliente...</Typography>
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
              ¡Bienvenido, {user?.nombre || 'Cliente'}! 🌟
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
                onClick={() => navigate('/cliente/notificaciones')}
              >
                <Notifications />
              </IconButton>
            </Badge>
            <Button
              variant="contained"
              startIcon={<BookOnline />}
              sx={{
                bgcolor: '#A8D8B9',
                color: '#333',
                '&:hover': { bgcolor: '#98c9a9' }
              }}
              onClick={() => navigate('/cliente/reservar')}
            >
              Nueva Reserva
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Métricas del Cliente */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Reservas"
            value={clientStats.totalReservas}
            subtitle={`${clientStats.reservasCompletadas} completadas`}
            icon={<EventNote />}
            color="#A8D8B9"
            onClick={() => navigate('/cliente/historial')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Próximas Citas"
            value={clientStats.reservasPendientes}
            subtitle="Reservas confirmadas"
            icon={<Schedule />}
            color="#2196f3"
            onClick={() => navigate('/cliente/mis-reservas')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Invertido"
            value={`${clientStats.dineroGastado}`}
            subtitle="En servicios de spa"
            icon={<AttachMoney />}
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Mi Calificación"
            value={clientStats.calificacionPromedio > 0 ? `${clientStats.calificacionPromedio}/5` : 'N/A'}
            subtitle="Promedio dado"
            icon={<Star />}
            color="#ffc107"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Próximas Reservas */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Mis Próximas Citas ({proximasReservas.length})
                </Typography>
                <Button
                  startIcon={<BookOnline />}
                  onClick={() => navigate('/cliente/reservar')}
                  size="small"
                  variant="contained"
                  sx={{ bgcolor: '#A8D8B9', '&:hover': { bgcolor: '#98c9a9' } }}
                >
                  Reservar Nuevo
                </Button>
              </Box>

             {/*  {proximasReservas.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    No tienes reservas próximas
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => navigate('/cliente/reservar')}
                  >
                    Hacer una Reserva
                  </Button>
                </Box>
              ) : (
                <Timeline>
                  {proximasReservas.map((reserva, index) => (
                    <TimelineItem key={reserva.id}>
                      <TimelineSeparator>
                        <TimelineDot sx={{ bgcolor: getEstadoColor(reserva.estado) }}>
                          {getEstadoIcon(reserva.estado)}
                        </TimelineDot>
                        {index < proximasReservas.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Paper sx={{ p: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                {reserva.servicio?.nombre || 'Servicio'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                <Person sx={{ fontSize: 16, mr: 0.5 }} />
                                Especialista: {reserva.empleado?.usuario?.nombre || 'Por asignar'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                                {new Date(reserva.fecha).toLocaleDateString('es-ES')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                                {reserva.hora_inicio} - {reserva.hora_fin}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                <AttachMoney sx={{ fontSize: 16, mr: 0.5 }} />
                                ${reserva.precio_total}
                              </Typography>
                              {reserva.notas && (
                                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                  Notas: {reserva.notas}
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                              <Chip
                                label={reserva.estado}
                                size="small"
                                sx={{
                                  bgcolor: getEstadoColor(reserva.estado),
                                  color: 'white',
                                  textTransform: 'capitalize'
                                }}
                              />
                              {reserva.estado === 'pendiente' && (
                                <Button
                                  size="small"
                                  variant="text"
                                  color="error"
                                  onClick={() => handleCancelReservation(reserva)}
                                >
                                  Cancelar
                                </Button>
                              )}
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

          {/* Historial Reciente */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Historial Reciente
                </Typography>
                <Button
                  startIcon={<History />}
                  onClick={() => navigate('/cliente/historial')}
                  size="small"
                >
                  Ver Todo
                </Button>
              </Box>

              {historialReservas.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay historial de reservas
                </Typography>
              ) : (
                <List sx={{ p: 0 }}>
                  {historialReservas.slice(0, 5).map((reserva) => (
                    <ListItem key={reserva.id} sx={{ px: 0, py: 1 }}>
                      <ListItemIcon>
                        {getEstadoIcon(reserva.estado)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {reserva.servicio?.nombre || 'Servicio'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(reserva.fecha).toLocaleDateString('es-ES')}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="caption">
                              {reserva.empleado?.usuario?.nombre || 'Especialista'} - ${reserva.precio_total}
                            </Typography>
                            {reserva.estado === 'completada' && !reserva.calificacion && (
                              <Button
                                size="small"
                                startIcon={<Star />}
                                onClick={() => handleRateService(reserva)}
                              >
                                Calificar
                              </Button>
                            )}
                            {reserva.calificacion && (
                              <Rating
                                value={reserva.calificacion.puntuacion}
                                size="small"
                                readOnly
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Panel Lateral */}
        <Grid item xs={12} lg={4}>
          {/* Servicios Destacados */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Servicios Populares
              </Typography>

              {serviciosDisponibles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Cargando servicios...
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {serviciosDisponibles.slice(0, 4).map((servicio) => (
                    <Card key={servicio.id} variant="outlined" sx={{ p: 1 }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {servicio.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                              {servicio.duracion} min
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#A8D8B9' }}>
                              ${servicio.precio}
                            </Typography>
                          </Box>
                          <IconButton size="small">
                            <FavoriteBorder fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                        <Button
                          size="small"
                          fullWidth
                          onClick={() => navigate(`/cliente/reservar?servicio=${servicio.id}`)}
                        >
                          Reservar
                        </Button>
                      </CardActions>
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Notificaciones */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Notificaciones
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => navigate('/cliente/notificaciones')}
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

      {/* FAB para nueva reserva */}
      <Fab
        color="primary"
        aria-label="nueva reserva"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: '#A8D8B9',
          '&:hover': {
            bgcolor: '#98c9a9'
          }
        }}
        onClick={() => navigate('/cliente/reservar')}
      >
        <Add />
      </Fab>

      {/* Dialog para calificar servicio */}
      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Calificar Servicio</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedReservaForRating?.servicio?.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              ¿Cómo fue tu experiencia con este servicio?
            </Typography>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              size="large"
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comentarios (opcional)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Comparte tu experiencia para ayudar a otros clientes..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={submitRating}
            variant="contained"
            disabled={rating === 0}
            sx={{ bgcolor: '#A8D8B9', '&:hover': { bgcolor: '#98c9a9' } }}
          >
            Enviar Calificación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para cancelar reserva */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancelar Reserva</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              ¿Estás seguro de que deseas cancelar esta reserva?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Servicio:</strong> {selectedReservaForCancel?.servicio?.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              <strong>Fecha:</strong> {selectedReservaForCancel?.fecha && new Date(selectedReservaForCancel.fecha).toLocaleDateString('es-ES')} - {selectedReservaForCancel?.hora_inicio}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Motivo de cancelación (opcional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Compártenos el motivo de la cancelación..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Mantener Reserva
          </Button>
          <Button
            onClick={cancelReservation}
            variant="contained"
            color="error"
          >
            Confirmar Cancelación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
