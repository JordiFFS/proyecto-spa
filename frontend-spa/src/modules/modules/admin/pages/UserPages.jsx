import {
    Box,
    Button,
    IconButton,
    Typography,
    Tooltip
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect } from "react";
import Swal from "sweetalert2";
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import { useUserStore } from "../../../../store/modules/usuario/hooks";
import { useNavigate } from "react-router-dom";

export const UserPages = () => {

    const navigate = useNavigate();

    const {
        users,
        startLoadingUsers,
        startSetActiveUser,
        startDeletingUser,
        startReactivatingUser
    } = useUserStore();

    useEffect(() => {
        startLoadingUsers();
    }, []);






    const columns = [
        { field: "id", headerName: "ID", width: 70 },
        { field: "nombre", headerName: "Nombre", flex: 1 },
        { field: "email", headerName: "Correo", flex: 1.5 },
        { field: "telefono", headerName: "Teléfono", flex: 1 },
        { field: "rol", headerName: "Rol", width: 120 },
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
                    startSetActiveUser(params.row);
                    navigate(`/admin/usuarios/form?id=${params.row.id}`);
                };

                const handleArchive = async () => {
                    const result = await Swal.fire({
                        title: `¿Archivar usuario ${params.row.nombre}?`,
                        text: "Podrás restaurarlo luego",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Sí, archivar",
                        cancelButtonText: "Cancelar"
                    });

                    if (result.isConfirmed) {
                        await startDeletingUser(params.row); // ✅ se pasa directamente
                        Swal.fire("Archivado", "El usuario ha sido archivado.", "success");
                    }
                };

                const handleReactivate = async () => {
                    const result = await Swal.fire({
                        title: `¿Reactivar usuario ${params.row.nombre}?`,
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "Sí, reactivar",
                        cancelButtonText: "Cancelar"
                    });

                    if (result.isConfirmed) {
                        await startReactivatingUser(params.row.id);
                        Swal.fire("Reactivado", "El usuario ha sido reactivado.", "success");
                    }
                };

                const handleDelete = async () => {
                    const result = await Swal.fire({
                        title: `¿Eliminar definitivamente a ${params.row.nombre}?`,
                        text: "Esta acción no se puede deshacer",
                        icon: "error",
                        showCancelButton: true,
                        confirmButtonText: "Eliminar",
                        cancelButtonText: "Cancelar"
                    });

                    if (result.isConfirmed) {
                        // Aquí agregarías un endpoint real de eliminación definitiva si lo tienes.
                        console.log("Eliminar definitivamente a:", params.row.id);
                    }
                };
                return (
                    <>
                        <Tooltip title="Editar">
                            <IconButton onClick={handleEdit}>
                                <EditIcon color="primary" />
                            </IconButton>
                        </Tooltip>
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
                        <Tooltip title="Eliminar">
                            <IconButton onClick={handleDelete}>
                                <DeleteIcon color="error" />
                            </IconButton>
                        </Tooltip>
                    </>
                )
            }
        }
    ];

    const onCreateUser = () => {
        startSetActiveUser(null);
        navigate("form")
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h5">Usuarios</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onCreateUser}
                >
                    Crear Usuario
                </Button>
            </Box>
            <DataGrid
                rows={users}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
                autoHeight
            />
        </Box>
    );
};
