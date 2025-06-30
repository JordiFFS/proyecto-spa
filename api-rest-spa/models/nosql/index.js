
// Importar todos los modelos de MongoDB
const sugerenciaModel = require('./sugerencia');
const auditoriaModel = require('./auditoria');
const notificacionModel = require('./notificacion');
const historialReservaModel = require('./historialReseva');

module.exports = {
    sugerenciaModel,
    auditoriaModel,
    notificacionModel,
    historialReservaModel
};