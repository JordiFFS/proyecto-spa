import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from "../../hooks"
import { AuthLayout } from "../layout";
import register from '/img/foto6.webp'; // Usa la misma imagen o cambia por una específica
import logo from '/img/logo.jpg';
import {
    Alert,
    Box,
    Button,
    IconButton,
    InputAdornment,
    Link,
    TextField,
    Typography,
    Paper,
    Divider,
    MenuItem,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Person,
    Lock,
    Email,
    Phone,
    AccountCircle
} from '@mui/icons-material';
import { Field, Form, Formik } from "formik";
import * as Yup from 'yup';

export const RegisterPages = () => {
    const {
        status,
        errorMessage,
        startRegister,
        startClearErrorMessage,
    } = useAuthStore();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

    const isAuthenticating = useMemo(() => status === 'checking', [status]);

    const onRegister = async (values) => {
        // Eliminamos confirmPassword antes de enviar al servidor
        const { confirmPassword, ...registerData } = values;

        console.log(confirmPassword);

        const result = await startRegister({
            nombre: registerData.nombre.trim(),
            email: registerData.email.trim(),
            password: registerData.password.trim(),
            telefono: registerData.telefono.trim(),
            rol: registerData.rol
        });

        console.log('🔄 Resultado del registro:', result);
    };

    useEffect(() => {
        startClearErrorMessage();
    }, [])

    return (
        <AuthLayout title="Crear Cuenta" imgSrc={register}>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* LOGO */}
                <Box sx={{ mb: 1, textAlign: 'center' }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            mb: 2
                        }}
                    >
                        Completa tus datos para registrarte
                    </Typography>
                </Box>

                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        width: '100%',
                        maxWidth: '450px',
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <Formik
                        initialValues={{
                            nombre: '',
                            email: '',
                            password: '',
                            confirmPassword: '',
                            telefono: '',
                            rol: 'cliente',
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            onRegister(values).finally(() => {
                                setSubmitting(false);
                            });
                        }}
                    >
                        {({ errors, touched, isSubmitting }) => (
                            <Form>

                                {/* NOMBRE */}
                                <Box sx={{ mb: 3 }}>
                                    <Field
                                        as={TextField}
                                        autoComplete="name"
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                        label="Nombre Completo"
                                        placeholder="Juan Pérez"
                                        name="nombre"
                                        error={errors.nombre && touched.nombre}
                                        helperText={errors.nombre && touched.nombre && errors.nombre}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Person sx={{ color: '#4a6572' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover fieldset': {
                                                    borderColor: '#4a6572',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#4a6572',
                                                },
                                            },
                                        }}
                                    />
                                </Box>

                                {/* EMAIL */}
                                <Box sx={{ mb: 3 }}>
                                    <Field
                                        as={TextField}
                                        autoComplete="email"
                                        type="email"
                                        fullWidth
                                        variant="outlined"
                                        label="Correo Electrónico"
                                        placeholder="ejemplo@correo.com"
                                        name="email"
                                        error={errors.email && touched.email}
                                        helperText={errors.email && touched.email && errors.email}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Email sx={{ color: '#4a6572' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover fieldset': {
                                                    borderColor: '#4a6572',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#4a6572',
                                                },
                                            },
                                        }}
                                    />
                                </Box>

                                {/* TELÉFONO */}
                                <Box sx={{ mb: 3 }}>
                                    <Field
                                        as={TextField}
                                        autoComplete="tel"
                                        type="tel"
                                        fullWidth
                                        variant="outlined"
                                        label="Teléfono (Opcional)"
                                        placeholder="0987654321"
                                        name="telefono"
                                        error={errors.telefono && touched.telefono}
                                        helperText={errors.telefono && touched.telefono && errors.telefono}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Phone sx={{ color: '#4a6572' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover fieldset': {
                                                    borderColor: '#4a6572',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#4a6572',
                                                },
                                            },
                                        }}
                                    />
                                </Box>


                                {/* PASSWORD */}
                                <Box sx={{ mb: 3 }}>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        variant="outlined"
                                        type={showPassword ? 'text' : 'password'}
                                        label="Contraseña"
                                        placeholder="Mínimo 8 caracteres"
                                        name="password"
                                        autoComplete="new-password"
                                        error={errors.password && touched.password}
                                        helperText={errors.password && touched.password && errors.password}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock sx={{ color: '#4a6572' }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                        sx={{ color: '#4a6572' }}
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover fieldset': {
                                                    borderColor: '#4a6572',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#4a6572',
                                                },
                                            },
                                        }}
                                    />
                                </Box>

                                {/* CONFIRM PASSWORD */}
                                <Box sx={{ mb: 3 }}>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        variant="outlined"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        label="Confirmar Contraseña"
                                        placeholder="Repite tu contraseña"
                                        name="confirmPassword"
                                        autoComplete="new-password"
                                        error={errors.confirmPassword && touched.confirmPassword}
                                        helperText={errors.confirmPassword && touched.confirmPassword && errors.confirmPassword}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock sx={{ color: '#4a6572' }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle confirm password visibility"
                                                        onClick={handleClickShowConfirmPassword}
                                                        edge="end"
                                                        sx={{ color: '#4a6572' }}
                                                    >
                                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover fieldset': {
                                                    borderColor: '#4a6572',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#4a6572',
                                                },
                                            },
                                        }}
                                    />
                                </Box>

                                {/* Error Message */}
                                {errorMessage?.show && (
                                    <Box sx={{ mb: 3 }}>
                                        <Alert
                                            severity={errorMessage.variant || 'error'}
                                            sx={{
                                                borderRadius: 2,
                                                '&.MuiAlert-standardError': {
                                                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                                    color: '#d32f2f',
                                                },
                                            }}
                                        >
                                            {errorMessage.message}
                                        </Alert>
                                    </Box>
                                )}

                                {/* REGISTER BUTTON */}
                                <Button
                                    disabled={isAuthenticating || isSubmitting}
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        mt: 2,
                                        mb: 3,
                                        borderRadius: 3,
                                        background: 'linear-gradient(45deg, #4a6572 30%, #5a7582 90%)',
                                        boxShadow: '0 3px 5px 2px rgba(74, 101, 114, .3)',
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        textTransform: 'none',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #3a5562 30%, #4a6572 90%)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 5px 10px 2px rgba(74, 101, 114, .4)',
                                        },
                                        '&:disabled': {
                                            background: 'rgba(74, 101, 114, 0.5)',
                                        },
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {isAuthenticating ? 'Registrando...' : 'Crear Cuenta'}
                                </Button>

                                {/* DIVIDER */}
                                <Divider sx={{ my: 2, color: 'text.secondary' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        ¿Ya tienes cuenta?
                                    </Typography>
                                </Divider>

                                {/* LOGIN BUTTON */}
                                <Button
                                    component={RouterLink}
                                    to="/auth/login"
                                    fullWidth
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        borderRadius: 3,
                                        borderColor: '#4a6572',
                                        color: '#4a6572',
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        textTransform: 'none',
                                        '&:hover': {
                                            borderColor: '#3a5562',
                                            backgroundColor: 'rgba(74, 101, 114, 0.05)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 3px 8px rgba(74, 101, 114, 0.2)',
                                        },
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    Iniciar Sesión
                                </Button>

                            </Form>
                        )}
                    </Formik>
                </Paper>
            </Box>
        </AuthLayout>
    )
}

// Validaciones con Yup
const validationSchema = Yup.object().shape({
    nombre: Yup.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .required('Ingrese su nombre completo'),
    email: Yup.string()
        .email('Ingrese un correo electrónico válido')
        .max(150, 'El correo no puede exceder 150 caracteres')
        .required('Ingrese su correo electrónico'),
    password: Yup.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(255, 'La contraseña no puede exceder 255 caracteres')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'
        )
        .required('Ingrese su contraseña'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
        .required('Confirme su contraseña'),
    telefono: Yup.string()
        .max(20, 'El teléfono no puede exceder 20 caracteres')
        .matches(
            /^[\d\s\+\-\(\)]*$/,
            'El teléfono solo puede contener números, espacios, +, -, ( y )'
        )
        .nullable(),
});