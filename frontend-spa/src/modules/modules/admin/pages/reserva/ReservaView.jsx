import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    Divider,
    Paper,
    IconButton,
    Tooltip,
    Alert
} from "@mui/material";
import {
    ArrowBack,
    Edit,
    Delete,
    Check,
    Cancel,
    Pending,
    Person,
    Work,
    Schedule,
    CalendarToday,
    AttachMoney,
    Notes,
    Phone,
    Email
} from "@mui/icons-material";
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReservaStore } from "../../../../../store";
import Swal from 'sweetalert2';

export const ReservaView = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const reservaId = searchParams.get('id');

    const {
        active: reserva,
        startLoadingReservaById,
        startDeletingReserva,
        startChangeReservaStatus,
    } = useReservaStore();

    useEffect(() => {
        if (reservaId) {
            startLoadingReservaById(reservaId);
        }
    }, [reservaId]);

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'confirmada':
                return 'success';
            case 'pendiente':
                return 'warning';
            case 'cancelada':
                return 'error';
            case 'completada':
                return 'info';
            default:
                return 'default';
        }
    };

    const getEstadoIcon = (estado) => {
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
                return null;
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleEdit = () => {
        navigate(`/admin/reservas/form?id=${reserva.id}`);
    };

    const handleStatusChange = async (newStatus) => {
        const statusMessages = {
            'confirmada': 'confirmar',
            'cancelada': 'cancelar',
            'completada': 'completar'
        };

        const result = await Swal.fire({
            title: `¿${statusMessages[newStatus]} reserva?`,
            text: `${reserva.Usuario?.nombre} - ${reserva.fecha} ${reserva.hora_inicio}`,
            icon: newStatus === 'cancelada' ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonText: `Sí, ${statusMessages[newStatus]}`,
            cancelButtonText: "Cancelar",
            confirmButtonColor: newStatus === 'cancelada' ? '#d33' : '#3085d6'
        });

        if (result.isConfirmed) {
            await startChangeReservaStatus(reserva.id, newStatus);
            Swal.fire(
                "Actualizado",
                `La reserva ha sido ${statusMessages[newStatus]}da.`,
                "success"
            );
            // Recargar los datos de la reserva
            startLoadingReservaById(reserva.id);
        }
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: `¿Eliminar reserva?`,
            text: `${reserva.Usuario?.nombre} - ${reserva.fecha} ${reserva.hora_inicio}`,
            icon: "error",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: '#d33'
        });

        if (result.isConfirmed) {
            await startDeletingReserva(reserva);
            Swal.fire("Eliminado", "La reserva ha sido eliminada.", "success");
            navigate('/admin/reservas');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'No especificada';
        return timeString.slice(0, 5); // Obtener solo HH:MM
    };

    if (!reserva) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error">
                    No se encontró la reserva solicitada.
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBack}
                    sx={{ mt: 2 }}
                >
                    Volver
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton onClick={handleBack}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5">
                        Reserva #{reserva.id}
                    </Typography>
                    <Chip
                        label={reserva.estado}
                        color={getEstadoColor(reserva.estado)}
                        icon={getEstadoIcon(reserva.estado)}
                        sx={{ textTransform: 'capitalize' }}
                    />
                </Box>

                <Box display="flex" gap={1}>
                    {/* <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={handleEdit}
                    >
                        Editar
                    </Button> */}

                    {reserva.estado === 'pendiente' && (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<Check />}
                            onClick={() => handleStatusChange('confirmada')}
                        >
                            Confirmar
                        </Button>
                    )}

                    {(reserva.estado === 'pendiente' || reserva.estado === 'confirmada') && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => handleStatusChange('cancelada')}
                        >
                            Cancelar
                        </Button>
                    )}

                    {reserva.estado === 'confirmada' && (
                        <Button
                            variant="contained"
                            color="info"
                            startIcon={<Check />}
                            onClick={() => handleStatusChange('completada')}
                        >
                            Completar
                        </Button>
                    )}

                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={handleDelete}
                    >
                        Eliminar
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Información Principal */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Información de la Reserva
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                                        <CalendarToday color="action" />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Fecha
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {formatDate(reserva.fecha)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                                        <Schedule color="action" />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Horario
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {formatTime(reserva.hora_inicio)} - {formatTime(reserva.hora_fin)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                                        <Work color="action" />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Servicio
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {reserva.Servicio?.nombre || 'Servicio no especificado'}
                                            </Typography>
                                            {reserva.Servicio?.descripcion && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {reserva.Servicio.descripcion}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                                        <AttachMoney color="action" />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Precio Total
                                            </Typography>
                                            <Typography variant="h6" color="primary" fontWeight="bold">
                                                ${reserva.precio_total}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                {reserva.notas && (
                                    <Grid item xs={12}>
                                        <Box display="flex" gap={1} mb={2}>
                                            <Notes color="action" />
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Notas
                                                </Typography>
                                                <Paper sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                                                    <Typography variant="body2">
                                                        {reserva.notas}
                                                    </Typography>
                                                </Paper>
                                            </Box>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Información de Participantes */}
                <Grid item xs={12} md={4}>
                    <Grid container spacing={2}>
                        {/* Cliente */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Cliente
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />

                                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                                        <Person color="action" />
                                        <Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {reserva.Usuario?.nombre || 'Cliente no especificado'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                ID: {reserva.usuario_id}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {reserva.Usuario?.email && (
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <Email color="action" fontSize="small" />
                                            <Typography variant="body2">
                                                {reserva.Usuario.email}
                                            </Typography>
                                        </Box>
                                    )}

                                    {reserva.Usuario?.telefono && (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Phone color="action" fontSize="small" />
                                            <Typography variant="body2">
                                                {reserva.Usuario.telefono}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Empleado */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Empleado Asignado
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />

                                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                                        <Person color="action" />
                                        <Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {reserva.Empleado?.Usuario?.nombre || 'Empleado no especificado'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                ID: {reserva.empleado_id}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {reserva.Empleado?.Usuario?.email && (
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <Email color="action" fontSize="small" />
                                            <Typography variant="body2">
                                                {reserva.Empleado.Usuario.email}
                                            </Typography>
                                        </Box>
                                    )}

                                    {reserva.Empleado?.Usuario?.telefono && (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Phone color="action" fontSize="small" />
                                            <Typography variant="body2">
                                                {reserva.Empleado.Usuario.telefono}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Información de Fechas */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Información del Sistema
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />

                                    <Typography variant="body2" color="text.secondary">
                                        Creado: {new Date(reserva.createdAt).toLocaleString('es-ES')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Actualizado: {new Date(reserva.updatedAt).toLocaleString('es-ES')}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};