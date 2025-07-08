import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Menu,
    MenuItem,
    IconButton,
    Divider,
    Chip
} from '@mui/material';
import {
    Dashboard,
    People,
    WorkOutline,
    EventNote,
    RoomService,
    Assessment,
    Notifications,
    Settings,
    AccountCircle,
    ExitToApp,
    CalendarToday,
    History,
    Feedback,
    Schedule,
    Group
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks';

export const NavBar = () => {
    const { user, startlogout } = useAuthStore();
    const navigate = useNavigate();

    // Estados separados para cada menú
    const [menuStates, setMenuStates] = useState({});
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);

    const handleMenuOpen = (menuKey, event) => {
        setMenuStates(prev => ({
            ...prev,
            [menuKey]: event.currentTarget
        }));
    };

    const handleMenuClose = (menuKey) => {
        setMenuStates(prev => ({
            ...prev,
            [menuKey]: null
        }));
    };

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleMenuItemClick = (menuKey, path) => {
        handleMenuClose(menuKey);
        navigate(path);
    };

    const handleLogout = () => {
        startlogout();
        handleUserMenuClose();
        navigate('/auth/login');
    };

    // Configuración de módulos por rol
    const getModulesByRole = () => {
        const commonModules = [
            { name: 'Dashboard', icon: <Dashboard />, path: './dashboard' }
        ];

        switch (user.rol) {
            case 'admin':
                return [
                    ...commonModules,
                    {
                        name: 'Gestión',
                        icon: <Settings />,
                        key: 'gestion',
                        submenu: [
                            { name: 'Usuarios', icon: <People />, path: '/admin/usuarios' },
                            { name: 'Empleados', icon: <WorkOutline />, path: '/admin/empleados' },
                            { name: 'Servicios', icon: <RoomService />, path: '/admin/servicios' },
                            { name: 'Disponibilidad', icon: <Schedule />, path: '/admin/disponibilidad' }
                        ]
                    },
                    {
                        name: 'Reservas',
                        icon: <EventNote />,
                        key: 'reservas',
                        submenu: [
                            { name: 'Ver Todas', icon: <EventNote />, path: '/admin/reservas' },
                            { name: 'Calendario', icon: <CalendarToday />, path: '/admin/calendario' },
                            { name: 'Historial', icon: <History />, path: '/admin/historial-reservas' }
                        ]
                    },
                    {
                        name: 'Reportes',
                        icon: <Assessment />,
                        key: 'reportes',
                        submenu: [
                            { name: 'Ventas', icon: <Assessment />, path: '/admin/reportes/ventas' },
                            { name: 'Empleados', icon: <Group />, path: '/admin/reportes/empleados' },
                            { name: 'Servicios', icon: <RoomService />, path: '/admin/reportes/servicios' },
                            { name: 'Auditoría', icon: <History />, path: '/admin/auditoria' }
                        ]
                    },
                    {
                        name: 'Comunicación',
                        icon: <Notifications />,
                        key: 'comunicacion',
                        submenu: [
                            { name: 'Notificaciones', icon: <Notifications />, path: '/admin/notificaciones' },
                            { name: 'Sugerencias', icon: <Feedback />, path: '/admin/sugerencias' }
                        ]
                    }
                ];

            case 'empleado':
                return [
                    ...commonModules,
                    {
                        name: 'Mi Agenda',
                        icon: <CalendarToday />,
                        key: 'agenda',
                        submenu: [
                            { name: 'Reservas Hoy', icon: <EventNote />, path: '/empleado/reservas-hoy' },
                            { name: 'Mis Reservas', icon: <Schedule />, path: '/empleado/mis-reservas' },
                            { name: 'Disponibilidad', icon: <Schedule />, path: '/empleado/disponibilidad' }
                        ]
                    },
                    {
                        name: 'Servicios',
                        icon: <RoomService />,
                        key: 'servicios',
                        submenu: [
                            { name: 'Ver Servicios', icon: <RoomService />, path: '/empleado/servicios' },
                            // { name: 'Crear Servicio', icon: <RoomService />, path: '/empleado/servicios/crear' }
                        ]
                    },
                    {
                        name: 'Historial',
                        icon: <History />,
                        key: 'historial',
                        submenu: [
                            { name: 'Reservas Completadas', icon: <History />, path: '/empleado/historial' },
                            { name: 'Calificaciones', icon: <Assessment />, path: '/empleado/calificaciones' }
                        ]
                    },
                    { name: 'Notificaciones', icon: <Notifications />, path: '/empleado/notificaciones' }
                ];

            case 'cliente':
                return [
                    ...commonModules,
                    {
                        name: 'Reservas',
                        icon: <EventNote />,
                        key: 'reservas',
                        submenu: [
                            { name: 'Nueva Reserva', icon: <EventNote />, path: '/cliente/reservas/nueva' },
                            { name: 'Mis Reservas', icon: <CalendarToday />, path: '/cliente/mis-reservas' },
                            { name: 'Historial', icon: <History />, path: '/cliente/historial' }
                        ]
                    },
                    { name: 'Servicios', icon: <RoomService />, path: '/cliente/servicios' },
                    { name: 'Empleados', icon: <WorkOutline />, path: '/cliente/empleados' },
                    { name: 'Notificaciones', icon: <Notifications />, path: '/cliente/notificaciones' },
                    { name: 'Sugerencias', icon: <Feedback />, path: '/cliente/sugerencias' }
                ];

            default:
                return commonModules;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return '#8E7AB5'; // Lavanda suave
            case 'empleado': return '#A8D8B9'; // Verde menta suave
            case 'cliente': return '#B8D4F0'; // Azul cielo suave
            default: return '#D4C5C7'; // Rosa empolvado
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin': return 'Administrador';
            case 'empleado': return 'Empleado';
            case 'cliente': return 'Cliente';
            default: return 'Usuario';
        }
    };

    const modules = getModulesByRole();

    return (
        <AppBar
            position="static"
            sx={{
                bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
            }}
        >
            <Toolbar>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        mr: 3,
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                        background: 'linear-gradient(45deg, #fff, #f0f8ff)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    ✨ SPA SQL ENGINEER
                </Typography>

                <Chip
                    label={getRoleLabel(user.rol)}
                    size="small"
                    sx={{
                        bgcolor: getRoleColor(user.rol),
                        color: '#4a4a4a',
                        mr: 3,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        border: '1px solid rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(10px)'
                    }}
                />

                <Box sx={{ flexGrow: 1, display: 'flex' }}>
                    {modules.map((module, index) => (
                        <div key={index}>
                            {module.submenu ? (
                                <>
                                    <Button
                                        color="inherit"
                                        startIcon={module.icon}
                                        onClick={(e) => handleMenuOpen(module.key, e)}
                                        sx={{
                                            mx: 0.5,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                                backdropFilter: 'blur(10px)'
                                            }
                                        }}
                                    >
                                        {module.name}
                                    </Button>
                                    <Menu
                                        anchorEl={menuStates[module.key]}
                                        open={Boolean(menuStates[module.key])}
                                        onClose={() => handleMenuClose(module.key)}
                                        PaperProps={{
                                            sx: {
                                                mt: 1,
                                                borderRadius: 2,
                                                bgcolor: 'rgba(255,255,255,0.95)',
                                                backdropFilter: 'blur(20px)',
                                                border: '1px solid rgba(255,255,255,0.3)',
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                                            }
                                        }}
                                    >
                                        {module.submenu.map((subItem, subIndex) => (
                                            <MenuItem
                                                key={subIndex}
                                                onClick={() => handleMenuItemClick(module.key, subItem.path)}
                                                sx={{
                                                    minWidth: 200,
                                                    borderRadius: 1,
                                                    mx: 1,
                                                    my: 0.5,
                                                    '&:hover': {
                                                        bgcolor: getRoleColor(user.rol) + '20',
                                                        color: '#4a4a4a'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    {subItem.icon}
                                                    {subItem.name}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </>
                            ) : (
                                <Button
                                    color="inherit"
                                    startIcon={module.icon}
                                    onClick={() => handleNavigation(module.path)}
                                    sx={{
                                        mx: 0.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                            backdropFilter: 'blur(10px)'
                                        }
                                    }}
                                >
                                    {module.name}
                                </Button>
                            )}
                        </div>
                    ))}
                </Box>

                {/* Menú de Usuario */}
                <Box>
                    <IconButton
                        color="inherit"
                        onClick={handleUserMenuOpen}
                        sx={{
                            ml: 2,
                            borderRadius: 2,
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)'
                            }
                        }}
                    >
                        <AccountCircle sx={{ fontSize: 32 }} />
                    </IconButton>
                    <Menu
                        anchorEl={userMenuAnchor}
                        open={Boolean(userMenuAnchor)}
                        onClose={handleUserMenuClose}
                        PaperProps={{
                            sx: {
                                mt: 1,
                                minWidth: 220,
                                borderRadius: 2,
                                bgcolor: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <Box sx={{
                            p: 2,
                            borderBottom: '1px solid rgba(0,0,0,0.1)',
                            background: `linear-gradient(135deg, ${getRoleColor(user.rol)}40, ${getRoleColor(user.rol)}20)`
                        }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="#4a4a4a">
                                {user.nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user.email}
                            </Typography>
                        </Box>
                        <MenuItem
                            onClick={() => {
                                handleUserMenuClose();
                                navigate('/perfil');
                            }}
                            sx={{
                                borderRadius: 1,
                                mx: 1,
                                my: 0.5,
                                '&:hover': {
                                    bgcolor: getRoleColor(user.rol) + '20'
                                }
                            }}
                        >
                            <AccountCircle sx={{ mr: 2, color: '#667eea' }} />
                            Mi Perfil
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                handleUserMenuClose();
                                navigate('/configuracion');
                            }}
                            sx={{
                                borderRadius: 1,
                                mx: 1,
                                my: 0.5,
                                '&:hover': {
                                    bgcolor: getRoleColor(user.rol) + '20'
                                }
                            }}
                        >
                            <Settings sx={{ mr: 2, color: '#667eea' }} />
                            Configuración
                        </MenuItem>
                        <Divider sx={{ my: 1 }} />
                        <MenuItem
                            onClick={handleLogout}
                            sx={{
                                color: '#e57373',
                                borderRadius: 1,
                                mx: 1,
                                my: 0.5,
                                '&:hover': {
                                    bgcolor: 'rgba(229, 115, 115, 0.1)'
                                }
                            }}
                        >
                            <ExitToApp sx={{ mr: 2 }} />
                            Cerrar Sesión
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};