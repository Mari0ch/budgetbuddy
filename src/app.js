// src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const expenseRoutes = require('./routes/expense.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Servir el frontend desde la carpeta public
app.use(express.static(path.join(__dirname, '..', 'public')));

// Ruta API básica
app.get('/api', (req, res) => {
  res.json({ message: 'BudgetBuddy API está funcionando 🧾' });
});

// Rutas de gastos
app.use('/api/expenses', expenseRoutes);

// Ruta de prueba BD
const pool = require('./config/db');
app.get('/db-test', async (req, res) => {
  // ... (como lo tenías)
});

module.exports = app;
