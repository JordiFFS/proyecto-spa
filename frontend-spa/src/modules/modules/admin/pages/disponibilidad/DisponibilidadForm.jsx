// Versión con debugging para identificar el problema
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
    Switch,
    FormControlLabel,
    CircularProgress,
    Alert,
    Container
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDisponibilidadStore } from '../../../../../store';
import { useGetComboxBox } from '../../../../components';

// Motivos predefinidos para bloqueos
const motivosBloqueo = [
    'Vacaciones',
    'Permiso médico',
    'Capacitación',
    'Evento personal',
    'Mantenimiento',
    'Reunión',
    'Otro'
];

// Esquema de validación con Yup
const validationSchema = Yup.object({
    empleado_id: Yup.number()
        .required('El empleado es requerido')
        .positive('Seleccione un empleado válido'),
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
    disponible: Yup.boolean(),
    motivo: Yup.string()
        .nullable()
        .max(255, 'El motivo no puede exceder 255 caracteres')
        .when('disponible', {
            is: false,
            then: (schema) => schema.required('El motivo es requerido cuando no está disponible'),
            otherwise: (schema) => schema.nullable()
        })
});

export const DisponibilidadForm = () => {
    const navigate = useNavigate();

    const {
        active,
        isLoading,
        errorMessage,
        serverMessage,
        errorAtributes,
        startSavingDisponibilidad,
        startClearMessage,
    } = useDisponibilidadStore();

    const {
        userRol_cbx,
        startGetUserRolCbx
    } = useGetComboxBox();

    const isEditing = Boolean(active?.id);
    
    useEffect(() => {
        console.log('🔍 Iniciando carga de empleados...');
        const loadEmployees = async () => {
            try {
                console.log('🔍 Llamando a startGetUserRolCbx...');
                await startGetUserRolCbx('empleado');
                console.log('✅ startGetUserRolCbx completado');
            } catch (error) {
                console.error('❌ Error en startGetUserRolCbx:', error);
            }
        };
        loadEmployees();
    }, []);

    const formik = useFormik({
        initialValues: {
            empleado_id: active?.empleado_id || '',
            fecha: active?.fecha || '',
            hora_inicio: active?.hora_inicio || '',
            hora_fin: active?.hora_fin || '',
            disponible: active?.disponible !== undefined ? active.disponible : true,
            motivo: active?.motivo || ''
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const disponibilidadData = {
                ...values,
                id: active?.id,
                // Si está disponible, limpiar el motivo
                motivo: values.disponible ? null : values.motivo
            };

            await startSavingDisponibilidad(disponibilidadData);
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

    // Manejar cambio de disponibilidad
    const handleDisponibleChange = (event) => {
        const isDisponible = event.target.checked;
        formik.setFieldValue('disponible', isDisponible);

        // Si se marca como disponible, limpiar el motivo
        if (isDisponible) {
            formik.setFieldValue('motivo', '');
        }
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
                    {isEditing ? 'Editar Disponibilidad' : 'Crear Disponibilidad'}
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
                        {/* Empleado */}
                        <Grid item xs={12}>
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
                                    {/* DEBUG: Mostrar mensaje si no hay datos */}
                                    {!userRol_cbx || !Array.isArray(userRol_cbx) || userRol_cbx.length === 0 ? (
                                        <MenuItem disabled>
                                            {!userRol_cbx ? 'Cargando empleados...' : 'No hay empleados disponibles'}
                                        </MenuItem>
                                    ) : (
                                        userRol_cbx.map((empleado) => {
                                            console.log('🔸 Renderizando empleado:', empleado);
                                            return (
                                                <MenuItem key={empleado.value} value={empleado.value}>
                                                    {empleado.label}
                                                </MenuItem>
                                            );
                                        })
                                    )}
                                </Select>
                                <FormHelperText sx={{ fontSize: '0.9rem', mt: 1 }}>
                                    {formik.touched.empleado_id && formik.errors.empleado_id}
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

                        {/* Estado Disponible */}
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        id="disponible"
                                        name="disponible"
                                        checked={formik.values.disponible}
                                        onChange={handleDisponibleChange}
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
                                        {formik.values.disponible ? 'Disponible' : 'No Disponible'}
                                    </Typography>
                                }
                                sx={{
                                    mt: 2,
                                    '& .MuiFormControlLabel-label': {
                                        color: formik.values.disponible ? 'success.main' : 'error.main'
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

                        {/* Motivo - Solo visible cuando no está disponible */}
                        {!formik.values.disponible && (
                            <Grid item xs={12}>
                                <FormControl
                                    fullWidth
                                    error={formik.touched.motivo && Boolean(formik.errors.motivo)}
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
                                        id="motivo-label"
                                        sx={{
                                            fontSize: '1.1rem',
                                            fontWeight: 500
                                        }}
                                    >
                                        Motivo *
                                    </InputLabel>
                                    <Select
                                        labelId="motivo-label"
                                        id="motivo"
                                        name="motivo"
                                        value={formik.values.motivo}
                                        label="Motivo *"
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
                                        {motivosBloqueo.map((motivo) => (
                                            <MenuItem key={motivo} value={motivo}>
                                                {motivo}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText sx={{ fontSize: '0.9rem', mt: 1 }}>
                                        {formik.touched.motivo && formik.errors.motivo}
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                        )}

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