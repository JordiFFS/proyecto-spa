const Usuario = require("./usuario");
const Empleado = require("./empleado");
const Reserva = require("./reserva");
const Servicio = require("./servicio");
const Disponibilidad = require("./disponibilidad");

// Definir todas las relaciones
Usuario.hasOne(Empleado, { foreignKey: 'usuario_id' });
Empleado.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Usuario.hasMany(Reserva, { foreignKey: 'usuario_id' });
Reserva.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Empleado.hasMany(Reserva, { foreignKey: 'empleado_id' });
Reserva.belongsTo(Empleado, { foreignKey: 'empleado_id' });

Servicio.hasMany(Reserva, { foreignKey: 'servicio_id' });
Reserva.belongsTo(Servicio, { foreignKey: 'servicio_id' });

Empleado.hasMany(Disponibilidad, { foreignKey: 'empleado_id' });
Disponibilidad.belongsTo(Empleado, { foreignKey: 'empleado_id' });

module.exports = {
    Usuario,
    Empleado,
    Servicio,
    Reserva,
    Disponibilidad
};