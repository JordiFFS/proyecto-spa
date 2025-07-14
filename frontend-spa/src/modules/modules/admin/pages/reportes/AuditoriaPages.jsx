import {
    Box,
    Button,
    IconButton,
    Typography,
    Tooltip,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
    Paper
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useEffect, useState } from 'react'
import { useAuditoriaStore } from "../../../../../store";
import { useAuthStore } from "../../../../../hooks";

export const AuditoriaPages = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedAuditoria, setSelectedAuditoria] = useState(null);
    const [filters, setFilters] = useState({
        usuario_id: '',
        accion: '',
        tabla_afectada: '',
        resultado: '',
        fecha_inicio: '',
        fecha_fin: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    const {
        auditoriaData,
        // isLoading,
        active,
        startLoadingAuditoria,
        startLoadingAuditoriaById,
    } = useAuditoriaStore();

    const { user } = useAuthStore();

    useEffect(() => {
        startLoadingAuditoria();
    }, []);

    const handleViewDetails = async (auditoria) => {
        await startLoadingAuditoriaById(auditoria._id);
        setSelectedAuditoria(auditoria);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedAuditoria(null);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApplyFilters = () => {
        const queryParams = {};
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                queryParams[key] = filters[key];
            }
        });
        startLoadingAuditoria(queryParams);
        setShowFilters(false);
    };

    const handleClearFilters = () => {
        setFilters({
            usuario_id: '',
            accion: '',
            tabla_afectada: '',
            resultado: '',
            fecha_inicio: '',
            fecha_fin: ''
        });
        startLoadingAuditoria();
        setShowFilters(false);
    };

    const handleRefresh = () => {
        startLoadingAuditoria();
    };

    const columns = [
        { field: "_id", headerName: "ID", width: 70 },
        {
            field: "usuario_id",
            headerName: "Usuario ID",
            width: 100
        },
        {
            field: "valores_nuevos",
            headerName: "Realizado por",
            width: 200
        },
        {
            field: "accion",
            headerName: "Acción",
            width: 120,
            renderCell: ({ row }) => (
                <Chip
                    label={row.accion}
                    size="small"
                    color={
                        row.accion === 'crear' ? 'success' :
                            row.accion === 'actualizar' ? 'warning' :
                                row.accion === 'eliminar' ? 'error' : 'default'
                    }
                />
            )
        },
        {
            field: "tabla_afectada",
            headerName: "Tabla",
            width: 130
        },
        {
            field: "registro_id",
            headerName: "Registro ID",
            width: 100
        },
        {
            field: "ip",
            headerName: "IP",
            width: 120
        },
        {
            field: "metodo_http",
            headerName: "Método",
            width: 100
        },
        {
            field: "endpoint",
            headerName: "Endpoint",
            flex: 1,
            renderCell: ({ row }) => (
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                    {row.endpoint}
                </Typography>
            )
        },
        {
            field: "resultado",
            headerName: "Resultado",
            width: 120,
            renderCell: ({ row }) => (
                <Chip
                    label={row.resultado}
                    size="small"
                    color={row.resultado === 'exitoso' ? 'success' : 'error'}
                />
            )
        },
        {
            field: "createdAt",
            headerName: "Fecha",
            width: 160,
            renderCell: ({ row }) => (
                <Typography variant="body2">
                    {new Date(row.createdAt).toLocaleString()}
                </Typography>
            )
        },
        {
            field: "acciones",
            headerName: "Acciones",
            width: 100,
            renderCell: (params) => (
                <Tooltip title="Ver detalles">
                    <IconButton onClick={() => handleViewDetails(params.row)}>
                        <VisibilityIcon color="primary" />
                    </IconButton>
                </Tooltip>
            )
        }
    ];

    return (
        <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Auditoría del Sistema</Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<FilterListIcon />}
                        onClick={() => setShowFilters(!showFilters)}
                        sx={{ mr: 1 }}
                    >
                        Filtros
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                    >
                        Actualizar
                    </Button>
                </Box>
            </Box>

            {/* Panel de Filtros */}
            {showFilters && (
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Filtros de Búsqueda
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                label="Usuario ID"
                                value={filters.usuario_id}
                                onChange={(e) => handleFilterChange('usuario_id', e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                select
                                label="Acción"
                                value={filters.accion}
                                onChange={(e) => handleFilterChange('accion', e.target.value)}
                                size="small"
                            >
                                <MenuItem value="">Todas</MenuItem>
                                <MenuItem value="crear">Crear</MenuItem>
                                <MenuItem value="actualizar">Actualizar</MenuItem>
                                <MenuItem value="eliminar">Eliminar</MenuItem>
                                <MenuItem value="leer">Leer</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                label="Tabla"
                                value={filters.tabla_afectada}
                                onChange={(e) => handleFilterChange('tabla_afectada', e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                select
                                label="Resultado"
                                value={filters.resultado}
                                onChange={(e) => handleFilterChange('resultado', e.target.value)}
                                size="small"
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="exitoso">Exitoso</MenuItem>
                                <MenuItem value="fallido">Fallido</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Fecha Inicio"
                                value={filters.fecha_inicio}
                                onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Fecha Fin"
                                value={filters.fecha_fin}
                                onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleApplyFilters}
                            sx={{ mr: 1 }}
                        >
                            Aplicar Filtros
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleClearFilters}
                        >
                            Limpiar Filtros
                        </Button>
                    </Box>
                </Paper>
            )}

            <DataGrid
                rows={auditoriaData}
                columns={columns}
                getRowId={(row) => row._id}
                // loading={isLoading}
                pageSize={25}
                rowsPerPageOptions={[25, 50, 100]}
                autoHeight
                disableSelectionOnClick
                sx={{
                    '& .MuiDataGrid-cell': {
                        fontSize: '0.875rem',
                    },
                    '& .MuiDataGrid-columnHeader': {
                        backgroundColor: '#f5f5f5',
                        fontWeight: 'bold',
                    },
                }}
            />

            {/* Dialog de Detalles */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Detalles de Auditoría - ID: {selectedAuditoria?._id}
                </DialogTitle>
                <DialogContent>
                    {active && (
                        <Box sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Usuario ID:
                                    </Typography>
                                    <Typography variant="body1">{active.usuario_id}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Acción:
                                    </Typography>
                                    <Chip
                                        label={active.accion}
                                        size="small"
                                        color={
                                            active.accion === 'crear' ? 'success' :
                                                active.accion === 'actualizar' ? 'warning' :
                                                    active.accion === 'eliminar' ? 'error' : 'default'
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Tabla Afectada:
                                    </Typography>
                                    <Typography variant="body1">{active.tabla_afectada}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Registro ID:
                                    </Typography>
                                    <Typography variant="body1">{active.registro_id}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        IP:
                                    </Typography>
                                    <Typography variant="body1">{active.ip}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Método HTTP:
                                    </Typography>
                                    <Typography variant="body1">{active.metodo_http}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Endpoint:
                                    </Typography>
                                    <Typography variant="body1">{active.endpoint}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        User Agent:
                                    </Typography>
                                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                        {active.user_agent || 'No disponible'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Resultado:
                                    </Typography>
                                    <Chip
                                        label={active.resultado}
                                        size="small"
                                        color={active.resultado === 'exitoso' ? 'success' : 'error'}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Fecha:
                                    </Typography>
                                    <Typography variant="body1">
                                        {new Date(active.createdAt).toLocaleString()}
                                    </Typography>
                                </Grid>

                                {active.mensaje_error && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="error">
                                            Mensaje de Error:
                                        </Typography>
                                        <Paper sx={{ p: 1, backgroundColor: '#ffebee' }}>
                                            <Typography variant="body2" color="error">
                                                {active.mensaje_error}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                )}

                                {active.valores_anteriores && (
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Valores Anteriores:
                                        </Typography>
                                        <Paper sx={{ p: 1, backgroundColor: '#f5f5f5' }}>
                                            <pre style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                                                {JSON.stringify(active.valores_anteriores, null, 2)}
                                            </pre>
                                        </Paper>
                                    </Grid>
                                )}

                                {active.valores_nuevos && (
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Valores Nuevos:
                                        </Typography>
                                        <Paper sx={{ p: 1, backgroundColor: '#f5f5f5' }}>
                                            <pre style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                                                {JSON.stringify(active.valores_nuevos, null, 2)}
                                            </pre>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};