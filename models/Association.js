import { pool } from '../config/database.js';

export class Association {
  static async getAll() {
    try {
      const query = `
        SELECT 
          a.id,
          a.nom,
          a.email,
          a.instagram,
          a.logo,
          v.id as ville_id,
          v.nom as ville_nom,
          v.latitude,
          v.longitude,
          i.nom as institution_nom
        FROM associations a
        LEFT JOIN association_villes av ON a.id = av.association_id
        LEFT JOIN villes v ON av.ville_id = v.id
        LEFT JOIN institutions i ON v.institution_id = i.id
        ORDER BY a.nom ASC, v.nom ASC
      `;
      const [rows] = await pool.query(query);
      
      console.log('Raw rows from DB:', JSON.stringify(rows, null, 2));
      
      // Grouper les associations et leurs villes
      const associationsMap = new Map();
      
      rows.forEach(row => {
        if (!associationsMap.has(row.id)) {
          associationsMap.set(row.id, {
            id: row.id,
            nom: row.nom,
            email: row.email,
            instagram: row.instagram,
            logo: row.logo,
            villes: []
          });
        }
        
        // Ajouter la ville si elle existe
        if (row.ville_id) {
          const association = associationsMap.get(row.id);
          association.villes.push({
            id: row.ville_id,
            nom: row.ville_nom,
            latitude: row.latitude,
            longitude: row.longitude,
            institution_nom: row.institution_nom
          });
        }
      });
      
      const result = Array.from(associationsMap.values());
      console.log('Grouped associations with villes:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error fetching associations:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const query = 'SELECT * FROM associations WHERE id = ?';
      const [associations] = await pool.query(query, [id]);
      return associations.length > 0 ? associations[0] : null;
    } catch (error) {
      console.error('Error fetching association by ID:', error);
      throw error;
    }
  }

  static async getByVille(villeId) {
    try {
      const query = `
        SELECT DISTINCT a.* FROM associations a
        JOIN association_villes av ON av.association_id = a.id
        WHERE av.ville_id = ?
        ORDER BY a.nom ASC
      `;
      const [associations] = await pool.query(query, [villeId]);
      return associations;
    } catch (error) {
      console.error('Error fetching associations by ville:', error);
      throw error;
    }
  }

  static async getVillesByAssociation(associationId) {
    try {
      const query = `
        SELECT v.* FROM villes v
        JOIN association_villes av ON av.ville_id = v.id
        WHERE av.association_id = ?
        ORDER BY v.nom ASC
      `;
      const [villes] = await pool.query(query, [associationId]);
      return villes;
    } catch (error) {
      console.error('Error fetching villes for association:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const { nom, email, instagram, logo } = data;
      
      console.log('Association.create called with:', data);
      
      if (!nom) {
        throw new Error('nom is required');
      }

      const query = `
        INSERT INTO associations (nom, email, instagram, logo)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await pool.query(query, [nom, email || null, instagram || null, logo || null]);
      
      console.log('Association created with ID:', result.insertId);
      
      return { id: result.insertId, nom, email, instagram, logo };
    } catch (error) {
      console.error('Error creating association:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const { nom, email, instagram, logo } = data;
      
      console.log('Association.update called with:', id, data);
      
      if (!nom) {
        throw new Error('nom is required');
      }

      // Check if association exists
      const existing = await this.getById(id);
      if (!existing) {
        return null;
      }

      const query = `
        UPDATE associations
        SET nom = ?, email = ?, instagram = ?, logo = ?
        WHERE id = ?
      `;
      
      await pool.query(query, [nom, email || null, instagram || null, logo || null, id]);
      
      console.log('Association updated successfully');
      
      // Return updated association
      return { id, nom, email, instagram, logo };
    } catch (error) {
      console.error('Error updating association:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const query = 'DELETE FROM associations WHERE id = ?';
      await pool.query(query, [id]);
      return true;
    } catch (error) {
      console.error('Error deleting association:', error);
      throw error;
    }
  }

  static async addVille(associationId, villeId) {
    try {
      const query = `
        INSERT INTO association_villes (association_id, ville_id)
        VALUES (?, ?)
      `;
      await pool.query(query, [associationId, villeId]);
      return true;
    } catch (error) {
      console.error('Error adding ville to association:', error);
      throw error;
    }
  }

  static async removeVille(associationId, villeId) {
    try {
      const query = `
        DELETE FROM association_villes
        WHERE association_id = ? AND ville_id = ?
      `;
      await pool.query(query, [associationId, villeId]);
      return true;
    } catch (error) {
      console.error('Error removing ville from association:', error);
      throw error;
    }
  }
}
