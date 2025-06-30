const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../../models/psql');

if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET no está definido en las variables de entorno');
    process.exit(1);
}

const authController = {
    // Login de usuario
    login: async (req, res) => {
        try {
            console.log('🔑 Login iniciado');
            console.log('Body recibido:', req.body);
            console.log('Headers:', req.headers);
            
            // Verificar que req.body existe y no está vacío
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    ok: false,
                    msg: 'No se recibieron datos en el body'
                });
            }
            
            const { email, password } = req.body;

            // Validar que se envíen email y password
            if (!email || !password) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Email y contraseña son requeridos'
                });
            }

            // Buscar usuario por email
            const usuario = await Usuario.findOne({
                where: { 
                    email: email.toLowerCase(),
                    activo: true 
                }
            });

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Credenciales incorrectas'
                });
            }

            // Verificar contraseña
            const validPassword = bcrypt.compareSync(password, usuario.password);
            if (!validPassword) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Credenciales incorrectas'
                });
            }

            // Generar JWT
            const token = jwt.sign(
                { 
                    id: usuario.id,
                    email: usuario.email,
                    rol: usuario.rol
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Respuesta exitosa
            res.json({
                ok: true,
                user: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    telefono: usuario.telefono,
                    rol: usuario.rol
                },
                token
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                ok: false,
                msg: 'Error interno del servidor'
            });
        }
    },

    // Registro de usuario
    register: async (req, res) => {
        try {
            console.log('📝 Register iniciado');
            console.log('Body recibido en register:', req.body);
            console.log('Headers:', req.headers);
            
            // Verificar que req.body existe y no está vacío
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    ok: false,
                    msg: 'No se recibieron datos en el body'
                });
            }
            
            const { nombre, email, password, telefono, rol } = req.body;

            // Validaciones básicas
            if (!nombre || !email || !password) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Nombre, email y contraseña son requeridos'
                });
            }

            // Verificar si el email ya existe
            const existeUsuario = await Usuario.findOne({
                where: { email: email.toLowerCase() }
            });

            if (existeUsuario) {
                return res.status(400).json({
                    ok: false,
                    msg: 'El email ya está registrado'
                });
            }

            // Validar longitud de contraseña
            if (password.length < 6) {
                return res.status(400).json({
                    ok: false,
                    msg: 'La contraseña debe tener al menos 6 caracteres'
                });
            }

            // Encriptar contraseña
            const salt = bcrypt.genSaltSync();
            const hashedPassword = bcrypt.hashSync(password, salt);

            // Crear usuario
            const nuevoUsuario = await Usuario.create({
                nombre,
                email: email.toLowerCase(),
                password: hashedPassword,
                telefono: telefono || null,
                rol: rol || 'cliente'
            });

            // Generar JWT
            const token = jwt.sign(
                { 
                    id: nuevoUsuario.id,
                    email: nuevoUsuario.email,
                    rol: nuevoUsuario.rol
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Respuesta exitosa
            res.status(201).json({
                ok: true,
                user: {
                    id: nuevoUsuario.id,
                    nombre: nuevoUsuario.nombre,
                    email: nuevoUsuario.email,
                    telefono: nuevoUsuario.telefono,
                    rol: nuevoUsuario.rol
                },
                token
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                ok: false,
                msg: 'Error interno del servidor'
            });
        }
    },

    // Renovar token
    renewToken: async (req, res) => {
        try {
            const { id } = req.user; // Viene del middleware de validación

            // Buscar usuario
            const usuario = await Usuario.findByPk(id);

            if (!usuario || !usuario.activo) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Usuario no válido'
                });
            }

            // Generar nuevo JWT
            const token = jwt.sign(
                { 
                    id: usuario.id,
                    email: usuario.email,
                    rol: usuario.rol
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Respuesta exitosa
            res.json({
                ok: true,
                user: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    telefono: usuario.telefono,
                    rol: usuario.rol
                },
                token
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                ok: false,
                msg: 'Error interno del servidor'
            });
        }
    }
};

module.exports = authController;