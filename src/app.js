// src/app.js
const express = require('express');
const cors = require('cors');
const expenseRoutes = require('./routes/expense.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta básica
app.get('/', (req, res) => {
  res.json({ message: 'BudgetBuddy API está funcionando 🧾' });
});

// Rutas de gastos
app.use('/api/expenses', expenseRoutes);

// Ruta de prueba de BD (opcional, luego podríamos moverla)
const pool = require('./config/db');
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

