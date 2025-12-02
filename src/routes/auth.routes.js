// src/routes/auth.routes.js
const express = require('express');
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
// Ruta protegida para ver info del usuario logueado
router.get('/me', authMiddleware, AuthController.me);

module.exports = router;
