import {
    Box,
    Button,
    IconButton,
    Typography,
    Tooltip
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useServiceStore } from "../../../../../store";
import { useAuthStore } from "../../../../../hooks";

export const ServicesPages = () => {

    const navigate = useNavigate();

    const {
        services,
        startLoadingService,
        startSetActivateService,
        startDeletingService,
        startReactivateService,
    } = useServiceStore();

    const {
        user,
    } = useAuthStore();

    const rol = user?.rol || 'admin';

    useEffect(() => {
        startLoadingService();
    }, []);

    const filteredServices = rol === 'cliente'
        ? services.filter(service => service.activo)
        : services;

    const columns = [
        { field: "id", headerName: "ID", width: 70 },
        { field: "nombre", headerName: "Nombre", flex: 1 },
        { field: "descripcion", headerName: "Descripción", flex: 1.5 },
        {
            field: "duracion",
            headerName: "Duración (min)",
            width: 120,
            renderCell: ({ row }) => `${row.duracion} min`
        },
        {
            field: "precio",
            headerName: "Precio",
            width: 120,
            renderCell: ({ row }) => `$${parseFloat(row.precio).toFixed(2)}`
        },
        {
            field: "activo",
            headerName: "Estado",
            width: 120,
            renderCell: ({ row }) =>
                <Typography color={row.activo ? "green" : "red"}>
                    {row.activo ? "Activo" : "Archivado"}
                </Typography>
        },
        {
            field: "acciones",
            headerName: "Acciones",
            width: 180,
            renderCell: (params) => {
                const handleEdit = () => {
                    startSetActivateService(params.row);
                    navigate(`/${rol}/servicios/form?id=${params.row.id}`);
                };

                const handleArchive = async () => {
                    const result = await Swal.fire({
                        title: `¿Archivar servicio ${params.row.nombre}?`,
                        text: "Podrás restaurarlo luego",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Sí, archivar",
                        cancelButtonText: "Cancelar"
                    });

                    if (result.isConfirmed) {
                        await startDeletingService(params.row);
                        Swal.fire("Archivado", "El servicio ha sido archivado.", "success");
                    }
                };

                const handleReactivate = async () => {
                    const result = await Swal.fire({
                        title: `¿Reactivar servicio ${params.row.nombre}?`,
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "Sí, reactivar",
                        cancelButtonText: "Cancelar"
                    });

                    if (result.isConfirmed) {
                        await startReactivateService(params.row.id);
                        Swal.fire("Reactivado", "El servicio ha sido reactivado.", "success");
                    }
                };

                const handleDelete = async () => {
                    const result = await Swal.fire({
                        title: `¿Eliminar definitivamente el servicio ${params.row.nombre}?`,
                        text: "Esta acción no se puede deshacer",
                        icon: "error",
                        showCancelButton: true,
                        confirmButtonText: "Eliminar",
                        cancelButtonText: "Cancelar"
                    });

                    if (result.isConfirmed) {
                        // Aquí agregarías un endpoint real de eliminación definitiva si lo tienes.
                    }
                };

                return (
                    <>
                        {/* Solo admin y empleado pueden editar */}
                        {(rol === 'admin' || rol === 'empleado') && (
                            <Tooltip title="Editar">
                                <IconButton onClick={handleEdit}>
                                    <EditIcon color="primary" />
                                </IconButton>
                            </Tooltip>
                        )}

                        {/* Solo admin puede archivar/reactivar */}
                        {rol === 'admin' && (
                            <>
                                {params.row.activo ? (
                                    <Tooltip title="Archivar">
                                        <IconButton onClick={handleArchive}>
                                            <ArchiveIcon color="warning" />
                                        </IconButton>
                                    </Tooltip>
                                ) : (
                                    <Tooltip title="Reactivar">
                                        <IconButton onClick={handleReactivate}>
                                            <RestoreIcon color="success" />
                                        </IconButton>
                                    </Tooltip>
                                )}

                                {/* Solo admin puede eliminar definitivamente */}
                                <Tooltip title="Eliminar">
                                    <IconButton onClick={handleDelete}>
                                        <DeleteIcon color="error" />
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}
                    </>
                )
            }
        }
    ];

    const onCreateService = () => {
        startSetActivateService(null);
        navigate("form");
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h5">Servicios</Typography>
                {/* Solo admin y empleado pueden crear servicios */}
                {(rol === 'admin' || rol === 'empleado') && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onCreateService}
                    >
                        Crear Servicio
                    </Button>
                )}
            </Box>
            <DataGrid
                rows={filteredServices} // Cambiar de 'services' a 'filteredServices'
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
                autoHeight
            />
        </Box>
    )
}