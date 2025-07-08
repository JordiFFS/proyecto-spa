import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Box,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Alert,
    Container,
    InputAdornment
} from '@mui/material';
import { Save, Cancel, Person, Work, Schedule, AttachMoney } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useReservaStore } from '../../../../../store';
import { useGetComboxBox } from '../../../../components';

// Estados predefinidos para reservas
const estadosReserva = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' }
];

// Esquema de validación con Yup
const validationSchema = Yup.object({
    usuario_id: Yup.number()
        .required('El usuario es requerido')
        .positive('Seleccione un usuario válido'),
    empleado_id: Yup.number()
        .required('El empleado es requerido')
        .positive('Seleccione un empleado válido'),
    servicio_id: Yup.number()
        .required('El servicio es requerido')
        .positive('Seleccione un servicio válido'),
    fecha: Yup.date()
        .required('La fecha es requerida')
        .min(new Date().toISOString().split('T')[0], 'La fecha no puede ser anterior a hoy'),
    hora_inicio: Yup.string()
        .required('La hora de inicio es requerida')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    hora_fin: Yup.string()
        .required('La hora de fin es requerida')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
        .test('hora-fin-mayor', 'La hora de fin debe ser mayor a la de inicio', function (value) {
            const { hora_inicio } = this.parent;
            if (!hora_inicio || !value) return true;

            const inicio = new Date(`2000-01-01T${hora_inicio}:00`);
            const fin = new Date(`2000-01-01T${value}:00`);

            return fin > inicio;
        }),
    estado: Yup.string()
        .required('El estado es requerido')
        .oneOf(['pendiente', 'confirmada', 'completada', 'cancelada'], 'Estado inválido'),
    precio_total: Yup.number()
        .required('El precio total es requerido')
        .positive('El precio debe ser mayor a 0')
        .max(999999.99, 'El precio no puede exceder 999,999.99'),
    notas: Yup.string()
        .nullable()
        .max(1000, 'Las notas no pueden exceder 1000 caracteres')
});

export const ReservaForm = () => {
    const navigate = useNavigate();

    const {
        active,
        isLoading,
        errorMessage,
        serverMessage,
        errorAtributes,
        startSavingReserva,
        startClearMessage,
    } = useReservaStore();

    const {
        users_cbx,
        userRol_cbx,
        servicio_cbx,
        startGetUsersCbx,
        startGetUserRolCbx,
        startGetServicioCbx
    } = useGetComboxBox();

    const isEditing = Boolean(active?.id);
    
    // Cargar datos de los comboboxes
    useEffect(() => {
        console.log('🔍 Iniciando carga de datos para comboboxes...');
        const loadComboBoxData = async () => {
            try {
                console.log('🔍 Cargando usuarios...');
                await startGetUsersCbx();
                console.log('🔍 Cargando empleados...');
                await startGetUserRolCbx('empleado');
                console.log('🔍 Cargando servicios...');
                await startGetServicioCbx();
                console.log('✅ Datos de comboboxes cargados');
            } catch (error) {
                console.error('❌ Error al cargar datos de comboboxes:', error);
            }
        };
        loadComboBoxData();
    }, []);

    const formik = useFormik({
        initialValues: {
            usuario_id: active?.usuario_id || '',
            empleado_id: active?.empleado_id || '',
            servicio_id: active?.servicio_id || '',
            fecha: active?.fecha || '',
            hora_inicio: active?.hora_inicio || '',
            hora_fin: active?.hora_fin || '',
            estado: active?.estado || 'pendiente',
            precio_total: active?.precio_total || '',
            notas: active?.notas || ''
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const reservaData = {
                ...values,
                id: active?.id,
                precio_total: parseFloat(values.precio_total)
            };

            await startSavingReserva(reservaData);
        }
    });

    // Efecto para manejar errores de atributos específicos
    useEffect(() => {
        if (errorAtributes && Object.keys(errorAtributes).length > 0) {
            Object.keys(errorAtributes).forEach(field => {
                if (formik.values.hasOwnProperty(field)) {
                    formik.setFieldError(field, errorAtributes[field][0]);
                }
            });
        }
    }, [errorAtributes]);

    // Limpiar mensajes al desmontar o cambiar
    useEffect(() => {
        return () => {
            startClearMessage();
        };
    }, []);

    const handleCancel = () => {
        navigate('./..');
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 3, md: 5 },
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)'
                }}
            >
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                        mb: 4,
                        fontWeight: 600,
                        color: 'primary.main',
                        textAlign: 'center'
                    }}
                >
                    {isEditing ? 'Editar Reserva' : 'Crear Reserva'}
                </Typography>

                {/* Mensajes de error/éxito */}
                {errorMessage && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            fontSize: '1rem'
                        }}
                        onClose={startClearMessage}
                    >
                        {errorMessage}
                    </Alert>
                )}

                {serverMessage && (
                    <Alert
                        severity="info"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            fontSize: '1rem'
                        }}
                        onClose={startClearMessage}
                    >
                        {serverMessage}
                    </Alert>
                )}

                <Box component="form" onSubmit={formik.handleSubmit}>
                    <Grid container spacing={4}>
                        {/* Usuario */}
                        <Grid item xs={12} md={6}>
                            <FormControl
                                fullWidth
                                error={formik.touched.usuario_id && Boolean(formik.errors.usuario_id)}
                                disabled={isLoading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: '56px',
                                        fontSize: '1.1rem'
                                    },
                                    '& .MuiInputLabel-root': {
                                        fontSize: '1.1rem'
                                    }
                                }}
                            >
                                <InputLabel
                                    id="usuario-label"
                                    sx={{
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    }}
                                >
                                    Usuario *
                                </InputLabel>
                                <Select
                                    labelId="usuario-label"
                                    id="usuario_id"
                                    name="usuario_id"
                                    value={formik.values.usuario_id}
                                    label="Usuario *"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 300,
                                                '& .MuiMenuItem-root': {
                                                    fontSize: '1rem',
                                                    minHeight: '48px',
                                                    padding: '12px 16px'
                                                }
                                            }
                                        }
                                    }}
                                >
                                    {!users_cbx || !Array.isArray(users_cbx) || users_cbx.length === 0 ? (
                                        <MenuItem disabled>
                                            {!users_cbx ? 'Cargando usuarios...' : 'No hay usuarios disponibles'}
                                        </MenuItem>
                                    ) : (
                                        users_cbx.map((usuario) => (
                                            <MenuItem key={usuario.value} value={usuario.value}>
                                                {usuario.label}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                                <FormHelperText sx={{ fontSize: '0.9rem', mt: 1 }}>
                                    {formik.touched.usuario_id && formik.errors.usuario_id}
                                </FormHelperText>
                            </FormControl>
                        </Grid>

                        {/* Empleado */}
                        <Grid item xs={12} md={6}>
                            <FormControl
                                fullWidth
                                error={formik.touched.empleado_id && Boolean(formik.errors.empleado_id)}
                                disabled={isLoading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: '56px',
                                        fontSize: '1.1rem'
                                    },
                                    '& .MuiInputLabel-root': {
                                        fontSize: '1.1rem'
                                    }
                                }}
                            >
                                <InputLabel
                                    id="empleado-label"
                                    sx={{
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    }}
                                >
                                    Empleado *
                                </InputLabel>
                                <Select
                                    labelId="empleado-label"
                                    id="empleado_id"
                                    name="empleado_id"
                                    value={formik.values.empleado_id}
                                    label="Empleado *"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 300,
                                                '& .MuiMenuItem-root': {
                                                    fontSize: '1rem',
                                                    minHeight: '48px',
                                                    padding: '12px 16px'
                                                }
                                            }
                                        }
                                    }}
                                >
                                    {!userRol_cbx || !Array.isArray(userRol_cbx) || userRol_cbx.length === 0 ? (
                                        <MenuItem disabled>
                                            {!userRol_cbx ? 'Cargando empleados...' : 'No hay empleados disponibles'}
                                        </MenuItem>
                                    ) : (
                                        userRol_cbx.map((empleado) => (
                                            <MenuItem key={empleado.value} value={empleado.value}>
                                                {empleado.label}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                                <FormHelperText sx={{ fontSize: '0.9rem', mt: 1 }}>
                                    {formik.touched.empleado_id && formik.errors.empleado_id}
                                </FormHelperText>
                            </FormControl>
                        </Grid>

                        {/* Servicio */}
                        <Grid item xs={12} md={6}>
                            <FormControl
                                fullWidth
                                error={formik.touched.servicio_id && Boolean(formik.errors.servicio_id)}
                                disabled={isLoading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: '56px',
                                        fontSize: '1.1rem'
                                    },
                                    '& .MuiInputLabel-root': {
                                        fontSize: '1.1rem'
                                    }
                                }}
                            >
                                <InputLabel
                                    id="servicio-label"
                                    sx={{
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    }}
                                >
                                    Servicio *
                                </InputLabel>
                                <Select
                                    labelId="servicio-label"
                                    id="servicio_id"
                                    name="servicio_id"
                                    value={formik.values.servicio_id}
                                    label="Servicio *"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 300,
                                                '& .MuiMenuItem-root': {
                                                    fontSize: '1rem',
                                                    minHeight: '48px',
                                                    padding: '12px 16px'
                                                }
                                            }
                                        }
                                    }}
                                >
                                    {!servicio_cbx || !Array.isArray(servicio_cbx) || servicio_cbx.length === 0 ? (
                                        <MenuItem disabled>
                                            {!servicio_cbx ? 'Cargando servicios...' : 'No hay servicios disponibles'}
                                        </MenuItem>
                                    ) : (
                                        servicio_cbx.map((servicio) => (
                                            <MenuItem key={servicio.value} value={servicio.value}>
                                                {servicio.label}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                                <FormHelperText sx={{ fontSize: '0.9rem', mt: 1 }}>
                                    {formik.touched.servicio_id && formik.errors.servicio_id}
                                </FormHelperText>
                            </FormControl>
                        </Grid>

                        {/* Estado */}
                        <Grid item xs={12} md={6}>
                            <FormControl
                                fullWidth
                                error={formik.touched.estado && Boolean(formik.errors.estado)}
                                disabled={isLoading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: '56px',
                                        fontSize: '1.1rem'
                                    },
                                    '& .MuiInputLabel-root': {
                                        fontSize: '1.1rem'
                                    }
                                }}
                            >
                                <InputLabel
                                    id="estado-label"
                                    sx={{
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    }}
                                >
                                    Estado *
                                </InputLabel>
                                <Select
                                    labelId="estado-label"
                                    id="estado"
                                    name="estado"
                                    value={formik.values.estado}
                                    label="Estado *"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 300,
                                                '& .MuiMenuItem-root': {
                                                    fontSize: '1rem',
                                                    minHeight: '48px',
                                                    padding: '12px 16px'
                                                }
                                            }
                                        }
                                    }}
                                >
                                    {estadosReserva.map((estado) => (
                                        <MenuItem key={estado.value} value={estado.value}>
                                            {estado.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText sx={{ fontSize: '0.9rem', mt: 1 }}>
                                    {formik.touched.estado && formik.errors.estado}
                                </FormHelperText>
                            </FormControl>
                        </Grid>

                        {/* Fecha */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                id="fecha"
                                name="fecha"
                                label="Fecha *"
                                type="date"
                                variant="outlined"
                                value={formik.values.fecha}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.fecha && Boolean(formik.errors.fecha)}
                                helperText={formik.touched.fecha && formik.errors.fecha}
                                disabled={isLoading}
                                InputLabelProps={{
                                    shrink: true,
                                    sx: {
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: '56px',
                                        fontSize: '1.1rem'
                                    },
                                    '& .MuiFormHelperText-root': {
                                        fontSize: '0.9rem'
                                    }
                                }}
                            />
                        </Grid>

                        {/* Precio Total */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                id="precio_total"
                                name="precio_total"
                                label="Precio Total *"
                                type="number"
                                variant="outlined"
                                value={formik.values.precio_total}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.precio_total && Boolean(formik.errors.precio_total)}
                                helperText={formik.touched.precio_total && formik.errors.precio_total}
                                disabled={isLoading}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AttachMoney />
                                        </InputAdornment>
                                    ),
                                    inputProps: {
                                        step: '0.01',
                                        min: '0',
                                        max: '999999.99'
                                    }
                                }}
                                InputLabelProps={{
                                    sx: {
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: '56px',
                                        fontSize: '1.1rem'
                                    },
                                    '& .MuiFormHelperText-root': {
                                        fontSize: '0.9rem'
                                    }
                                }}
                            />
                        </Grid>

                        {/* Horarios */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                id="hora_inicio"
                                name="hora_inicio"
                                label="Hora de Inicio *"
                                type="time"
                                variant="outlined"
                                value={formik.values.hora_inicio}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.hora_inicio && Boolean(formik.errors.hora_inicio)}
                                helperText={formik.touched.hora_inicio && formik.errors.hora_inicio}
                                disabled={isLoading}
                                InputLabelProps={{
                                    shrink: true,
                                    sx: {
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: '56px',
                                        fontSize: '1.1rem'
                                    },
                                    '& .MuiFormHelperText-root': {
                                        fontSize: '0.9rem'
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                id="hora_fin"
                                name="hora_fin"
                                label="Hora de Fin *"
                                type="time"
                                variant="outlined"
                                value={formik.values.hora_fin}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.hora_fin && Boolean(formik.errors.hora_fin)}
                                helperText={formik.touched.hora_fin && formik.errors.hora_fin}
                                disabled={isLoading}
                                InputLabelProps={{
                                    shrink: true,
                                    sx: {
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: '56px',
                                        fontSize: '1.1rem'
                                    },
                                    '& .MuiFormHelperText-root': {
                                        fontSize: '0.9rem'
                                    }
                                }}
                            />
                        </Grid>

                        {/* Notas */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="notas"
                                name="notas"
                                label="Notas"
                                multiline
                                rows={4}
                                variant="outlined"
                                value={formik.values.notas}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.notas && Boolean(formik.errors.notas)}
                                helperText={formik.touched.notas && formik.errors.notas}
                                disabled={isLoading}
                                placeholder="Información adicional sobre la reserva (opcional)"
                                InputLabelProps={{
                                    sx: {
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        fontSize: '1.1rem'
                                    },
                                    '& .MuiFormHelperText-root': {
                                        fontSize: '0.9rem'
                                    }
                                }}
                            />
                        </Grid>

                        {/* Botones */}
                        <Grid item xs={12}>
                            <Box sx={{
                                display: 'flex',
                                gap: 3,
                                justifyContent: 'center',
                                mt: 4,
                                flexWrap: 'wrap'
                            }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Cancel />}
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    sx={{
                                        minWidth: '140px',
                                        height: '48px',
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        borderRadius: 2,
                                        borderWidth: 2,
                                        '&:hover': {
                                            borderWidth: 2
                                        }
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                    disabled={isLoading}
                                    sx={{
                                        minWidth: '140px',
                                        height: '48px',
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        borderRadius: 2,
                                        boxShadow: 3,
                                        '&:hover': {
                                            boxShadow: 4
                                        }
                                    }}
                                >
                                    {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};