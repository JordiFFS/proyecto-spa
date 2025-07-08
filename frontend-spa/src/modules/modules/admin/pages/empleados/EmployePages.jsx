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
import { useEmployeStore } from '../../../../../store/modules/Empleado/hooks';
import Swal from 'sweetalert2';

export const EmployePages = () => {


  const navigate = useNavigate();

  const {
    employes,
    startLoadinEmploye,
    startSetActivateEmploye,
    startDeletingEmploye,
    startReactivateEmploye,
  } = useEmployeStore();


  useEffect(() => {
    startLoadinEmploye();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "email", headerName: "Correo", flex: 1.2 },
    { field: "telefono", headerName: "Teléfono", flex: 1 },
    { field: "especialidad", headerName: "Especialidad", flex: 1.5 },
    { field: "horario_inicio", headerName: "Hora de entrada", flex: 1 },
    { field: "horario_fin", headerName: "Hora de salida", flex: 1 },
    { field: "dias_trabajo", headerName: "Días de trabajo", width: 120 },
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
          startSetActivateEmploye(params.row);
          navigate(`/admin/empleados/form?id=${params.row.id}`);
        };

        const handleArchive = async () => {
          const result = await Swal.fire({
            title: `¿Archivar empleado ${params.row.nombre}?`,
            text: "Podrás restaurarlo luego",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, archivar",
            cancelButtonText: "Cancelar"
          });

          if (result.isConfirmed) {
            await startDeletingEmploye(params.row); // ✅ se pasa directamente
            Swal.fire("Archivado", "El usuario ha sido archivado.", "success");
          }
        };

        const handleReactivate = async () => {
          const result = await Swal.fire({
            title: `¿Reactivar empleado ${params.row.nombre}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, reactivar",
            cancelButtonText: "Cancelar"
          });

          if (result.isConfirmed) {
            await startReactivateEmploye(params.row.id);
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
    startSetActivateEmploye(null);
    navigate("form");
  };

  const rows = employes.map((e) => ({
    ...e,
    nombre: e.Usuario?.nombre || "—",
    email: e.Usuario?.email || "—",
    telefono: e.Usuario?.telefono || "—"
  }));

  return (
    <Box sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Empleados</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateUser}
        >
          Crear Empleado
        </Button>
      </Box>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        autoHeight
      />
    </Box>
  )
}
