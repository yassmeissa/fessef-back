import { pool } from '../config/database.js'

class Ville {
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          v.id,
          v.nom,
          v.institution_id,
          v.latitude,
          v.longitude,
          i.nom as institution_nom
        FROM villes v
        LEFT JOIN institutions i ON i.id = v.institution_id
        ORDER BY v.nom ASC`
      )
      return rows
    } catch (error) {
      console.error('Erreur lors de la récupération des villes:', error)
      throw error
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          v.id,
          v.nom,
          v.institution_id,
          v.latitude,
          v.longitude,
          i.nom as institution_nom,
          i.adresse,
          i.telephone,
          i.email,
          i.website
        FROM villes v
        LEFT JOIN institutions i ON i.id = v.institution_id
        WHERE v.id = ?`,
        [id]
      )
      return rows[0]
    } catch (error) {
      console.error('Erreur lors de la récupération de la ville:', error)
      throw error
    }
  }

  static async create(villeData) {
    try {
      const { nom, institution_id, latitude, longitude } = villeData
      
      console.log('Modèle Ville - Données à insérer:', { nom, institution_id, latitude, longitude });
      
      const [result] = await pool.execute(
        'INSERT INTO villes (nom, institution_id, latitude, longitude) VALUES (?, ?, ?, ?)',
        [nom, institution_id || null, latitude || null, longitude || null]
      )
      
      console.log('Modèle Ville - Insert result:', result);
      
      return { id: result.insertId, ...villeData }
    } catch (error) {
      console.error('Erreur lors de la création de la ville:', error)
      throw error
    }
  }

  static async update(id, villeData) {
    try {
      const { nom, institution_id, latitude, longitude } = villeData
      
      await pool.execute(
        'UPDATE villes SET nom = ?, institution_id = ?, latitude = ?, longitude = ? WHERE id = ?',
        [nom, institution_id || null, latitude || null, longitude || null, id]
      )
      return { id, ...villeData }
    } catch (error) {
      console.error('Erreur lors de la modification de la ville:', error)
      throw error
    }
  }

  static async delete(id) {
    try {
      await pool.execute('DELETE FROM villes WHERE id = ?', [id])
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression de la ville:', error)
      throw error
    }
  }
}

export default Ville
