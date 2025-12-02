// src/models/expense.model.js
const pool = require('../config/db');

const ExpenseModel = {
  async getAllByUser(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, created_at DESC',
      [userId]
    );
    return rows;
  },

  async getById(id, userId) {
    const [rows] = await pool.query(
      'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0] || null;
  },

  async create({ description, amount, category, date, userId }) {
    const [result] = await pool.query(
      'INSERT INTO expenses (description, amount, category, date, user_id) VALUES (?, ?, ?, ?, ?)',
      [description, amount, category || null, date, userId]
    );

    return {
      id: result.insertId,
      description,
      amount,
      category: category || null,
      date,
      user_id: userId
    };
  },

  async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
};

module.exports = ExpenseModel;
