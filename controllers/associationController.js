import { Association } from '../models/Association.js';

export const getAllAssociations = async (req, res) => {
  try {
    const associations = await Association.getAll();
    res.json(associations);
  } catch (error) {
    console.error('Error in getAllAssociations:', error);
    res.status(500).json({ error: 'Error fetching associations' });
  }
};

export const getAssociationById = async (req, res) => {
  try {
    const { id } = req.params;
    const association = await Association.getById(id);
    
    if (!association) {
      return res.status(404).json({ error: 'Association not found' });
    }
    
    res.json(association);
  } catch (error) {
    console.error('Error in getAssociationById:', error);
    res.status(500).json({ error: 'Error fetching association' });
  }
};

export const getAssociationByVille = async (req, res) => {
  try {
    const { villeId } = req.params;
    const associations = await Association.getByVille(villeId);
    res.json(associations);
  } catch (error) {
    console.error('Error in getAssociationByVille:', error);
    res.status(500).json({ error: 'Error fetching associations by ville' });
  }
};

export const getVillesByAssociation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if association exists
    const association = await Association.getById(id);
    if (!association) {
      return res.status(404).json({ error: 'Association not found' });
    }
    
    const villes = await Association.getVillesByAssociation(id);
    res.json(villes);
  } catch (error) {
    console.error('Error in getVillesByAssociation:', error);
    res.status(500).json({ error: 'Error fetching villes for association' });
  }
};

export const createAssociation = async (req, res) => {
  try {
    const { nom, email, instagram, logo } = req.body;
    
    console.log('Données reçues pour création:');
    console.log('  Body keys:', Object.keys(req.body));
    console.log('  File:', req.file);
    console.log('  Logo type:', typeof logo);
    
    if (!nom) {
      return res.status(400).json({ 
        success: false,
        error: 'nom is required' 
      });
    }
    
    const associationData = { nom, email, instagram };
    
    // Gérer le logo : soit depuis FormData (fichier uploadé), soit depuis JSON (base64)
    if (req.file) {
      // Si un fichier a été uploadé via FormData
      associationData.logo = `/uploads/${req.file.filename}`;
      console.log('Logo ajouté (fichier):', associationData.logo);
    } else if (logo && logo.startsWith('data:image')) {
      // Si l'image est en base64 depuis le JSON, la sauvegarder
      associationData.logo = logo;
      console.log('Logo ajouté (base64)');
    }
    
    const association = await Association.create(associationData);
    res.status(201).json({
      success: true,
      ...association
    });
  } catch (error) {
    console.error('Error in createAssociation:', error);
    
    // Check for duplicate nom (UNIQUE constraint)
    if (error.message.includes('1062')) {
      return res.status(400).json({ 
        success: false,
        error: 'Association name already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message 
    });
  }
};

export const updateAssociation = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, email, instagram, logo } = req.body;
    
    console.log('Données reçues pour mise à jour:');
    console.log('  ID:', id);
    console.log('  Body keys:', Object.keys(req.body));
    console.log('  File:', req.file);
    console.log('  Logo type:', typeof logo);
    
    if (!nom) {
      return res.status(400).json({ 
        success: false,
        error: 'nom is required' 
      });
    }
    
    const associationData = { nom, email, instagram };
    
    // Gérer le logo : soit depuis FormData (fichier uploadé), soit depuis JSON (base64)
    if (req.file) {
      // Si un fichier a été uploadé via FormData
      associationData.logo = `/uploads/${req.file.filename}`;
      console.log('Logo mis à jour (fichier):', associationData.logo);
    } else if (logo && logo.startsWith('data:image')) {
      // Si l'image est en base64 depuis le JSON, la sauvegarder
      associationData.logo = logo;
      console.log('Logo mis à jour (base64)');
    } else if (logo && logo.startsWith('/uploads')) {
      // Si c'est déjà une URL relative, la garder
      associationData.logo = logo;
      console.log('Logo conservé:', logo);
    }
    
    const association = await Association.update(id, associationData);
    
    if (!association) {
      return res.status(404).json({ 
        success: false,
        error: 'Association not found' 
      });
    }
    
    res.json({
      success: true,
      ...association
    });
  } catch (error) {
    console.error('Error in updateAssociation:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message 
    });
  }
};

export const deleteAssociation = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Association.delete(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Association not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteAssociation:', error);
    res.status(500).json({ error: 'Error deleting association' });
  }
};

export const addVilleToAssociation = async (req, res) => {
  try {
    const { id } = req.params;
    const { villeId } = req.body;
    
    if (!villeId) {
      return res.status(400).json({ error: 'villeId is required' });
    }
    
    // Check if association exists
    const association = await Association.getById(id);
    if (!association) {
      return res.status(404).json({ error: 'Association not found' });
    }
    
    await Association.addVille(id, villeId);
    res.status(201).json({ message: 'Ville added to association' });
  } catch (error) {
    console.error('Error in addVilleToAssociation:', error);
    res.status(500).json({ error: 'Error adding ville to association' });
  }
};

export const removeVilleFromAssociation = async (req, res) => {
  try {
    const { id, villeId } = req.params;
    
    // Check if association exists
    const association = await Association.getById(id);
    if (!association) {
      return res.status(404).json({ error: 'Association not found' });
    }
    
    await Association.removeVille(id, villeId);
    res.status(204).send();
  } catch (error) {
    console.error('Error in removeVilleFromAssociation:', error);
    res.status(500).json({ error: 'Error removing ville from association' });
  }
};
