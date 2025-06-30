// middleware/validar-jwt.js
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models/psql');

const validarJWT = async (req, res, next) => {
    try {
        // Leer token del header
        const token = req.header('x-token') || req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                ok: false,
                msg: 'Token requerido'
            });
        }

        // Verificar token
        const { id } = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar usuario en la base de datos
        const usuario = await Usuario.findByPk(id);

        if (!usuario || !usuario.activo) {
            return res.status(401).json({
                ok: false,
                msg: 'Token no válido - usuario no existe'
            });
        }

        // Agregar usuario al request
        req.user = usuario;
        next();

    } catch (error) {
        console.error('Error en validación de token:', error);
        res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        });
    }
};

module.exports = {
    validarJWT
};