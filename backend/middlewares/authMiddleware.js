const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Obtener el token del header (Formato esperado: "Bearer <token>")
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  // 2. Limpiar el prefijo "Bearer " si viene incluido
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7, authHeader.length)
    : authHeader;

  try {
    // 3. Verificar el token usando tu clave secreta
    const secret = process.env.JWT_SECRET || 'secreto_academico_super_seguro';
    const decoded = jwt.verify(token, secret);

    // 4. Añadir el usuario decodificado a la request para usarlo en el controlador
    req.user = decoded;

    next(); // Continuar a la siguiente función (el controlador)
  } catch (error) {
    res.status(401).json({ message: 'Token no válido o expirado.' });
  }
};