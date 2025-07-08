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
    Chip,
    OutlinedInput,
    Autocomplete,
    Container
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEmployeStore } from '../../../../../store';
import { useGetComboxBox } from '../../../../components';

// Días de la semana disponibles
const diasSemana = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miércoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sábado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
];

// Especialidades disponibles (puedes ajustar según tus necesidades)
const especialidades = [
    'Masajista',
    'Esteticista',
    'Terapeuta',
    'Manicurista',
    'Pedicurista',
    'Depiladora',
    'Cosmetóloga',
    'Otra'
];

// Esquema de validación con Yup
const validationSchema = Yup.object({
    usuario_id: Yup.number()
        .required('El usuario es requerido')
        .positive('Seleccione un usuario válido'),
    especialidad: Yup.string()
        .nullable()
        .max(100, 'La especialidad no puede exceder 100 caracteres'),
    horario_inicio: Yup.string()
        .required('El horario de inicio es requerido')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    horario_fin: Yup.string()
        .required('El horario de fin es requerido')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
        .test('horario-fin-mayor', 'El horario de fin debe ser mayor al de inicio', function (value) {
            const { horario_inicio } = this.parent;
            if (!horario_inicio || !value) return true;

            const inicio = new Date(`2000-01-01T${horario_inicio}:00`);
            const fin = new Date(`2000-01-01T${value}:00`);

            return fin > inicio;
        }),
    dias_trabajo: Yup.array()
        .of(Yup.string())
        .min(1, 'Debe seleccionar al menos un día de trabajo')
        .required('Los días de trabajo son requeridos'),
    activo: Yup.boolean()
});

export const EmployeForm = ({ usuarios = [] }) => {
    const navigate = useNavigate();

    const {
        active,
        isLoading,
        errorMessage,
        serverMessage,
        errorAtributes,
        startSavingEmploye,
        startClearMessage,
    } = useEmployeStore();

    const {
        user_cbx,
        startGetUserCbx
    } = useGetComboxBox();

    const isEditing = Boolean(active?.id);

    const formik = useFormik({
        initialValues: {
            usuario_id: active?.usuario_id || '',
            especialidad: active?.especialidad || '',
            horario_inicio: active?.horario_inicio || '',
            horario_fin: active?.horario_fin || '',
            dias_trabajo: active?.dias_trabajo || [],
            activo: active?.activo !== undefined ? active.activo : true
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const employeData = {
                ...values,
                id: active?.id
            };

            await startSavingEmploye(employeData);
        }
    });

    console.log('user_cbx', user_cbx);
    useEffect(() => {
        startGetUserCbx();
    }, [])

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

    const handleDiasChange = (event) => {
        const value = event.target.value;
        formik.setFieldValue('dias_trabajo', typeof value === 'string' ? value.split(',') : value);
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
                    {isEditing ? 'Editar Empleado' : 'Crear Empleado'}
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
                        <Grid item xs={12}>
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
                                    {Array.isArray(user_cbx) && user_cbx.map((usuario) => (
                                        <MenuItem key={usuario.value} value={usuario.value}>
                                            {usuario.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText sx={{ fontSize: '0.9rem', mt: 1 }}>
                                    {formik.touched.usuario_id && formik.errors.usuario_id}
                                </FormHelperText>
                            </FormControl>
                        </Grid>

                        {/* Especialidad */}
                        <Grid item xs={12}>
                            <Autocomplete
                                id="especialidad"
                                options={especialidades}
                                value={formik.values.especialidad}
                                onChange={(event, newValue) => {
                                    formik.setFieldValue('especialidad', newValue);
                                }}
                                onBlur={formik.handleBlur}
                                freeSolo
                                disabled={isLoading}
                                ListboxProps={{
                                    sx: {
                                        '& .MuiAutocomplete-option': {
                                            fontSize: '1rem',
                                            minHeight: '48px',
                                            padding: '12px 16px'
                                        }
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Especialidad"
                                        variant="outlined"
                                        error={formik.touched.especialidad && Boolean(formik.errors.especialidad)}
                                        helperText={formik.touched.especialidad && formik.errors.especialidad}
                                        disabled={isLoading}
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
                                )}
                            />
                        </Grid>

                        {/* Horarios */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                id="horario_inicio"
                                name="horario_inicio"
                                label="Horario de Inicio *"
                                type="time"
                                variant="outlined"
                                value={formik.values.horario_inicio}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.horario_inicio && Boolean(formik.errors.horario_inicio)}
                                helperText={formik.touched.horario_inicio && formik.errors.horario_inicio}
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
                                id="horario_fin"
                                name="horario_fin"
                                label="Horario de Fin *"
                                type="time"
                                variant="outlined"
                                value={formik.values.horario_fin}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.horario_fin && Boolean(formik.errors.horario_fin)}
                                helperText={formik.touched.horario_fin && formik.errors.horario_fin}
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

                        {/* Días de trabajo */}
                        <Grid item xs={12}>
                            <FormControl
                                fullWidth
                                error={formik.touched.dias_trabajo && Boolean(formik.errors.dias_trabajo)}
                                disabled={isLoading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: '56px',
                                        fontSize: '1.1rem'
                                    },
                                    '& .MuiInputLabel-root': {
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    }
                                }}
                            >
                                <InputLabel id="dias-trabajo-label">Días de Trabajo *</InputLabel>
                                <Select
                                    labelId="dias-trabajo-label"
                                    id="dias_trabajo"
                                    multiple
                                    value={formik.values.dias_trabajo}
                                    onChange={handleDiasChange}
                                    onBlur={formik.handleBlur}
                                    input={<OutlinedInput label="Días de Trabajo *" />}
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
                                    renderValue={(selected) => (
                                        <Box sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 1,
                                            py: 0.5
                                        }}>
                                            {selected.map((value) => {
                                                const dia = diasSemana.find(d => d.value === value);
                                                return (
                                                    <Chip
                                                        key={value}
                                                        label={dia?.label || value}
                                                        size="medium"
                                                        sx={{
                                                            backgroundColor: 'primary.main',
                                                            color: 'white',
                                                            fontWeight: 500,
                                                            fontSize: '0.9rem',
                                                            height: '32px'
                                                        }}
                                                    />
                                                );
                                            })}
                                        </Box>
                                    )}
                                >
                                    {diasSemana.map((dia) => (
                                        <MenuItem key={dia.value} value={dia.value}>
                                            {dia.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText sx={{ fontSize: '0.9rem', mt: 1 }}>
                                    {formik.touched.dias_trabajo && formik.errors.dias_trabajo}
                                </FormHelperText>
                            </FormControl>
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
                                        Empleado Activo
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