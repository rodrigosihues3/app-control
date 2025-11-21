const { Visitante, Registro } = require('../models');
const { Op } = require('sequelize');

const buscarPorDni = async (req, res) => {
  try {
    const { dni } = req.params;

    console.log(`🔍 Buscando visitante con DNI: ${dni}`); // <--- LOG

    const visitante = await Visitante.findOne({ where: { dni: dni.toString() } });

    if (visitante) {
      console.log("✅ Encontrado:", visitante.nombres); // <--- LOG
      return res.json({ encontrado: true, data: visitante });
    } else {
      console.log("⚠️ No encontrado en BD"); // <--- LOG
      return res.json({ encontrado: false, message: 'Visitante no encontrado' });
    }
  } catch (error) {
    console.error("❌ Error en búsqueda:", error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// 1. LISTAR VISITANTES (Paginado y con Búsqueda)
const getVisitantes = async (req, res) => {
  try {
    const { page = 0, size = 10, search = '' } = req.query;
    const limit = parseInt(size);
    const offset = parseInt(page) * limit;

    // Filtro dinámico (DNI o Nombre)
    const whereCondition = search ? {
      [Op.or]: [
        { dni: { [Op.like]: `%${search}%` } },
        { nombres: { [Op.like]: `%${search}%` } },
        { apellidos: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    const data = await Visitante.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      content: data.rows,
      totalPages: Math.ceil(data.count / limit),
      totalElements: data.count
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al listar visitantes' });
  }
};

// 2. CREAR (Manual desde Admin)
const createVisitante = async (req, res) => {
  try {
    const nuevo = await Visitante.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear (posible DNI duplicado)' });
  }
};

// 3. EDITAR
const updateVisitante = async (req, res) => {
  try {
    await Visitante.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Actualizado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar' });
  }
};

// 4. ELIMINAR
const deleteVisitante = async (req, res) => {
  try {
    await Visitante.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar' });
  }
};

// 5. VER HISTORIAL DE UN VISITANTE
const getHistorialVisitante = async (req, res) => {
  try {
    const registros = await Registro.findAll({
      where: { visitante_id: req.params.id },
      order: [['fecha_hora', 'DESC']]
    });
    res.json(registros);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo historial' });
  }
};

module.exports = {
  buscarPorDni,
  getVisitantes,
  createVisitante,
  updateVisitante,
  deleteVisitante,
  getHistorialVisitante
};