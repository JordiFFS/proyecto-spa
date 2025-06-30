const { Router } = require('express');
const { body } = require('express-validator');
const authController = require("../controllers/auth/authController");
const { validarCampos } = require("../utils/validarCampos");
const { validarJWT } = require("../validations/validarJWT");

const router = Router();

// Ruta de login
router.post('/login', [
    body('email', 'El email es obligatorio').isEmail(),
    body('password', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos
], authController.login);

// Ruta de registro
router.post('/register', [
    body('nombre', 'El nombre es obligatorio').not().isEmpty(),
    body('nombre', 'El nombre debe tener al menos 2 caracteres').isLength({ min: 2 }),
    body('email', 'El email es obligatorio').isEmail(),
    body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    body('telefono', 'El teléfono debe ser válido').optional().isMobilePhone(),
    body('rol', 'El rol debe ser válido').optional().isIn(['admin', 'empleado', 'cliente']),
    validarCampos
], authController.register);

// Ruta para renovar token
router.get('/renew', [
    validarJWT
], authController.renewToken);

module.exports = router;