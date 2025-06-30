const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.PG_URI, {
    dialect: 'postgres',
    logging: false, // Quita el SQL en consola, pon true si quieres verlo
});

const dbConnectSequelize = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a PostgreSQL con Sequelize');
    } catch (error) {
        console.error('❌ Error al conectar con PostgreSQL:', error);
    }
};

module.exports = { sequelize, dbConnectSequelize };
