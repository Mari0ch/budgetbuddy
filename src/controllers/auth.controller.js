// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const AuthController = {
  // Registro de usuario nuevo
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: 'email y password son obligatorios' });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res
          .status(409)
          .json({ message: 'Ya existe un usuario con ese email' });
      }

      // Hashear contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = await UserModel.create({
        name,
        email,
        passwordHash
      });

      // Generar token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        },
        token
      });
    } catch (error) {
      console.error('Error en register:', error);
      res.status(500).json({ message: 'Error en el registro' });
    }
  },

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: 'email y password son obligatorios' });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Credenciales no válidas' });
      }

      const passwordOk = await bcrypt.compare(password, user.password_hash);
      if (!passwordOk) {
        return res.status(401).json({ message: 'Credenciales no válidas' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        token
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ message: 'Error en el login' });
    }
  },

  // Comprobar token y devolver datos de usuario
  async me(req, res) {
    try {
      // req.user lo pondrá el middleware de auth
      res.json({ user: req.user });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el usuario' });
    }
  }
};

module.exports = AuthController;
