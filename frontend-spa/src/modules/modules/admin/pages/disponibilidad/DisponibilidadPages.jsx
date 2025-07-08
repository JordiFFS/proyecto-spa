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
import BlockIcon from '@mui/icons-material/Block';
import UnblockIcon from '@mui/icons-material/LockOpen';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useDisponibilidadStore } from "../../../../../store";

export const DisponibilidadPages = () => {
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        search: '',
        fecha: '',
        empleado_id: '',
        disponible: ''
    });

    const {
        isLoading,
        disponibilidades,
        startLoadingDisponibilidad,
        startSetActiveDisponibilidad,
        startDeletingDisponibilidad,
        startBlockSchedule,
        startUnblockSchedule,
    } = useDisponibilidadStore();

    useEffect(() => {
        startLoadingDisponibilidad();
    }, []);

    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);

        // Aplicar filtros con debounce para search
        if (field === 'search') {
            const timeoutId = setTimeout(() => {
                startLoadingDisponibilidad(newFilters);
            }, 500);
            return () => clearTimeout(timeoutId);
        } else {
            startLoadingDisponibilidad(newFilters);
        }
    };

    const columns = [
        { field: "id", headerName: "ID", width: 70 },
        {
            field: "empleado_id",
            headerName: "Empleado",
            flex: 1.2,
            renderCell: ({ row }) => {
                return row.Empleado?.Usuario?.nombre || `ID: ${row.empleado_id}`;
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
            field: "disponible",
            headerName: "Estado",
            width: 120,
            renderCell: ({ row }) => (
                <Chip
                    label={row.disponible ? "Disponible" : "Bloqueado"}
                    color={row.disponible ? "success" : "error"}
                    size="small"
                />
            )
        },
        {
            field: "motivo",
            headerName: "Motivo",
            flex: 1.5,
            renderCell: ({ row }) => (
                <Tooltip title={row.motivo || "Sin motivo"}>
                    <Typography variant="body2" noWrap>
                        {row.motivo || "—"}
                    </Typography>
                </Tooltip>
            )
        },
        {
            field: "acciones",
            headerName: "Acciones",
            width: 180,
            renderCell: (params) => {
                const handleEdit = () => {
                    startSetActiveDisponibilidad(params.row);
                    navigate(`/admin/disponibilidad/form?id=${params.row.id}`);
                };

                const handleBlock = async () => {
                    const { value: motivo } = await Swal.fire({
                        title: `¿Bloquear horario?`,
                        text: `${params.row.fecha} de ${params.row.hora_inicio} a ${params.row.hora_fin}`,
                        input: 'text',
                        inputLabel: 'Motivo del bloqueo',
                        inputPlaceholder: 'Ej: Cita médica, vacaciones, etc.',
                        showCancelButton: true,
                        confirmButtonText: "Sí, bloquear",
                        cancelButtonText: "Cancelar",
                        inputValidator: (value) => {
                            if (!value) {
                                return 'Debes ingresar un motivo'
                            }
                        }
                    });

                    if (motivo) {
                        await startBlockSchedule({
                            empleado_id: params.row.empleado_id,
                            fecha: params.row.fecha,
                            hora_inicio: params.row.hora_inicio,
                            hora_fin: params.row.hora_fin,
                            motivo: motivo
                        });
                        Swal.fire("Bloqueado", "El horario ha sido bloqueado.", "success");
                        startLoadingDisponibilidad();
                    }
                };

                const handleUnblock = async () => {
                    const result = await Swal.fire({
                        title: `¿Desbloquear horario?`,
                        text: `${params.row.fecha} de ${params.row.hora_inicio} a ${params.row.hora_fin}`,
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "Sí, desbloquear",
                        cancelButtonText: "Cancelar"
                    });

                    if (result.isConfirmed) {
                        await startUnblockSchedule(params.row.id);
                        Swal.fire("Desbloqueado", "El horario ha sido desbloqueado.", "success");
                        startLoadingDisponibilidad();
                    }
                };

                const handleDelete = async () => {
                    const result = await Swal.fire({
                        title: `¿Eliminar disponibilidad?`,
                        text: `${params.row.fecha} de ${params.row.hora_inicio} a ${params.row.hora_fin}`,
                        icon: "error",
                        showCancelButton: true,
                        confirmButtonText: "Eliminar",
                        cancelButtonText: "Cancelar"
                    });

                    if (result.isConfirmed) {
                        await startDeletingDisponibilidad(params.row);
                        Swal.fire("Eliminado", "La disponibilidad ha sido eliminada.", "success");
                        startLoadingDisponibilidad();
                    }
                };

                return (
                    <Box display="flex" gap={0.5}>
                        <Tooltip title="Editar">
                            <IconButton onClick={handleEdit} size="small">
                                <EditIcon color="primary" />
                            </IconButton>
                        </Tooltip>
                        {params.row.disponible ? (
                            <Tooltip title="Bloquear">
                                <IconButton onClick={handleBlock} size="small">
                                    <BlockIcon color="warning" />
                                </IconButton>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Desbloquear">
                                <IconButton onClick={handleUnblock} size="small">
                                    <UnblockIcon color="success" />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title="Eliminar">
                            <IconButton onClick={handleDelete} size="small">
                                <DeleteIcon color="error" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            }
        }
    ];

    const onCreateDisponibilidad = () => {
        startSetActiveDisponibilidad(null);
        navigate("form");
    };

    const rows = disponibilidades.map((d) => ({
        ...d,
        id: d.id,
        empleado_nombre: d.empleado?.nombre || 'Sin empleado',
    }));

    return (
        <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Disponibilidad</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onCreateDisponibilidad}
                >
                    Crear Disponibilidad
                </Button>
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
                            placeholder="Buscar por empleado..."
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
                        <FormControl fullWidth size="small">
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={filters.disponible}
                                label="Estado"
                                onChange={(e) => handleFilterChange('disponible', e.target.value)}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="true">Disponible</MenuItem>
                                <MenuItem value="false">Bloqueado</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => {
                                setFilters({ search: '', fecha: '', empleado_id: '', disponible: '' });
                                startLoadingDisponibilidad();
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