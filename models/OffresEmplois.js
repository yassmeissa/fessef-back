import { pool } from '../config/database.js'

class OffresEmplois {
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM offres_emplois ORDER BY date_limite DESC'
      )
      return rows
    } catch (error) {
      console.error('Erreur lors de la récupération des offres d\'emplois:', error)
      throw error
    }
  }

  static async getActive() {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM offres_emplois 
         WHERE date_limite >= CURDATE()
         ORDER BY date_limite ASC`
      )
      return rows
    } catch (error) {
      console.error('Erreur lors de la récupération des offres actives:', error)
      throw error
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM offres_emplois WHERE id = ?',
        [id]
      )
      return rows[0]
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'offre d\'emploi:', error)
      throw error
    }
  }

  static async create(offresData) {
    try {
      const { poste, contact_entreprise, img_affiche, lien, description, date_limite } = offresData
      
      const [result] = await pool.execute(
        `INSERT INTO offres_emplois 
         (poste, contact_entreprise, img_affiche, lien, description, date_limite) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [poste, contact_entreprise, img_affiche || null, lien || null, description || null, date_limite]
      )
      
      return {
        id: result.insertId,
        ...offresData
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'offre d\'emploi:', error)
      throw error
    }
  }

  static async update(id, offresData) {
    try {
      const { poste, contact_entreprise, img_affiche, lien, description, date_limite } = offresData
      
      const [result] = await pool.execute(
        `UPDATE offres_emplois 
         SET poste = ?, contact_entreprise = ?, img_affiche = ?, lien = ?, description = ?, date_limite = ?
         WHERE id = ?`,
        [poste, contact_entreprise, img_affiche || null, lien || null, description || null, date_limite, id]
      )
      
      if (result.affectedRows === 0) {
        throw new Error('Offre d\'emploi non trouvée')
      }
      
      return { id, ...offresData }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'offre d\'emploi:', error)
      throw error
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM offres_emplois WHERE id = ?',
        [id]
      )
      
      if (result.affectedRows === 0) {
        throw new Error('Offre d\'emploi non trouvée')
      }
      
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'offre d\'emploi:', error)
      throw error
    }
  }
}

export default OffresEmplois
