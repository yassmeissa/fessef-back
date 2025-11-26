import { pool } from '../config/database.js';

class BureauMember {
  // Obtenir tous les membres du bureau
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM bureauMembers ORDER BY ordre ASC'
      );
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des membres du bureau:', error);
      throw error;
    }
  }

  // Obtenir un membre par ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM bureauMembers WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la recherche du membre:', error);
      throw error;
    }
  }

  // Créer un nouveau membre
  static async create(poste, nom, fonction, photo, ordre) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO bureauMembers (poste, nom, fonction, photo, ordre) VALUES (?, ?, ?, ?, ?)',
        [poste, nom, fonction, photo, ordre]
      );
      return result.insertId;
    } catch (error) {
      console.error('Erreur lors de la création du membre:', error);
      throw error;
    }
  }

  // Mettre à jour un membre
  static async update(id, poste, nom, fonction, photo, ordre) {
    try {
      const [result] = await pool.execute(
        'UPDATE bureauMembers SET poste = ?, nom = ?, fonction = ?, photo = ?, ordre = ? WHERE id = ?',
        [poste, nom, fonction, photo, ordre, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du membre:', error);
      throw error;
    }
  }

  // Supprimer un membre
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM bureauMembers WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      throw error;
    }
  }
}

export default BureauMember;
