import { Box, Container } from '@mui/material';
import { NavBar } from '../components';

export const ModulesLayout = ({ children, autenticado = true }) => {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                // Gradiente suave inspirado en spa: tonos tierra, verde menta y beige
                background: 'linear-gradient(135deg, #f7f3f0 0%, #e8f5e8 25%, #f0f8f0 50%, #faf9f7 75%, #f5f2ef 100%)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                // Añadimos una textura sutil para dar profundidad
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 80%, rgba(164, 203, 164, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(195, 218, 195, 0.1) 0%, transparent 50%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }
            }}
        >
            {/* Navbar superior */}
            {autenticado && (
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <NavBar autenticado={autenticado} />
                </Box>
            )}

            {/* Contenido principal */}
            <Container
                maxWidth="xl"
                sx={{
                    flexGrow: 1,
                    paddingTop: 4,
                    paddingBottom: 4,
                    position: 'relative',
                    zIndex: 1,
                    // Añadimos un contenedor con fondo semi-transparente para mejor legibilidad
                    '& > *': {
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                        padding: 3,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                    }
                }}
            >
                {children}
            </Container>
        </Box>
    );
};