import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

export const PerfilPages = () => {
  // Simulación de datos de usuario
  const user = {
    nombre: 'Jordi Fiallos',
    correo: 'jordi@example.com',
    rol: 'Administrador',
    avatarUrl: 'https://i.pravatar.cc/150?img=3', // Puedes reemplazarlo con una imagen real o de tu sistema
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Perfil de Usuario
      </Typography>

      <Card elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4} md={3} textAlign="center">
            <Avatar
              alt={user.nombre}
              src={user.avatarUrl}
              sx={{ width: 120, height: 120, mx: 'auto' }}
            />
          </Grid>

          <Grid item xs={12} sm={8} md={9}>
            <Typography variant="h6">Nombre</Typography>
            <Typography variant="body1" gutterBottom>{user.nombre}</Typography>

            <Divider sx={{ my: 1 }} />

            <Typography variant="h6">Correo</Typography>
            <Typography variant="body1" gutterBottom>{user.correo}</Typography>

            <Divider sx={{ my: 1 }} />

            <Typography variant="h6">Rol</Typography>
            <Typography variant="body1" gutterBottom>{user.rol}</Typography>

            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              sx={{ mt: 2 }}
            >
              Editar Perfil
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};
