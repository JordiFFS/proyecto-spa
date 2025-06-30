import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from "../../hooks"
import { AuthLayout } from "../layout";
import login from '/img/foto6.webp';
import logo from '/img/logo.jpg'; // Agrega tu logo aquí
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
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import { Field, Form, Formik } from "formik";
import * as Yup from 'yup';

export const LoginPages = () => {
    const {
        status,
        errorMessage,
        startLogin,
    } = useAuthStore();

    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const isAuthenticating = useMemo(() => status === 'checking', [status]);

    const onLogin = async (values) => {
        const result = await startLogin({
            email: values.email.trim(),
            password: values.password.trim()
        });

        console.log('🔄 Resultado del login:', result);
    };

    return (
        <AuthLayout title="Iniciar Sesión" imgSrc={login}>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* LOGO */}
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <img
                        src={logo}
                        alt="Logo"
                        style={{
                            height: '80px',
                            width: 'auto',
                            marginBottom: '16px'
                        }}
                    />
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            color: '#4a6572',
                            fontWeight: 'bold',
                            mb: 1
                        }}
                    >
                        Bienvenido
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            mb: 2
                        }}
                    >
                        Accede a tu cuenta para continuar
                    </Typography>
                </Box>

                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        width: '100%',
                        maxWidth: '400px',
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <Formik
                        initialValues={{
                            email: '',
                            password: '',
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            onLogin(values).finally(() => {
                                setSubmitting(false);
                            });
                        }}
                    >
                        {({ errors, touched, isSubmitting }) => (
                            <Form>

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

                                {/* PASSWORD */}
                                <Box sx={{ mb: 3 }}>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        variant="outlined"
                                        type={showPassword ? 'text' : 'password'}
                                        label="Contraseña"
                                        placeholder="Ingrese su contraseña"
                                        name="password"
                                        autoComplete="current-password"
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

                                {/* LOGIN BUTTON */}
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
                                    {isAuthenticating ? 'Ingresando...' : 'Iniciar Sesión'}
                                </Button>

                                {/* DIVIDER */}
                                <Divider sx={{ my: 2, color: 'text.secondary' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        ¿No tienes cuenta?
                                    </Typography>
                                </Divider>

                                {/* CREATE ACCOUNT BUTTON */}
                                <Button
                                    component={RouterLink}
                                    to="/auth/register"
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
                                    Crear Cuenta
                                </Button>

                            </Form>
                        )}
                    </Formik>
                </Paper>
            </Box>
        </AuthLayout>
    )
}

//Validaciones
const validationSchema = Yup.object().shape({
    email: Yup.string()
        .email('Ingrese un correo electrónico válido')
        .required('Ingrese su correo electrónico'),
    password: Yup.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .required('Ingrese su contraseña'),
});