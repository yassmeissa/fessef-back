import { pool } from '../config/database.js';

class User {
  // ...existing code...
  // Obtenir un utilisateur par email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'utilisateur:', error);
      throw error;
    }
  }

  // Obtenir un utilisateur par ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'utilisateur:', error);
      throw error;
    }
  }

  // Créer un nouvel utilisateur
  static async create(email, hashedPassword) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword]
      );
      return result.insertId;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  // Mettre à jour le password
  static async updatePassword(id, hashedPassword) {
    try {
      const [result] = await pool.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du password:', error);
      throw error;
    }
  }
}

export default User;
