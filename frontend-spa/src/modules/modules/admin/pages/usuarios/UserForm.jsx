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
    Alert
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useUserStore } from '../../../../../store/modules/usuario/hooks';
import { useNavigate } from 'react-router-dom';
import { useAuditoriaStore } from '../../../../../store';
import { useAuthStore } from '../../../../../hooks';

// Esquema de validación con Yup
const validationSchema = Yup.object({
    nombre: Yup.string()
        .required('El nombre es requerido')
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    email: Yup.string()
        .email('Ingrese un email válido')
        .required('El email es requerido')
        .max(150, 'El email no puede exceder 150 caracteres'),
    password: Yup.string()
        .when('isEditing', {
            is: false,
            then: (schema) => schema.required('La contraseña es requerida'),
            otherwise: (schema) => schema.notRequired()
        })
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(255, 'La contraseña no puede exceder 255 caracteres'),
    confirmPassword: Yup.string()
        .when('password', {
            is: (password) => password && password.length > 0,
            then: (schema) => schema
                .required('Confirme la contraseña')
                .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden'),
            otherwise: (schema) => schema.notRequired()
        }),
    telefono: Yup.string()
        .nullable()
        .max(20, 'El teléfono no puede exceder 20 caracteres')
        .matches(/^[\+]?[0-9\-\s]*$/, 'Formato de teléfono inválido'),
    rol: Yup.string()
        .required('El rol es requerido')
        .oneOf(['admin', 'empleado', 'cliente'], 'Seleccione un rol válido'),
    activo: Yup.boolean()
});

export const UserForm = () => {

    const navigate = useNavigate();

    const {
        active,
        isLoading,
        errorMessage,
        serverMessage,
        errorAtributes,
        startSavingUser,
        startClearMessage,
    } = useUserStore();

    const { startSavingAuditoria } = useAuditoriaStore();


    const { user } = useAuthStore();

    console.log('user:', user);

    const isEditing = Boolean(active?.id);

    const formik = useFormik({
        initialValues: {
            nombre: active?.nombre || '',
            email: active?.email || '',
            password: '',
            confirmPassword: '',
            telefono: active?.telefono || '',
            rol: active?.rol || 'cliente',
            activo: active?.activo !== undefined ? active.activo : true,
            isEditing
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const userData = {
                ...values,
                id: active?.id
            };

            // Si estamos editando y no se cambió la contraseña, no la enviamos
            if (isEditing && !values.password) {
                delete userData.password;
            }

            // Remover campos que no se envían al servidor
            delete userData.confirmPassword;
            delete userData.isEditing;

            try {
                const result = await startSavingUser(userData);
                console.log('result', result);
                if (result && result.success) {
                    const auditoriaData = {
                        usuario_id: user.id, // O el ID del usuario logueado
                        accion: active?.id ? "UPDATE" : "CREATE",
                        tabla_afectada: "usuarios",
                        registro_id: result.data.id,
                        valores_anteriores: active?.id ? active : null,
                        valores_nuevos: result.data,
                        resultado: "exitoso",
                        descripcion: active?.id
                            ? `Usuario actualizado exitosamente`
                            : `Usuario creado exitosamente`
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
                    tabla_afectada: "usuarios",
                    registro_id: active?.id || null,
                    valores_anteriores: active?.id ? active : null,
                    valores_nuevos: userData,
                    resultado: "error",
                    descripcion: `Error al ${active?.id ? 'actualizar' : 'crear'} usuario: ${error.message}`
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

    return (
        <Box sx={{ maxWidth: 1000, margin: 'auto', p: 3 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" component="h1" gutterBottom>
                    {isEditing ? 'Editar Usuario' : 'Crear Usuario'}
                </Typography>

                {/* Mensajes de error/éxito */}
                {errorMessage && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={startClearMessage}>
                        {errorMessage}
                    </Alert>
                )}

                {serverMessage && (
                    <Alert severity="info" sx={{ mb: 2 }} onClose={startClearMessage}>
                        {serverMessage}
                    </Alert>
                )}

                <Box component="form" onSubmit={formik.handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Nombre */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="nombre"
                                name="nombre"
                                label="Nombre *"
                                variant="outlined"
                                value={formik.values.nombre}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                                helperText={formik.touched.nombre && formik.errors.nombre}
                                disabled={isLoading}
                            />
                        </Grid>

                        {/* Email */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="email"
                                name="email"
                                label="Email *"
                                type="email"
                                variant="outlined"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                                disabled={isLoading}
                            />
                        </Grid>

                        {/* Contraseña */}
                        {isEditing ?
                            <>
                            </>
                            :
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="password"
                                        name="password"
                                        label={isEditing ? 'Nueva Contraseña' : 'Contraseña *'}
                                        type="password"
                                        variant="outlined"
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.password && Boolean(formik.errors.password)}
                                        helperText={formik.touched.password && formik.errors.password}
                                        disabled={isLoading}
                                        placeholder={isEditing ? 'Dejar vacío para no cambiar' : ''}
                                    />
                                </Grid>

                                {/* Confirmar Contraseña */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        label="Confirmar Contraseña"
                                        type="password"
                                        variant="outlined"
                                        value={formik.values.confirmPassword}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                                        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                                        disabled={isLoading}
                                    />
                                </Grid>
                            </>
                        }

                        {/* Teléfono */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="telefono"
                                name="telefono"
                                label="Teléfono"
                                variant="outlined"
                                value={formik.values.telefono}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.telefono && Boolean(formik.errors.telefono)}
                                helperText={formik.touched.telefono && formik.errors.telefono}
                                disabled={isLoading}
                            />
                        </Grid>

                        {/* Rol */}
                        <Grid item xs={12} sm={6}>
                            <FormControl
                                fullWidth
                                error={formik.touched.rol && Boolean(formik.errors.rol)}
                                disabled={isLoading}
                            >
                                <InputLabel id="rol-label">Rol *</InputLabel>
                                <Select
                                    labelId="rol-label"
                                    id="rol"
                                    name="rol"
                                    value={formik.values.rol}
                                    label="Rol *"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    <MenuItem value="cliente">Cliente</MenuItem>
                                    <MenuItem value="empleado">Empleado</MenuItem>
                                    <MenuItem value="admin">Administrador</MenuItem>
                                </Select>
                                <FormHelperText>
                                    {formik.touched.rol && formik.errors.rol}
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
                                    />
                                }
                                label="Usuario Activo"
                            />
                        </Grid>

                        {/* Botones */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Cancel />}
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
};
