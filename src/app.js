// src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const expenseRoutes = require('./routes/expense.routes');
const authRoutes = require('./routes/auth.routes');
const authMiddleware = require('./middleware/auth.middleware');
const pool = require('./config/db');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Servir el frontend desde la carpeta public
app.use(express.static(path.join(__dirname, '..', 'public')));

// Ruta básica de la API (opcional)
app.get('/api', (req, res) => {
  res.json({ message: 'BudgetBuddy API está funcionando 🧾' });
});

// Rutas de autenticación (NO protegidas)
app.use('/api/auth', authRoutes);

// Rutas de gastos (SÍ protegidas con authMiddleware)
app.use('/api/expenses', authMiddleware, expenseRoutes);

// Ruta de prueba BD (puedes decidir si protegerla o no)
app.get('/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM expenses');
    res.json({
      message: 'Conexión a la base de datos OK ✅',
      totalExpenses: rows[0].total
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    res.status(500).json({
      message: 'Error al conectar con la base de datos ❌',
      error: error.message
    });
  }
});

module.exports = app;
