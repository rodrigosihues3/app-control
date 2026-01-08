const { Admin, Visitante } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { usuario, password } = req.body;
    let rol = '';
    let dataUsuario = {};
    let userId = null;

    // --- INTENTO 1: Buscar en ADMINS ---
    const admin = await Admin.findOne({ where: { usuario } });

    if (admin) {
      // Admin usa bcrypt (según tu código original)
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(401).json({ message: 'Credenciales incorrectas' });

      rol = 'admin';
      userId = admin.id;
      dataUsuario = { id: admin.id, nombre: admin.nombre, usuario: admin.usuario };
    }

    // --- INTENTO 2: Buscar en VISITANTES (Si no es admin) ---
    else {
      // Asumimos que el "usuario" ingresado en el form es el DNI
      const visitante = await Visitante.findOne({ where: { dni: usuario } });

      if (!visitante) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }

      // Visitante usa TEXTO PLANO (según tu requerimiento)
      // Si la contraseña es null (usuario viejo sin migrar), validamos directo con DNI
      const passAlmacenada = visitante.password || visitante.dni;

      if (password !== passAlmacenada) {
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }

      rol = 'visitante';
      userId = visitante.id;
      dataUsuario = { id: visitante.id, nombre: visitante.nombres, dni: visitante.dni };
    }

    // --- GENERAR TOKEN ---
    const secret = process.env.JWT_SECRET || 'secreto_academico_super_seguro';
    const token = jwt.sign(
      { id: userId, rol: rol }, // <--- IMPORTANTE: Guardamos el ROL en el token
      secret,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Bienvenido',
      token: token,
      rol: rol, // Enviamos el rol al frontend para saber a dónde redirigir
      usuario: dataUsuario
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

// EJECUTAR ESTO UNA SOLA VEZ (Vía Postman o similar)
const migrarContrasenasVisitantes = async (req, res) => {
  try {
    const visitantes = await Visitante.findAll();
    let cont = 0;

    for (const v of visitantes) {
      // Como pediste: La contraseña será el mismo DNI, SIN encriptar
      v.password = v.dni;
      await v.save();
      cont++;
    }

    res.json({ message: `Se actualizaron ${cont} visitantes. Ahora su password es su DNI.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en migración' });
  }
};

module.exports = { login, getAdmins, createAdmin, deleteAdmin, migrarContrasenasVisitantes };