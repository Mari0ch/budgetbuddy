// src/routes/expense.routes.js
const express = require('express');
const ExpenseController = require('../controllers/expense.controller');

const router = express.Router();

router.get('/', ExpenseController.getAll);
router.get('/:id', ExpenseController.getById);
router.post('/', ExpenseController.create);
router.put('/:id', ExpenseController.update);   // 👈 nueva ruta
router.delete('/:id', ExpenseController.delete);

module.exports = router;
