import {
    Box,
    Button,
    IconButton,
    Typography,
    Tooltip,
    Chip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useReservaStore } from "../../../../../store";
import { useAuthStore } from "../../../../../hooks";

export const ReservaPages = () => {
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        search: '',
        fecha: '',
        fecha_inicio: '',
        fecha_fin: '',
        usuario_id: '',
        empleado_id: '',
        servicio_id: '',
        estado: ''
    });

    const {
        isLoading,
        reservas,
        startLoadingReserva,
        startSetActiveReserva,
        startDeletingReserva,
        startChangeReservaStatus,
    } = useReservaStore();

    const {
        user
    } = useAuthStore();

    useEffect(() => {
        // Agregar filtro automático según el rol del usuario
        const roleFilters = {};

        if (user.rol === 'cliente') {
            roleFilters.usuario_id = user.id;
        } else if (user.rol === 'empleado') {
            // Asumiendo que tienes el empleado_id en el user object
            roleFilters.search = reservas.empleado_id; // o como tengas configurado
        }

        startLoadingReserva(roleFilters);
    }, [user]);

    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };

        // Mantener filtros automáticos según el rol
        if (user.rol === 'cliente') {
            newFilters.usuario_id = user.id;
        } else if (user.rol === 'empleado') {
            newFilters.search = reservas.empleado_id;
        }

        setFilters(newFilters);

        // Aplicar filtros con debounce para search
        if (field === 'search') {
            const timeoutId = setTimeout(() => {
                startLoadingReserva(newFilters);
            }, 500);
            return () => clearTimeout(timeoutId);
        } else {
            startLoadingReserva(newFilters);
        }
    };

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
                return <CheckIcon fontSize="small" />;
            case 'pendiente':
                return <PendingIcon fontSize="small" />;
            case 'cancelada':
                return <CancelIcon fontSize="small" />;
            case 'completada':
                return <CheckIcon fontSize="small" />;
            default:
                return null;
        }
    };

    const columns = [
        { field: "id", headerName: "ID", width: 70 },
        {
            field: "usuario_nombre",
            headerName: "Cliente",
            flex: 1.2,
            renderCell: ({ row }) => {
                return row.Usuario?.nombre || `ID: ${row.usuario_id}`;
            }
        },
        {
            field: "empleado_nombre",
            headerName: "Empleado",
            flex: 1.2,
            renderCell: ({ row }) => {
                return row.Empleado?.Usuario?.nombre || `ID: ${row.empleado_id}`;
            }
        },
        {
            field: "servicio_nombre",
            headerName: "Servicio",
            flex: 1.2,
            renderCell: ({ row }) => {
                return row.Servicio?.nombre || `ID: ${row.servicio_id}`;
            }
        },
        {
            field: "fecha",
            headerName: "Fecha",
            flex: 1,
        },
        {
            field: "hora_inicio",
            headerName: "Hora Inicio",
            flex: 1,
        },
        {
            field: "hora_fin",
            headerName: "Hora Fin",
            flex: 1,
        },
        {
            field: "precio_total",
            headerName: "Precio",
            width: 100,
            renderCell: ({ row }) => (
                <Typography variant="body2" fontWeight="bold">
                    ${row.precio_total}
                </Typography>
            )
        },
        {
            field: "estado",
            headerName: "Estado",
            width: 130,
            renderCell: ({ row }) => (
                <Chip
                    label={row.estado}
                    color={getEstadoColor(row.estado)}
                    size="small"
                    icon={getEstadoIcon(row.estado)}
                    sx={{ textTransform: 'capitalize' }}
                />
            )
        },
        {
            field: "notas",
            headerName: "Notas",
            flex: 1.5,
            renderCell: ({ row }) => (
                <Tooltip title={row.notas || "Sin notas"}>
                    <Typography variant="body2" noWrap>
                        {row.notas || "—"}
                    </Typography>
                </Tooltip>
            )
        },
        {
            field: "acciones",
            headerName: "Acciones",
            width: 220,
            renderCell: (params) => {
                const handleView = () => {
                    if (user.rol === 'cliente') {
                        startSetActiveReserva(params.row);
                        navigate(`/client/reservas/view?id=${params.row.id}`);
                    } else {
                        startSetActiveReserva(params.row);
                        navigate(`/admin/reservas/view?id=${params.row.id}`);
                    }
                };

                const handleEdit = () => {
                    if (user.rol === 'cliente') {
                        startSetActiveReserva(params.row);
                        navigate(`/client/reservas/form?id=${params.row.id}`);
                    } else {
                        startSetActiveReserva(params.row);
                        navigate(`/admin/reservas/form?id=${params.row.id}`);
                    }
                };

                const handleStatusChange = async (newStatus) => {
                    const statusMessages = {
                        'confirmada': 'confirmar',
                        'cancelada': 'cancelar',
                        'completada': 'completar'
                    };

                    const result = await Swal.fire({
                        title: `¿${statusMessages[newStatus]} reserva?`,
                        text: `${params.row.Usuario?.nombre} - ${params.row.fecha} ${params.row.hora_inicio}`,
                        icon: newStatus === 'cancelada' ? 'warning' : 'question',
                        showCancelButton: true,
                        confirmButtonText: `Sí, ${statusMessages[newStatus]}`,
                        cancelButtonText: "Cancelar",
                        confirmButtonColor: newStatus === 'cancelada' ? '#d33' : '#3085d6'
                    });

                    if (result.isConfirmed) {
                        await startChangeReservaStatus(params.row.id, newStatus);
                        Swal.fire(
                            "Actualizado",
                            `La reserva ha sido ${statusMessages[newStatus]}da.`,
                            "success"
                        );
                        startLoadingReserva();
                    }
                };

                const handleDelete = async () => {
                    const result = await Swal.fire({
                        title: `¿Eliminar reserva?`,
                        text: `${params.row.Usuario?.nombre} - ${params.row.fecha} ${params.row.hora_inicio}`,
                        icon: "error",
                        showCancelButton: true,
                        confirmButtonText: "Eliminar",
                        cancelButtonText: "Cancelar",
                        confirmButtonColor: '#d33'
                    });

                    if (result.isConfirmed) {
                        await startDeletingReserva(params.row);
                        Swal.fire("Eliminado", "La reserva ha sido eliminada.", "success");
                        startLoadingReserva();
                    }
                };

                return (
                    <Box display="flex" gap={0.5}>
                        {/* Ver detalles - Todos los roles */}
                        <Tooltip title="Ver detalles">
                            <IconButton onClick={handleView} size="small">
                                <VisibilityIcon color="info" />
                            </IconButton>
                        </Tooltip>

                        {/* Editar - Solo cliente (sus propias reservas) y admin */}
                        {(user.rol === 'cliente' || user.rol === 'admin') && (
                            <Tooltip title="Editar">
                                <IconButton onClick={handleEdit} size="small">
                                    <EditIcon color="primary" />
                                </IconButton>
                            </Tooltip>
                        )}

                        {/* Confirmar - Solo empleado y admin */}
                        {(user.rol === 'empleado' || user.rol === 'admin') && params.row.estado === 'pendiente' && (
                            <Tooltip title="Confirmar">
                                <IconButton
                                    onClick={() => handleStatusChange('confirmada')}
                                    size="small"
                                >
                                    <CheckIcon color="success" />
                                </IconButton>
                            </Tooltip>
                        )}

                        {/* Cancelar - Cliente (sus reservas), empleado y admin */}
                        {(user.rol === 'cliente' || user.rol === 'empleado' || user.rol === 'admin') &&
                            (params.row.estado === 'pendiente' || params.row.estado === 'confirmada') && (
                                <Tooltip title="Cancelar">
                                    <IconButton
                                        onClick={() => handleStatusChange('cancelada')}
                                        size="small"
                                    >
                                        <CancelIcon color="error" />
                                    </IconButton>
                                </Tooltip>
                            )}

                        {/* Completar - Solo empleado y admin */}
                        {(user.rol === 'empleado' || user.rol === 'admin') && params.row.estado === 'confirmada' && (
                            <Tooltip title="Completar">
                                <IconButton
                                    onClick={() => handleStatusChange('completada')}
                                    size="small"
                                >
                                    <CheckIcon color="info" />
                                </IconButton>
                            </Tooltip>
                        )}

                        {/* Eliminar - Solo admin */}
                        {user.rol === 'admin' && (
                            <Tooltip title="Eliminar">
                                <IconButton onClick={handleDelete} size="small">
                                    <DeleteIcon color="error" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                );
            }
        }
    ];

    const onCreateReserva = () => {
        startSetActiveReserva(null);
        navigate("form");
    };

    const rows = Array.isArray(reservas) ? reservas.map((r) => ({
        ...r,
        id: r.id,
        usuario_nombre: r.Usuario?.nombre || 'Sin cliente',
        empleado_nombre: r.Empleado?.Usuario?.nombre || 'Sin empleado',
        servicio_nombre: r.Servicio?.nombre || 'Sin servicio',
    })) : [];

    return (
        <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">
                    {user.rol === 'cliente' ? 'Mis Reservas' :
                        user.rol === 'empleado' ? 'Reservas Asignadas' : 'Reservas'}
                </Typography>
                {/* Solo mostrar botón crear para cliente y admin */}
                {(user.rol === 'cliente' || user.rol === 'admin') && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onCreateReserva}
                    >
                        Crear Reserva
                    </Button>
                )}
            </Box>

            {/* Filtros */}
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Buscar"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Buscar por cliente..."
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Fecha"
                            type="date"
                            value={filters.fecha}
                            onChange={(e) => handleFilterChange('fecha', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Fecha Inicio"
                            type="date"
                            value={filters.fecha_inicio}
                            onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Fecha Fin"
                            type="date"
                            value={filters.fecha_fin}
                            onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={filters.estado}
                                label="Estado"
                                onChange={(e) => handleFilterChange('estado', e.target.value)}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="pendiente">Pendiente</MenuItem>
                                <MenuItem value="confirmada">Confirmada</MenuItem>
                                <MenuItem value="cancelada">Cancelada</MenuItem>
                                <MenuItem value="completada">Completada</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => {
                                const baseFilters = {
                                    search: '',
                                    fecha: '',
                                    fecha_inicio: '',
                                    fecha_fin: '',
                                    usuario_id: '',
                                    empleado_id: '',
                                    servicio_id: '',
                                    estado: ''
                                };

                                // Mantener filtros automáticos según el rol
                                if (user.rol === 'cliente') {
                                    baseFilters.usuario_id = user.id;
                                } else if (user.rol === 'empleado') {
                                    baseFilters.empleado_id = user.empleado_id;
                                }

                                setFilters(baseFilters);
                                startLoadingReserva(baseFilters);
                            }}
                        >
                            Limpiar Filtros
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            <DataGrid
                rows={rows}
                columns={columns}
                loading={isLoading}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
                autoHeight
                disableSelectionOnClick
                sx={{
                    '& .MuiDataGrid-cell': {
                        display: 'flex',
                        alignItems: 'center',
                    },
                }}
            />
        </Box>
    );
};