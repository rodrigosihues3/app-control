const cron = require('node-cron');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuración
const DB_PATH = path.join(__dirname, '../database.sqlite'); // Ruta a tu BD
const EMAIL_USER = process.env.EMAIL_USER; // Tu correo (agregalo al .env)
const EMAIL_PASS = process.env.EMAIL_PASS; // Tu contraseña de aplicación (agregalo al .env)
const EMAIL_TO = process.env.EMAIL_TO || EMAIL_USER; // A quién se le envía

// Configurar el transporte de correo (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Función para enviar el correo
const enviarBackup = async () => {
  console.log('📦 Iniciando proceso de respaldo automático...');

  try {
    // Verificamos si existe la base de datos
    if (!fs.existsSync(DB_PATH)) {
      console.error('❌ Error: No se encuentra el archivo de base de datos.');
      return;
    }

    const fecha = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

    const mailOptions = {
      from: `"Sistema de Asistencia" <${EMAIL_USER}>`,
      to: EMAIL_TO,
      subject: `Respaldo Base de Datos - ${fecha}`,
      text: 'Adjunto encontrarás la copia de seguridad de la base de datos actualizada.',
      attachments: [
        {
          filename: `backup_asistencia_${fecha}.sqlite`,
          path: DB_PATH, // Nodemailer lee el archivo directamente
        },
      ],
    };

    // Enviar
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Respaldo enviado por correo:', info.messageId);

  } catch (error) {
    console.error('❌ Error al enviar el respaldo:', error);
  }
};

// Inicializar el Cron Job
const iniciarScheduler = () => {
  // Programado para las 23:00 (11 PM) todos los días
  // Sintaxis Cron: Minuto Hora Día Mes DíaSemana
  cron.schedule('0 23 * * *', () => {
    console.log('⏰ Ejecutando tarea programada de respaldo...');
    enviarBackup();
  });

  console.log('📅 Sistema de respaldo automático programado (Diario a las 23:00)');
};

module.exports = { iniciarScheduler, enviarBackup };