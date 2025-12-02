// src/models/user.model.js
const pool = require('../config/db');

const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email
    ]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create({ name, email, passwordHash }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name || null, email, passwordHash]
    );

    return {
      id: result.insertId,
      name: name || null,
      email
    };
  }
};

module.exports = UserModel;
