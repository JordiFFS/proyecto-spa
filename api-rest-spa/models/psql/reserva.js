const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/sequelize");

const Reserva = sequelize.define('Reserva', {
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
    empleado_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'empleados',
            key: 'id'
        }
    },
    servicio_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'servicios',
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
    estado: {
        type: DataTypes.ENUM('pendiente', 'confirmada', 'completada', 'cancelada'),
        // type: DataTypes.ENUM([
        // { 
        // label: 'pendiente',
        //  value: '1' 
        // },
        //  { 
        // label: 'confirmada',
        //  value: '2' 
        // }, 
        // { label: 'completada',
        //  value: '3' 
        // }, 
        // { label: 'cancelada', 
        // value: '4' 
        // }
        // ]),
        allowNull: false,
        defaultValue: 'pendiente'
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    precio_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'reservas',
    timestamps: true
});

module.exports = Reserva;