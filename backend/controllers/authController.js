const { Admin } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    // 1. Buscar al admin por su nombre de usuario
    const admin = await Admin.findOne({ where: { usuario } });

    if (!admin) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // 2. Comparar la contraseña ingresada con la encriptada en la BD
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // 3. Generar el Token (El "Pase VIP")
    // Usamos una clave secreta simple para fines académicos. En producción iría en el .env
    const secret = process.env.JWT_SECRET || 'secreto_academico_super_seguro';

    const token = jwt.sign(
      { id: admin.id, nombre: admin.nombre }, // Datos que van dentro del token
      secret,
      { expiresIn: '8h' } // El token dura 8 horas
    );

    // 4. Responder con el token y los datos del admin (sin la contraseña)
    res.json({
      message: 'Bienvenido',
      token: token,
      admin: {
        id: admin.id,
        nombre: admin.nombre,
        usuario: admin.usuario
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// 1. LISTAR TODOS LOS ADMINS
const getAdmins = async (req, res) => {
  try {
    // Excluimos la contraseña por seguridad
    const admins = await Admin.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener admins' });
  }
};

// 2. CREAR NUEVO ADMIN (Solo otro admin puede hacerlo)
const createAdmin = async (req, res) => {
  try {
    const { usuario, password, nombre } = req.body;

    // Validar si ya existe
    const existente = await Admin.findOne({ where: { usuario } });
    if (existente) {
      return res.status(400).json({ message: 'El nombre de usuario ya existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nuevo = await Admin.create({
      usuario,
      password: hashedPassword,
      nombre
    });

    res.status(201).json({ message: 'Admin creado', admin: { id: nuevo.id, usuario: nuevo.usuario } });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear admin' });
  }
};

// 3. ELIMINAR ADMIN (Con validación de auto-eliminación)
const deleteAdmin = async (req, res) => {
  try {
    const idToDelete = parseInt(req.params.id);

    // Asumimos que el middleware de auth añade req.user con el ID del admin actual
    // (Si no lo tienes, el frontend bloqueará el botón, pero el backend debería validar también)

    await Admin.destroy({ where: { id: idToDelete } });
    res.json({ message: 'Admin eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar' });
  }
};

module.exports = { login, getAdmins, createAdmin, deleteAdmin };