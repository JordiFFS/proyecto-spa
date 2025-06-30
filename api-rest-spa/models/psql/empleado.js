const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/sequelize");

const Empleado = sequelize.define('Empleado', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    especialidad: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    horario_inicio: {
        type: DataTypes.TIME,
        allowNull: false
    },
    horario_fin: {
        type: DataTypes.TIME,
        allowNull: false
    },
    dias_trabajo: {
        type: DataTypes.JSON, // ['lunes', 'martes', etc.]
        allowNull: false
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'empleados',
    timestamps: true
});

module.exports = Empleado;