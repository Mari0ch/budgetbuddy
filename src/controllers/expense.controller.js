// src/controllers/expense.controller.js
const ExpenseModel = require('../models/expense.model');

const ExpenseController = {
  async getAll(req, res) {
    try {
      const expenses = await ExpenseModel.getAll();
      res.json(expenses);
    } catch (error) {
      console.error('Error al obtener los gastos:', error);
      res.status(500).json({ message: 'Error al obtener los gastos' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const expense = await ExpenseModel.getById(id);

      if (!expense) {
        return res.status(404).json({ message: 'Gasto no encontrado' });
      }

      res.json(expense);
    } catch (error) {
      console.error('Error al obtener el gasto:', error);
      res.status(500).json({ message: 'Error al obtener el gasto' });
    }
  },

  async create(req, res) {
    try {
      const { description, amount, category, date } = req.body;

      if (!description || !amount || !date) {
        return res
          .status(400)
          .json({ message: 'description, amount y date son obligatorios' });
      }

      const expense = await ExpenseModel.create({
        description,
        amount,
        category,
        date
      });

      res.status(201).json(expense);
    } catch (error) {
      console.error('Error al crear el gasto:', error);
      res.status(500).json({ message: 'Error al crear el gasto' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ExpenseModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Gasto no encontrado' });
      }

      res.json({ message: 'Gasto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar el gasto:', error);
      res.status(500).json({ message: 'Error al eliminar el gasto' });
    }
  }
};

module.exports = ExpenseController;
