import { pool } from '../config/database.js'

class Event {
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM events ORDER BY date ASC'
      )
      return rows
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error)
      throw error
    }
  }

  static async getUpcoming() {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM events 
         WHERE status IN ('bientot', 'en_cours') 
         OR (date IS NOT NULL AND date >= CURDATE())
         ORDER BY 
           CASE WHEN date IS NULL THEN 0 ELSE 1 END,
           date ASC,
           time ASC`
      )
      return rows
    } catch (error) {
      console.error('Erreur lors de la récupération des événements à venir:', error)
      throw error
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM events WHERE id = ?',
        [id]
      )
      return rows[0]
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'événement:', error)
      throw error
    }
  }

  static async create(eventData) {
    try {
      const { title, date, description, location, time, image_url, status, summary } = eventData
      
      const [result] = await pool.execute(
        'INSERT INTO events (title, date, description, location, time, image_url, status, summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [title, date, description, location, time, image_url, status || 'bientot', summary]
      )
      
      return this.getById(result.insertId)
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error)
      throw error
    }
  }

  static async update(id, eventData) {
    try {
      const { title, date, description, location, time, image_url, status, summary } = eventData
      
      await pool.execute(
        'UPDATE events SET title = ?, date = ?, description = ?, location = ?, time = ?, image_url = ?, status = ?, summary = ? WHERE id = ?',
        [title, date, description, location, time, image_url, status || 'bientot', summary, id]
      )
      
      return this.getById(id)
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error)
      throw error
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM events WHERE id = ?',
        [id]
      )
      
      return result.affectedRows > 0
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error)
      throw error
    }
  }
}

export default Event
