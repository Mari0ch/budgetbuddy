// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'No se proporcionó token de autenticación' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no válido' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(401).json({ message: 'Token no válido o expirado' });
  }
}

module.exports = authMiddleware;
