const { Visitante, Registro } = require('../models');

// Función principal para registrar entrada/salida
const registrarAsistencia = async (req, res) => {
  try {
    const { dni, tipo, nombres, apellidos } = req.body;

    // --- LOG DE DEPURACIÓN ---
    console.log("👉 INTENTO DE REGISTRO:");
    console.log("   Datos recibidos:", { dni, nombres, apellidos, tipo });
    // ------------------------

    // 1. Buscar o Crear el Visitante
    const [visitante, created] = await Visitante.findOrCreate({
      where: { dni: dni.toString() }, // Aseguramos que sea string para la búsqueda
      defaults: {
        nombres: nombres,
        apellidos: apellidos,
        password: dni.toString()
      }
    });

    // --- LOG DE RESULTADO ---
    console.log("✅ Visitante procesado:", visitante.toJSON());
    console.log("   ¿Fue creado nuevo?:", created);
    // ------------------------

    // Actualización de datos (Nombres o Password faltante)
    let huboCambios = false;

    // Si faltan nombres/apellidos
    if (!created && (!visitante.nombres || !visitante.apellidos)) {
      console.log("🔄 Actualizando datos faltantes del visitante...");
      visitante.nombres = nombres;
      visitante.apellidos = apellidos;
      huboCambios = true;
    }

    // CAMBIO 2: Si el usuario existe pero NO tiene password (usuario viejo)
    // Esto asegura que al escanear, se arregle su cuenta automáticamente
    if (!created && !visitante.password) {
      console.log("🔐 Generando password automático para usuario antiguo...");
      visitante.password = dni.toString();
      huboCambios = true;
    }

    // Guardamos solo si hubo cambios para no saturar la BD
    if (huboCambios) {
      await visitante.save();
    }

    const nuevoRegistro = await Registro.create({
      tipo: tipo,
      fecha_hora: new Date(),
      visitante_id: visitante.id,
      dni: dni.toString()
    });

    return res.status(201).json({
      message: 'Registro exitoso',
      registro: nuevoRegistro,
      visitante: visitante
    });

  } catch (error) {
    console.error("❌ ERROR EN REGISTRO:", error);
    return res.status(500).json({ message: 'Error al registrar asistencia', error });
  }
};

// Función para obtener el historial (para el admin)
const obtenerRegistros = async (req, res) => {
  try {
    // 1. Obtener parámetros de paginación (con valores por defecto como en Spring)
    // page 0 es la primera página
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;

    // 2. Calcular limit y offset
    const limit = size;
    const offset = page * size;

    // 3. Usar findAndCountAll (Trae datos + conteo total)
    const data = await Registro.findAndCountAll({
      include: [{ model: Visitante }],
      order: [['fecha_hora', 'DESC']],
      limit: limit,
      offset: offset
    });

    // 4. Construir respuesta estilo Spring Boot ("Page")
    const response = {
      content: data.rows,           // Los registros de esta página
      totalElements: data.count,    // Total de registros en la BD
      totalPages: Math.ceil(data.count / limit), // Total de páginas
      number: page,                 // Página actual
      size: size                    // Tamaño de página
    };

    return res.json(response);

  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener registros' });
  }
};

const getMisRegistros = async (req, res) => {
  try {
    // El middleware de autenticación debe poner el usuario en req.user
    // req.user = { id: 1, rol: 'visitante' }
    const visitanteId = req.user.id;

    // --- AGREGAR ESTOS LOGS ---
    console.log("--> Buscando registros para ID Visitante:", visitanteId);

    // Verificamos si el visitante existe y obtenemos su DNI también
    const visitante = await Visitante.findByPk(visitanteId);
    console.log("--> Visitante encontrado:", visitante ? visitante.dni : "NO ENCONTRADO");
    // --------------------------

    // Paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // 10 registros por carga
    const offset = (page - 1) * limit;

    const { count, rows } = await Registro.findAndCountAll({
      where: { visitante_id: visitanteId },
      order: [['fecha_hora', 'DESC']], // Del más reciente al más antiguo
      limit: limit,
      offset: offset
    });

    // Calculamos total de páginas
    const totalPages = Math.ceil(count / limit);

    res.json({
      totalRegistros: count,
      totalPages: totalPages,
      currentPage: page,
      registros: rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener registros' });
  }
};

module.exports = {
  registrarAsistencia,
  obtenerRegistros,
  getMisRegistros
};