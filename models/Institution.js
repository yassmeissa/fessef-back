import { pool } from '../config/database.js'

class Institution {
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM institutions ORDER BY nom ASC'
      )
      return rows
    } catch (error) {
      console.error('Erreur lors de la récupération des institutions:', error)
      throw error
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM institutions WHERE id = ?',
        [id]
      )
      return rows[0]
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'institution:', error)
      throw error
    }
  }

  static async getByVille(villeId) {
    try {
      const [rows] = await pool.execute(
        `SELECT i.* FROM institutions i
         JOIN villes v ON v.institution_id = i.id
         WHERE v.id = ?`,
        [villeId]
      )
      return rows[0]
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'institution par ville:', error)
      throw error
    }
  }



  static async create(institutionData) {
    try {
      const { nom, adresse, telephone, email, website } = institutionData
      
      const [result] = await pool.execute(
        `INSERT INTO institutions 
         (nom, adresse, telephone, email, website) 
         VALUES (?, ?, ?, ?, ?)`,
        [nom, adresse || null, telephone || null, email || null, website || null]
      )
      
      return {
        id: result.insertId,
        nom,
        adresse: adresse || null,
        telephone: telephone || null,
        email: email || null,
        website: website || null
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'institution:', error)
      throw error
    }
  }

  static async update(id, institutionData) {
    try {
      const { nom, adresse, telephone, email, website } = institutionData
      
      const [result] = await pool.execute(
        `UPDATE institutions 
         SET nom = ?, adresse = ?, telephone = ?, email = ?, website = ?
         WHERE id = ?`,
        [nom, adresse || null, telephone || null, email || null, website || null, id]
      )
      
      if (result.affectedRows === 0) {
        throw new Error('Institution non trouvée')
      }
      
      return { 
        id, 
        nom,
        adresse: adresse || null,
        telephone: telephone || null,
        email: email || null,
        website: website || null
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'institution:', error)
      throw error
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM institutions WHERE id = ?',
        [id]
      )
      
      if (result.affectedRows === 0) {
        throw new Error('Institution non trouvée')
      }
      
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'institution:', error)
      throw error
    }
  }
}

export default Institution
