const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/sequelize");

const Disponibilidad = sequelize.define('Disponibilidad', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    empleado_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'empleados',
            key: 'id'
        }
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false
    },
    hora_fin: {
        type: DataTypes.TIME,
        allowNull: false
    },
    disponible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    motivo: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'disponibilidad',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['empleado_id', 'fecha', 'hora_inicio']
        }
    ]
});

module.exports = Disponibilidad;