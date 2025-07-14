import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Grid,
    Switch,
    FormControlLabel,
    CircularProgress,
    Alert,
    Container,
    InputAdornment
} from '@mui/material';
import { Save, Cancel, AttachMoney, Schedule } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuditoriaStore, useServiceStore } from '../../../../../store';
import { useAuthStore } from '../../../../../hooks';

// Esquema de validación con Yup
const validationSchema = Yup.object({
    nombre: Yup.string()
        .required('El nombre es requerido')
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .min(2, 'El nombre debe tener al menos 2 caracteres'),
    descripcion: Yup.string()
        .nullable()
        .max(1000, 'La descripción no puede exceder 1000 caracteres'),
    duracion: Yup.number()
        .required('La duración es requerida')
        .positive('La duración debe ser un número positivo')
        .integer('La duración debe ser un número entero')
        .min(5, 'La duración mínima es 5 minutos')
        .max(480, 'La duración máxima es 480 minutos (8 horas)'),
    precio: Yup.number()
        .required('El precio es requerido')
        .positive('El precio debe ser un número positivo')
        .min(0.01, 'El precio mínimo es $0.01')
        .max(9999999.99, 'El precio máximo es $9,999,999.99'),
    activo: Yup.boolean()
});

export const ServicesForm = () => {
    const navigate = useNavigate();

    const {
        active,
        isLoading,
        errorMessage,
        serverMessage,
        errorAtributes,
        startSavingService,
        startClearMessage,
    } = useServiceStore();

    const { user } = useAuthStore();

    const { startSavingAuditoria } = useAuditoriaStore();

    const isEditing = Boolean(active?.id);

    const formik = useFormik({
        initialValues: {
            nombre: active?.nombre || '',
            descripcion: active?.descripcion || '',
            duracion: active?.duracion || '',
            precio: active?.precio || '',
            activo: active?.activo !== undefined ? active.activo : true
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const serviceData = {
                ...values,
                duracion: parseInt(values.duracion),
                precio: parseFloat(values.precio),
                id: active?.id
            };

            try {
                const result = await startSavingService(serviceData);
                if (result && result.success) {
                    const auditoriaData = {
                        usuario_id: user.id, // O el ID del usuario logueado
                        accion: active?.id ? "UPDATE" : "CREATE",
                        tabla_afectada: "servicios",
                        registro_id: result.data.id,
                        valores_anteriores: active?.id ? active : null,
                        valores_nuevos: result.data,
                        resultado: "exitoso",
                        descripcion: active?.id
                            ? `Servicio actualizado exitosamente`
                            : `Servicio creado exitosamente`
                    };

                    // Registrar en auditoría (sin await para que no bloquee)
                    startSavingAuditoria(auditoriaData).catch(error => {
                        console.error('Error al registrar auditoría:', error);
                    });
                }
            } catch (error) {
                const auditoriaData = {
                    usuario_id: user.id, // O el ID del usuario logueado
                    accion: active?.id ? "UPDATE" : "CREATE",
                    tabla_afectada: "reservas",
                    registro_id: active?.id || null,
                    valores_anteriores: active?.id ? active : null,
                    valores_nuevos: serviceData,
                    resultado: "error",
                    descripcion: `Error al ${active?.id ? 'actualizar' : 'crear'} reserva: ${error.message}`
                };

                startSavingAuditoria(auditoriaData).catch(auditError => {
                    console.error('Error al registrar auditoría de error:', auditError);
                });
            }

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

    // Función para formatear duración en horas y minutos
    const formatDuration = (minutes) => {
        if (!minutes) return '';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
        }
        return `${mins}min`;
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
                    {isEditing ? 'Editar Servicio' : 'Crear Servicio'}
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
                        {/* Nombre */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="nombre"
                                name="nombre"
                                label="Nombre del Servicio *"
                                variant="outlined"
                                value={formik.values.nombre}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                                helperText={formik.touched.nombre && formik.errors.nombre}
                                disabled={isLoading}
                                placeholder="Ej: Masaje Relajante, Limpieza Facial, Manicure"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: '56px',
                                        fontSize: '1.1rem'
                                    },
                                    '& .MuiInputLabel-root': {
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    },
                                    '& .MuiFormHelperText-root': {
                                        fontSize: '0.9rem'
                                    }
                                }}
                            />
                        </Grid>

                        {/* Descripción */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="descripcion"
                                name="descripcion"
                                label="Descripción"
                                variant="outlined"
                                multiline
                                rows={4}
                                value={formik.values.descripcion}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.descripcion && Boolean(formik.errors.descripcion)}
                                helperText={formik.touched.descripcion && formik.errors.descripcion}
                                disabled={isLoading}
                                placeholder="Describe los beneficios, técnicas o características especiales del servicio..."
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        fontSize: '1.1rem'
                                    },
                                    '& .MuiInputLabel-root': {
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    },
                                    '& .MuiFormHelperText-root': {
                                        fontSize: '0.9rem'
                                    }
                                }}
                            />
                        </Grid>

                        {/* Duración y Precio */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                id="duracion"
                                name="duracion"
                                label="Duración (minutos) *"
                                type="number"
                                variant="outlined"
                                value={formik.values.duracion}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.duracion && Boolean(formik.errors.duracion)}
                                helperText={
                                    formik.touched.duracion && formik.errors.duracion
                                        ? formik.errors.duracion
                                        : formik.values.duracion
                                            ? `Equivale a: ${formatDuration(parseInt(formik.values.duracion))}`
                                            : 'Ingresa la duración en minutos'
                                }
                                disabled={isLoading}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Schedule color="action" />
                                        </InputAdornment>
                                    ),
                                    inputProps: {
                                        min: 5,
                                        max: 480,
                                        step: 5
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: '56px',
                                        fontSize: '1.1rem'
                                    },
                                    '& .MuiInputLabel-root': {
                                        fontSize: '1.1rem',
                                        fontWeight: 500
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
                                id="precio"
                                name="precio"
                                label="Precio *"
                                type="number"
                                variant="outlined"
                                value={formik.values.precio}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.precio && Boolean(formik.errors.precio)}
                                helperText={formik.touched.precio && formik.errors.precio}
                                disabled={isLoading}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AttachMoney color="action" />
                                        </InputAdornment>
                                    ),
                                    inputProps: {
                                        min: 0.01,
                                        max: 9999999.99,
                                        step: 0.01
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: '56px',
                                        fontSize: '1.1rem'
                                    },
                                    '& .MuiInputLabel-root': {
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    },
                                    '& .MuiFormHelperText-root': {
                                        fontSize: '0.9rem'
                                    }
                                }}
                            />
                        </Grid>

                        {/* Estado Activo */}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        id="activo"
                                        name="activo"
                                        checked={formik.values.activo}
                                        onChange={formik.handleChange}
                                        disabled={isLoading}
                                        sx={{
                                            '& .MuiSwitch-switchBase': {
                                                padding: '9px'
                                            },
                                            '& .MuiSwitch-thumb': {
                                                width: 24,
                                                height: 24
                                            },
                                            '& .MuiSwitch-track': {
                                                height: 20,
                                                borderRadius: 10
                                            }
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                                        Servicio Activo
                                    </Typography>
                                }
                                sx={{ mt: 2 }}
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