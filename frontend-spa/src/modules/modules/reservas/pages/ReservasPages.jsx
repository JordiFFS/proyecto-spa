import { Box, Grid, Paper, Typography, Button, Card, CardContent, CardActions } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const ReservasPages = () => {

    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('perfil');
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom color="primary">
                Gestión de Reservas
            </Typography>

            <Button
                variant="contained"
                startIcon={<AddCircleOutline />}
                sx={{ mb: 3, borderRadius: 2 }}
                onClick={handleNavigate}
            >
                Nueva Reserva
            </Button>

            <Grid container spacing={3}>
                {/* Card 1 */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Reservas Hoy
                            </Typography>
                            <Typography variant="h4" color="primary">
                                15
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card 2 */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Reservas Pendientes
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                4
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card 3 */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Reservas Completadas
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                11
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabla o contenido adicional */}
            <Box sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Últimas Reservas
                    </Typography>
                    {/* Aquí puedes insertar tu tabla o lista */}
                    <Typography variant="body2" color="text.secondary">
                        Aún no hay registros disponibles.
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};
