const mongoose = require('mongoose');

const dbConnect = async () => {
    const DB_URI = process.env.DB_URI;
    try {
        await mongoose.connect(DB_URI);
        console.log('Conectado a la base de datos de MongoDB');
    } catch (error) {
        console.log("No se pudo conectar a la base de datos", error);
    }
};

module.exports = dbConnect;
