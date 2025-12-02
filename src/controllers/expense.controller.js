// src/controllers/expense.controller.js
const ExpenseModel = require('../models/expense.model');

const ExpenseController = {
  async getAll(req, res) {
    try {
      const userId = req.user.id;
      const expenses = await ExpenseModel.getAllByUser(userId);
      res.json(expenses);
    } catch (error) {
      console.error('Error al obtener los gastos:', error);
      res.status(500).json({ message: 'Error al obtener los gastos' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const expense = await ExpenseModel.getById(id, userId);

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
      const userId = req.user.id;

      if (!description || !amount || !date) {
        return res
          .status(400)
          .json({ message: 'description, amount y date son obligatorios' });
      }

      const expense = await ExpenseModel.create({
        description,
        amount,
        category,
        date,
        userId
      });

      res.status(201).json(expense);
    } catch (error) {
      console.error('Error al crear el gasto:', error);
      res.status(500).json({ message: 'Error al crear el gasto' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { description, amount, category, date } = req.body;

      if (!description || !amount || !date) {
        return res
          .status(400)
          .json({ message: 'description, amount y date son obligatorios' });
      }

      const existing = await ExpenseModel.getById(id, userId);
      if (!existing) {
        return res.status(404).json({ message: 'Gasto no encontrado' });
      }

      const updated = await ExpenseModel.update(id, userId, {
        description,
        amount,
        category,
        date
      });

      if (!updated) {
        return res
          .status(500)
          .json({ message: 'No se pudo actualizar el gasto' });
      }

      const expense = await ExpenseModel.getById(id, userId);

      res.json(expense);
    } catch (error) {
      console.error('Error al actualizar el gasto:', error);
      res.status(500).json({ message: 'Error al actualizar el gasto' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const deleted = await ExpenseModel.delete(id, userId);

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
