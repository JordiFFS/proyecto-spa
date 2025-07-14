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
    LinearProgress,
    Divider,
    IconButton,
    Alert,
    Paper
} from '@mui/material';
import {
    Dashboard,
    People,
    WorkOutline,
    EventNote,
    RoomService,
    Assessment,
    Notifications,
    TrendingUp,
    TrendingDown,
    AttachMoney,
    Schedule,
    CalendarToday,
    Warning,
    CheckCircle,
    Cancel,
    Pending,
    Star,
    Group,
    Add,
    Visibility,
    Edit
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const AdminPages = () => {
    const navigate = useNavigate();
    
    // Estados para métricas (en un proyecto real vendrían de APIs)
    const [metrics, setMetrics] = useState({
        totalUsuarios: 145,
        empleadosActivos: 12,
        reservasHoy: 23,
        ingresosMes: 45600,
        serviciosActivos: 18,
        reservasPendientes: 8,
        empleadosDisponibles: 9,
        calificacionPromedio: 4.7
    });

    const [recentActivity, setRecentActivity] = useState([
        { id: 1, tipo: 'reserva', descripcion: 'Nueva reserva de María González', tiempo: '5 min', icono: <EventNote />, color: '#4caf50' },
        { id: 2, tipo: 'usuario', descripcion: 'Nuevo cliente registrado: Carlos Ruiz', tiempo: '12 min', icono: <People />, color: '#2196f3' },
        { id: 3, tipo: 'servicio', descripcion: 'Servicio "Masaje Relajante" actualizado', tiempo: '1 h', icono: <RoomService />, color: '#ff9800' },
        { id: 4, tipo: 'empleado', descripcion: 'Ana Pérez cambió su disponibilidad', tiempo: '2 h', icono: <WorkOutline />, color: '#9c27b0' }
    ]);

    const [reservasEstado] = useState([
        { estado: 'Pendientes', cantidad: 8, color: '#ff9800', porcentaje: 35 },
        { estado: 'Confirmadas', cantidad: 12, color: '#2196f3', porcentaje: 52 },
        { estado: 'Completadas', cantidad: 87, color: '#4caf50', porcentaje: 78 },
        { estado: 'Canceladas', cantidad: 3, color: '#f44336', porcentaje: 13 }
    ]);

    const [topServicios] = useState([
        { nombre: 'Masaje Relajante', reservas: 34, ingresos: 12400, rating: 4.8 },
        { nombre: 'Facial Anti-edad', reservas: 28, ingresos: 9800, rating: 4.9 },
        { nombre: 'Pedicure Spa', reservas: 25, ingresos: 7500, rating: 4.6 },
        { nombre: 'Manicure Gel', reservas: 22, ingresos: 6600, rating: 4.7 }
    ]);

    const [alertas] = useState([
        { tipo: 'warning', mensaje: '3 empleados no han actualizado su disponibilidad para mañana', prioridad: 'alta' },
        { tipo: 'info', mensaje: 'Promoción de febrero termina en 5 días', prioridad: 'media' },
        { tipo: 'error', mensaje: '2 reservas requieren confirmación urgente', prioridad: 'alta' }
    ]);

    const MetricCard = ({ title, value, subtitle, icon, color, trend, trendValue }) => (
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
                            {typeof value === 'number' && title.includes('Ingresos') 
                                ? `$${value.toLocaleString()}` 
                                : value}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
                            {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                        {trend && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                {trend === 'up' ? <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} /> : <TrendingDown sx={{ fontSize: 16, color: '#f44336' }} />}
                                <Typography variant="caption" sx={{ ml: 0.5, color: trend === 'up' ? '#4caf50' : '#f44336' }}>
                                    {trendValue}% vs mes anterior
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

    const QuickActionButton = ({ title, description, icon, color, onClick }) => (
        <Button
            variant="outlined"
            onClick={onClick}
            sx={{
                p: 2,
                height: '100%',
                borderColor: `${color}50`,
                borderWidth: 2,
                '&:hover': {
                    borderColor: color,
                    bgcolor: `${color}10`,
                    transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease'
            }}
        >
            <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: color, width: 40, height: 40, mx: 'auto', mb: 1 }}>
                    {icon}
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                    {title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {description}
                </Typography>
            </Box>
        </Button>
    );

    return (
        <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a202c', mb: 1 }}>
                    Dashboard Administrativo
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Resumen general del spa y métricas clave
                </Typography>
            </Box>

            {/* Alertas */}
            {alertas.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    {alertas.map((alerta, index) => (
                        <Alert 
                            key={index}
                            severity={alerta.tipo}
                            sx={{ mb: 1 }}
                            action={
                                <IconButton size="small">
                                    <Visibility />
                                </IconButton>
                            }
                        >
                            {alerta.mensaje}
                        </Alert>
                    ))}
                </Box>
            )}

            {/* Métricas Principales */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Total Usuarios"
                        value={metrics.totalUsuarios}
                        subtitle="Clientes registrados"
                        icon={<People />}
                        color="#667eea"
                        trend="up"
                        trendValue={12}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Empleados Activos"
                        value={metrics.empleadosActivos}
                        subtitle={`${metrics.empleadosDisponibles} disponibles hoy`}
                        icon={<WorkOutline />}
                        color="#4caf50"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Reservas Hoy"
                        value={metrics.reservasHoy}
                        subtitle={`${metrics.reservasPendientes} pendientes`}
                        icon={<EventNote />}
                        color="#ff9800"
                        trend="up"
                        trendValue={8}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Ingresos del Mes"
                        value={metrics.ingresosMes}
                        subtitle="Comparado con mes anterior"
                        icon={<AttachMoney />}
                        color="#8e7ab5"
                        trend="up"
                        trendValue={23}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Acciones Rápidas */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                                <Dashboard sx={{ mr: 1, color: '#667eea' }} />
                                Acciones Rápidas
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <QuickActionButton
                                        title="Nuevo Usuario"
                                        description="Registrar cliente"
                                        icon={<Add />}
                                        color="#667eea"
                                        onClick={() => navigate('/admin/usuarios/form')}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <QuickActionButton
                                        title="Ver Reservas"
                                        description="Gestionar citas"
                                        icon={<EventNote />}
                                        color="#ff9800"
                                        onClick={() => navigate('/admin/reservas')}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <QuickActionButton
                                        title="Empleados"
                                        description="Gestionar equipo"
                                        icon={<WorkOutline />}
                                        color="#4caf50"
                                        onClick={() => navigate('/admin/empleados')}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <QuickActionButton
                                        title="Reportes"
                                        description="Ver estadísticas"
                                        icon={<Assessment />}
                                        color="#8e7ab5"
                                        onClick={() => navigate('/admin/reportes/ventas')}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Estado de Reservas */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                                <EventNote sx={{ mr: 1, color: '#667eea' }} />
                                Estado de Reservas
                            </Typography>
                            {reservasEstado.map((item, index) => (
                                <Box key={index} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {item.estado}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: item.color }}>
                                            {item.cantidad}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={item.porcentaje}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            bgcolor: `${item.color}20`,
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: item.color,
                                                borderRadius: 3
                                            }
                                        }}
                                    />
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Actividad Reciente */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                                <Notifications sx={{ mr: 1, color: '#667eea' }} />
                                Actividad Reciente
                            </Typography>
                            <List dense>
                                {recentActivity.map((item, index) => (
                                    <React.Fragment key={item.id}>
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemIcon>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: `${item.color}20` }}>
                                                    {React.cloneElement(item.icono, { sx: { fontSize: 16, color: item.color } })}
                                                </Avatar>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.descripcion}
                                                secondary={`Hace ${item.tiempo}`}
                                                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                                secondaryTypographyProps={{ variant: 'caption' }}
                                            />
                                        </ListItem>
                                        {index < recentActivity.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Servicios */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                                <RoomService sx={{ mr: 1, color: '#667eea' }} />
                                Servicios Más Populares
                            </Typography>
                            <List>
                                {topServicios.map((servicio, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                            {servicio.nombre}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Star sx={{ fontSize: 16, color: '#ffc107' }} />
                                                            <Typography variant="body2">{servicio.rating}</Typography>
                                                        </Box>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {servicio.reservas} reservas este mes
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                                                            ${servicio.ingresos.toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < topServicios.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Resumen de Empleados */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                                <Group sx={{ mr: 1, color: '#667eea' }} />
                                Estado del Equipo
                            </Typography>
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                                    {metrics.empleadosDisponibles}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Empleados disponibles hoy
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Chip 
                                    label="Activos" 
                                    size="small" 
                                    sx={{ bgcolor: '#4caf5020', color: '#4caf50' }}
                                />
                                <Typography variant="body2">{metrics.empleadosActivos}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Chip 
                                    label="Ocupados" 
                                    size="small" 
                                    sx={{ bgcolor: '#ff980020', color: '#ff9800' }}
                                />
                                <Typography variant="body2">3</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Chip 
                                    label="Descanso" 
                                    size="small" 
                                    sx={{ bgcolor: '#f4433620', color: '#f44336' }}
                                />
                                <Typography variant="body2">0</Typography>
                            </Box>
                            <Button
                                fullWidth
                                variant="outlined"
                                sx={{ mt: 2 }}
                                onClick={() => navigate('/admin/empleados')}
                            >
                                Ver Detalles
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};