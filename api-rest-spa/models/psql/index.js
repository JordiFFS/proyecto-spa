
const sequelize = require('../../config/sequelize');

// Importar todos los modelos
const Usuario = require('./usuario');
const Empleado = require('./empleado');
const Servicio = require('./servicio');
const Reserva = require('./reserva');
const Disponibilidad = require('./disponibilidad');

// Importar las asociaciones
require('./associations');

module.exports = {
    Usuario,
    Empleado,
    Servicio,
    Reserva,
    Disponibilidad,
    sequelize
};