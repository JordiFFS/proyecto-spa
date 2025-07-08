import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Fade,
    Skeleton,
    Alert,
    Badge
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    Today,
    CalendarToday,
    Person,
    Work,
    AttachMoney,
    Check,
    Pending,
    Cancel,
    Notes,
    Close,
    AccessTime,
    Phone,
    Email,
    Schedule
} from '@mui/icons-material';
import { useReservaStore } from '../../../../../store';
import { useNavigate } from 'react-router-dom';

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const ReservacionCalendario = () => {
    const navigate = useNavigate();
    const [fechaActual, setFechaActual] = useState(new Date());
    const [vistaCalendario, setVistaCalendario] = useState('mes');
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [cargando, setCargando] = useState(false);

    const {
        reservas,
        startLoadingReserva,
    } = useReservaStore();


    // Verificar si tenemos datos de reservas
    const datosReservas = reservas || [];
    console.log('reservas', datosReservas);

    useEffect(() => {
        cargarReservas();
    }, [fechaActual, vistaCalendario, filtroEstado]);

    const cargarReservas = async () => {
        setCargando(true);
        try {
            const fechaInicio = obtenerFechaInicio();
            const fechaFin = obtenerFechaFin();

            const queryParams = {
                fecha_inicio: fechaInicio.toISOString().split('T')[0],
                fecha_fin: fechaFin.toISOString().split('T')[0],
                limit: 1000
            };

            if (filtroEstado !== 'todos') {
                queryParams.estado = filtroEstado;
            }

            await startLoadingReserva(queryParams);
        } catch (error) {
            console.error('Error cargando reservas:', error);
        } finally {
            setCargando(false);
        }
    };

    const obtenerFechaInicio = () => {
        const fecha = new Date(fechaActual);
        if (vistaCalendario === 'mes') {
            const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
            const diaSemana = primerDia.getDay();
            primerDia.setDate(primerDia.getDate() - diaSemana);
            return primerDia;
        } else if (vistaCalendario === 'semana') {
            const inicioSemana = new Date(fecha);
            inicioSemana.setDate(fecha.getDate() - fecha.getDay());
            return inicioSemana;
        } else {
            return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
        }
    };

    const obtenerFechaFin = () => {
        const fecha = new Date(fechaActual);
        if (vistaCalendario === 'mes') {
            const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
            const diaSemana = ultimoDia.getDay();
            ultimoDia.setDate(ultimoDia.getDate() + (6 - diaSemana));
            return ultimoDia;
        } else if (vistaCalendario === 'semana') {
            const finSemana = new Date(fecha);
            finSemana.setDate(fecha.getDate() - fecha.getDay() + 6);
            return finSemana;
        } else {
            return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
        }
    };

    const navegarPeriodo = (direccion) => {
        const nuevaFecha = new Date(fechaActual);
        if (vistaCalendario === 'mes') {
            nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
        } else if (vistaCalendario === 'semana') {
            nuevaFecha.setDate(nuevaFecha.getDate() + (direccion * 7));
        } else {
            nuevaFecha.setDate(nuevaFecha.getDate() + direccion);
        }
        setFechaActual(nuevaFecha);
    };

    const irHoy = () => {
        setFechaActual(new Date());
    };

    const obtenerReservasPorFecha = (fecha) => {
        const fechaStr = fecha.toISOString().split('T')[0];
        return datosReservas.filter(reserva => reserva.fecha === fechaStr) || [];
    };

    const obtenerColorEstado = (estado) => {
        switch (estado) {
            case 'confirmada':
                return '#4caf50';
            case 'pendiente':
                return '#ff9800';
            case 'cancelada':
                return '#f44336';
            case 'completada':
                return '#2196f3';
            default:
                return '#9e9e9e';
        }
    };

    const obtenerIconoEstado = (estado) => {
        switch (estado) {
            case 'confirmada':
                return <Check fontSize="small" />;
            case 'pendiente':
                return <Pending fontSize="small" />;
            case 'cancelada':
                return <Cancel fontSize="small" />;
            case 'completada':
                return <Check fontSize="small" />;
            default:
                return <Schedule fontSize="small" />;
        }
    };

    const abrirDetalleReserva = (reserva) => {
        setReservaSeleccionada(reserva);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setReservaSeleccionada(null);
    };

    const verDetalleCompleto = () => {
        navigate(`/admin/reservas/view?id=${reservaSeleccionada.id}`);
        cerrarModal();
    };

    const generarDiasCalendario = () => {
        const fechaInicio = obtenerFechaInicio();
        const fechaFin = obtenerFechaFin();
        const dias = [];

        const fechaActualIterar = new Date(fechaInicio);
        while (fechaActualIterar <= fechaFin) {
            dias.push(new Date(fechaActualIterar));
            fechaActualIterar.setDate(fechaActualIterar.getDate() + 1);
        }

        return dias;
    };

    const formatearTitulo = () => {
        if (vistaCalendario === 'mes') {
            return `${MESES[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;
        } else if (vistaCalendario === 'semana') {
            const inicioSemana = new Date(fechaActual);
            inicioSemana.setDate(fechaActual.getDate() - fechaActual.getDay());
            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6);
            return `${inicioSemana.getDate()} - ${finSemana.getDate()} de ${MESES[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;
        } else {
            return `${fechaActual.getDate()} de ${MESES[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;
        }
    };

    const renderizarVistaCalendario = () => {
        if (cargando) {
            return <Skeleton variant="rectangular" width="100%" height={400} />;
        }

        if (vistaCalendario === 'mes') {
            return renderizarVistaMes();
        } else if (vistaCalendario === 'semana') {
            return renderizarVistaSemana();
        } else {
            return renderizarVistaDia();
        }
    };

    const renderizarVistaMes = () => {
        const dias = generarDiasCalendario();
        const semanas = [];

        for (let i = 0; i < dias.length; i += 7) {
            semanas.push(dias.slice(i, i + 7));
        }

        return (
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                {/* Header días de la semana */}
                <Grid container spacing={1} sx={{ mb: 1 }}>
                    {DIAS_SEMANA.map(dia => (
                        <Grid item xs key={dia}>
                            <Typography
                                variant="subtitle2"
                                align="center"
                                color="text.secondary"
                                fontWeight="600"
                                sx={{ py: 1, px: 2 }}
                            >
                                {dia}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>

                {/* Semanas */}
                {semanas.map((semana, indice) => (
                    <Grid container spacing={1} key={indice} sx={{ mb: 1 }}>
                        {semana.map(fecha => {
                            const reservasDia = obtenerReservasPorFecha(fecha);
                            const esHoy = fecha.toDateString() === new Date().toDateString();
                            const esMesActual = fecha.getMonth() === fechaActual.getMonth();

                            return (
                                <Grid item xs key={fecha.toDateString()}>
                                    <Paper
                                        elevation={esHoy ? 3 : 1}
                                        sx={{
                                            minHeight: 140,
                                            p: 1.5,
                                            backgroundColor: esHoy ? 'primary.50' : 'white',
                                            border: esHoy ? '2px solid' : '1px solid',
                                            borderColor: esHoy ? 'primary.main' : 'divider',
                                            opacity: esMesActual ? 1 : 0.6,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                elevation: 2,
                                                backgroundColor: esHoy ? 'primary.100' : 'grey.50'
                                            }
                                        }}
                                        onClick={() => {
                                            setFechaActual(new Date(fecha));
                                            setVistaCalendario('dia');
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography
                                                variant="body1"
                                                color={esHoy ? 'primary.main' : 'text.primary'}
                                                fontWeight={esHoy ? 'bold' : 'normal'}
                                            >
                                                {fecha.getDate()}
                                            </Typography>
                                            {reservasDia.length > 0 && (
                                                <Badge badgeContent={reservasDia.length} color="primary" />
                                            )}
                                        </Box>

                                        {reservasDia.slice(0, 2).map((reserva, idx) => (
                                            <Fade in={true} timeout={300 + idx * 100} key={reserva.id}>
                                                <Box
                                                    sx={{
                                                        backgroundColor: obtenerColorEstado(reserva.estado),
                                                        color: 'white',
                                                        fontSize: '0.75rem',
                                                        p: 0.5,
                                                        mt: 0.5,
                                                        borderRadius: 1,
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.2s ease',
                                                        '&:hover': {
                                                            transform: 'scale(1.02)'
                                                        }
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        abrirDetalleReserva(reserva);
                                                    }}
                                                >
                                                    <Box display="flex" alignItems="center" gap={0.5}>
                                                        <AccessTime fontSize="inherit" />
                                                        <Typography variant="inherit" fontWeight="500">
                                                            {reserva.hora_inicio?.slice(0, 5)}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="inherit" noWrap>
                                                        {reserva.Usuario?.nombre || 'Sin nombre'}
                                                    </Typography>
                                                </Box>
                                            </Fade>
                                        ))}

                                        {reservasDia.length > 2 && (
                                            <Typography variant="caption" color="primary" fontWeight="500" sx={{ mt: 0.5 }}>
                                                +{reservasDia.length - 2} más
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>
                ))}
            </Paper>
        );
    };

    const renderizarVistaSemana = () => {
        const dias = generarDiasCalendario();

        return (
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={2}>
                    {dias.map(fecha => {
                        const reservasDia = obtenerReservasPorFecha(fecha);
                        const esHoy = fecha.toDateString() === new Date().toDateString();

                        return (
                            <Grid item xs key={fecha.toDateString()}>
                                <Paper
                                    elevation={esHoy ? 3 : 1}
                                    sx={{
                                        minHeight: 450,
                                        p: 2,
                                        backgroundColor: esHoy ? 'primary.50' : 'white',
                                        border: esHoy ? '2px solid' : '1px solid',
                                        borderColor: esHoy ? 'primary.main' : 'divider',
                                        borderRadius: 2
                                    }}
                                >
                                    <Box textAlign="center" mb={2}>
                                        <Typography
                                            variant="h6"
                                            color={esHoy ? 'primary.main' : 'text.primary'}
                                            fontWeight="bold"
                                        >
                                            {DIAS_SEMANA[fecha.getDay()]}
                                        </Typography>
                                        <Typography variant="h4" color="text.secondary">
                                            {fecha.getDate()}
                                        </Typography>
                                        <Badge badgeContent={reservasDia.length} color="primary" />
                                    </Box>

                                    {reservasDia.map((reserva, idx) => (
                                        <Fade in={true} timeout={300 + idx * 100} key={reserva.id}>
                                            <Card
                                                elevation={2}
                                                sx={{
                                                    mb: 1,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        boxShadow: 4,
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}
                                                onClick={() => abrirDetalleReserva(reserva)}
                                            >
                                                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                        <Box
                                                            sx={{
                                                                width: 12,
                                                                height: 12,
                                                                borderRadius: '50%',
                                                                backgroundColor: obtenerColorEstado(reserva.estado)
                                                            }}
                                                        />
                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                            {reserva.hora_inicio?.slice(0, 5)} - {reserva.hora_fin?.slice(0, 5)}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" fontWeight="500" noWrap>
                                                        {reserva.Usuario?.nombre || 'Sin nombre'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" noWrap>
                                                        {reserva.Servicio?.nombre || 'Sin servicio'}
                                                    </Typography>
                                                    <Typography variant="caption" color="primary" fontWeight="500">
                                                        ${reserva.precio_total}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Fade>
                                    ))}

                                    {reservasDia.length === 0 && (
                                        <Box textAlign="center" py={4}>
                                            <Typography variant="body2" color="text.secondary">
                                                Sin reservas
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            </Paper>
        );
    };

    const renderizarVistaDia = () => {
        const reservasDia = obtenerReservasPorFecha(fechaActual);

        return (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold">
                        Reservas del día
                    </Typography>
                    <Chip
                        label={`${reservasDia.length} reservas`}
                        color="primary"
                        variant="outlined"
                    />
                </Box>
                <Divider sx={{ mb: 3 }} />

                {reservasDia.length === 0 ? (
                    <Box textAlign="center" py={6}>
                        <CalendarToday sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            No hay reservas para este día
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Las reservas aparecerán aquí cuando sean creadas
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ width: '100%' }}>
                        {reservasDia.map((reserva, idx) => (
                            <Fade in={true} timeout={300 + idx * 100} key={reserva.id}>
                                <ListItem
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                        mb: 2,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                            transform: 'translateX(4px)'
                                        }
                                    }}
                                    onClick={() => abrirDetalleReserva(reserva)}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            sx={{
                                                backgroundColor: obtenerColorEstado(reserva.estado),
                                                width: 48,
                                                height: 48
                                            }}
                                        >
                                            {obtenerIconoEstado(reserva.estado)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={2} mb={1}>
                                                <Typography variant="h6" fontWeight="bold">
                                                    {reserva.hora_inicio?.slice(0, 5)} - {reserva.hora_fin?.slice(0, 5)}
                                                </Typography>
                                                <Chip
                                                    label={reserva.estado}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: obtenerColorEstado(reserva.estado),
                                                        color: 'white',
                                                        textTransform: 'capitalize',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                                <Typography variant="h6" color="primary" fontWeight="bold">
                                                    ${reserva.precio_total}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={4}>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Person fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {reserva.Usuario?.nombre || 'Sin nombre'}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Work fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {reserva.Servicio?.nombre || 'Sin servicio'}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Person fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {reserva.Empleado?.Usuario?.nombre || 'Sin asignar'}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        }
                                    />
                                </ListItem>
                            </Fade>
                        ))}
                    </List>
                )}
            </Paper>
        );
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                        Calendario de Reservaciones
                    </Typography>
                    <Box display="flex" gap={2} flexWrap="wrap">
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={filtroEstado}
                                label="Estado"
                                onChange={(e) => setFiltroEstado(e.target.value)}
                            >
                                <MenuItem value="todos">Todos</MenuItem>
                                <MenuItem value="pendiente">Pendiente</MenuItem>
                                <MenuItem value="confirmada">Confirmada</MenuItem>
                                <MenuItem value="completada">Completada</MenuItem>
                                <MenuItem value="cancelada">Cancelada</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Vista</InputLabel>
                            <Select
                                value={vistaCalendario}
                                label="Vista"
                                onChange={(e) => setVistaCalendario(e.target.value)}
                            >
                                <MenuItem value="mes">Mes</MenuItem>
                                <MenuItem value="semana">Semana</MenuItem>
                                <MenuItem value="dia">Día</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </Paper>

            {/* Navegación */}
            <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton
                            onClick={() => navegarPeriodo(-1)}
                            sx={{
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': { backgroundColor: 'primary.dark' }
                            }}
                        >
                            <ChevronLeft />
                        </IconButton>
                        <Typography variant="h5" fontWeight="bold" sx={{ minWidth: 250, textAlign: 'center' }}>
                            {formatearTitulo()}
                        </Typography>
                        <IconButton
                            onClick={() => navegarPeriodo(1)}
                            sx={{
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': { backgroundColor: 'primary.dark' }
                            }}
                        >
                            <ChevronRight />
                        </IconButton>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Today />}
                        onClick={irHoy}
                        sx={{ borderRadius: 2 }}
                    >
                        Hoy
                    </Button>
                </Box>
            </Paper>

            {/* Información de estado */}
            {datosReservas.length > 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Se encontraron {datosReservas.length} reservas en el período seleccionado
                </Alert>
            )}

            {/* Calendario */}
            {renderizarVistaCalendario()}

            {/* Modal de detalles */}
            <Dialog
                open={modalAbierto}
                onClose={cerrarModal}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" fontWeight="bold">
                            Detalles de la Reserva
                        </Typography>
                        <IconButton onClick={cerrarModal} sx={{ color: 'text.secondary' }}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>

                {reservaSeleccionada && (
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                                        <CalendarToday color="primary" />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Fecha y Hora
                                            </Typography>
                                            <Typography variant="h6" fontWeight="bold">
                                                {new Date(reservaSeleccionada.fecha).toLocaleDateString('es-ES', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </Typography>
                                            <Typography variant="body1" color="primary" fontWeight="bold">
                                                {reservaSeleccionada.hora_inicio?.slice(0, 5)} - {reservaSeleccionada.hora_fin?.slice(0, 5)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Estado
                                        </Typography>
                                        <Chip
                                            label={reservaSeleccionada.estado}
                                            color={
                                                reservaSeleccionada.estado === 'confirmada' ? 'success' :
                                                    reservaSeleccionada.estado === 'pendiente' ? 'warning' :
                                                        reservaSeleccionada.estado === 'cancelada' ? 'error' :
                                                            'info'
                                            }
                                            icon={obtenerIconoEstado(reservaSeleccionada.estado)}
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Person color="action" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Cliente
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            {reservaSeleccionada.Usuario?.nombre || 'Sin nombre'}
                                        </Typography>
                                        {reservaSeleccionada.Usuario?.email && (
                                            <Typography variant="body2" color="text.secondary">
                                                {reservaSeleccionada.Usuario.email}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Work color="action" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Servicio
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            {reservaSeleccionada.Servicio?.nombre || 'Sin servicio'}
                                        </Typography>
                                        {reservaSeleccionada.Servicio?.descripcion && (
                                            <Typography variant="body2" color="text.secondary">
                                                {reservaSeleccionada.Servicio.descripcion}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Person color="action" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Empleado
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            {reservaSeleccionada.Empleado?.Usuario?.nombre || 'Sin asignar'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <AttachMoney color="action" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Precio Total
                                        </Typography>
                                        <Typography variant="h6" color="primary" fontWeight="bold">
                                            ${reservaSeleccionada.precio_total}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            {reservaSeleccionada.notas && (
                                <Grid item xs={12}>
                                    <Box display="flex" gap={1} mb={2}>
                                        <Notes color="action" />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Notas
                                            </Typography>
                                            <Paper sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                                                <Typography variant="body2">
                                                    {reservaSeleccionada.notas}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </DialogContent>
                )}

                <DialogActions>
                    <Button onClick={cerrarModal}>
                        Cerrar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={verDetalleCompleto}
                        startIcon={<CalendarToday />}
                    >
                        Ver Detalles Completos
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};