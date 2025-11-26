import { pool } from '../config/database.js';
import Ville from '../models/Ville.js';

export const getAllVilles = async (req, res) => {
  try {
    const query = `
      SELECT 
        v.id,
        v.nom,
        v.institution_id,
        v.latitude,
        v.longitude,
        i.nom as institution_nom
      FROM villes v
      LEFT JOIN institutions i ON i.id = v.institution_id
      ORDER BY v.nom ASC
    `;
    const [villes] = await pool.execute(query);
    res.json(villes);
  } catch (error) {
    console.error('Error fetching villes:', error);
    res.status(500).json({ error: 'Error fetching villes' });
  }
};

export const getVilleById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
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
      WHERE v.id = ?
    `;
    const [villes] = await pool.execute(query, [id]);
    
    if (villes.length === 0) {
      return res.status(404).json({ error: 'Ville not found' });
    }
    
    res.json(villes[0]);
  } catch (error) {
    console.error('Error fetching ville:', error);
    res.status(500).json({ error: 'Error fetching ville' });
  }
};

export const createVille = async (req, res) => {
  try {
    const { nom, institution_id, latitude, longitude } = req.body;
    
    console.log('Données reçues pour création:', { nom, institution_id, latitude, longitude });
    
    if (!nom || nom.trim() === '') {
      return res.status(400).json({ error: 'Le nom de la ville est requis' });
    }
    
    const villeData = { 
      nom: nom.trim(), 
      institution_id: institution_id || null,
      latitude: latitude && latitude !== '' ? parseFloat(latitude) : null,
      longitude: longitude && longitude !== '' ? parseFloat(longitude) : null
    };
    
    console.log('Données traitées pour création:', villeData);
    
    const newVille = await Ville.create(villeData);
    res.status(201).json(newVille);
  } catch (error) {
    console.error('Error creating ville:', error);
    res.status(500).json({ error: 'Error creating ville' });
  }
};

export const updateVille = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, institution_id, latitude, longitude } = req.body;
    
    console.log('Données reçues pour modification:', { nom, institution_id, latitude, longitude });
    
    if (!nom || nom.trim() === '') {
      return res.status(400).json({ error: 'Le nom de la ville est requis' });
    }
    
    const villeData = { 
      nom: nom.trim(), 
      institution_id: institution_id || null,
      latitude: latitude && latitude !== '' ? parseFloat(latitude) : null,
      longitude: longitude && longitude !== '' ? parseFloat(longitude) : null
    };
    
    console.log('Données traitées pour modification:', villeData);
    
    const updatedVille = await Ville.update(id, villeData);
    res.json(updatedVille);
  } catch (error) {
    console.error('Error updating ville:', error);
    res.status(500).json({ error: 'Error updating ville' });
  }
};

export const deleteVille = async (req, res) => {
  try {
    const { id } = req.params;
    await Ville.delete(id);
    res.json({ message: 'Ville supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting ville:', error);
    res.status(500).json({ error: 'Error deleting ville' });
  }
};
