// src/models/expense.model.js
const pool = require('../config/db');

const ExpenseModel = {
  async getAll() {
    const [rows] = await pool.query(
      'SELECT * FROM expenses ORDER BY date DESC, created_at DESC'
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create({ description, amount, category, date }) {
    const [result] = await pool.query(
      'INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)',
      [description, amount, category || null, date]
    );

    return {
      id: result.insertId,
      description,
      amount,
      category: category || null,
      date
    };
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = ExpenseModel;
