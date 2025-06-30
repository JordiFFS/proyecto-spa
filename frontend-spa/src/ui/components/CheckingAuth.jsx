import { CircularProgress, Grid, Typography } from '@mui/material';

export const CheckingAuth = ({ msg = "Cargando ..." }) => {
    return (
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(to right, #dceefb, #e0f7fa)", // Tonos suaves azules y aqua
                padding: 4,
            }}
        >
            <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.7)", // fondo translúcido
                    padding: 3,
                    borderRadius: 4,
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                }}
            >
                <CircularProgress sx={{ color: "#81d4fa", mb: 2 }} />
                <Typography variant="h6" color="text.primary">
                    {msg}
                </Typography>
            </Grid>
        </Grid>
    );
};
