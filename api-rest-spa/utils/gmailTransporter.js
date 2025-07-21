const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Tu correo Gmail
    pass: process.env.GMAIL_PASS, // Contraseña o App Password
  },
});

module.exports = transporter;