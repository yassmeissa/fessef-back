import { query } from '../config/database.js';

const getAllPresidents = async (req, res) => {
  try {
    const rows = await query('SELECT * FROM anciens_presidents');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addPresident = async (req, res) => {
  try {
    const { nom, dates_mandat, image } = req.body;
    
    // Validation des champs requis
    if (!nom || !dates_mandat) {
      return res.status(400).json({ error: 'Nom et mandat sont requis' });
    }
    
    let imagePath = '';
    if (req.file) {
      imagePath = '/uploads/' + req.file.filename;
    } else if (image && image.startsWith('data:image')) {
      // Si l'image est en base64, la garder telle quelle
      imagePath = image;
    } else if (image) {
      imagePath = image;
    }
    
    await query('INSERT INTO anciens_presidents (nom, dates_mandat, image) VALUES (?, ?, ?)', [nom, dates_mandat, imagePath]);
    const rows = await query('SELECT * FROM anciens_presidents ORDER BY id DESC LIMIT 1');
    res.json(rows[0]);
  } catch (err) {
    console.error('Erreur addPresident:', err);
    res.status(500).json({ error: err.message });
  }
};

const updatePresident = async (req, res) => {
  try {
    const { nom, dates_mandat, image } = req.body;
    
    // Validation des champs requis
    if (!nom || !dates_mandat) {
      return res.status(400).json({ error: 'Nom et mandat sont requis' });
    }
    
    let imagePath = image || '';
    
    // Si une nouvelle image est uploadée, utiliser celle-ci
    if (req.file) {
      imagePath = '/uploads/' + req.file.filename;
    } else if (image && image.startsWith('data:image')) {
      // Si l'image est en base64, la garder telle quelle
      imagePath = image;
    }
    
    await query('UPDATE anciens_presidents SET nom=?, dates_mandat=?, image=? WHERE id=?', [nom, dates_mandat, imagePath, req.params.id]);
    res.json({ id: req.params.id, nom, dates_mandat, image: imagePath });
  } catch (err) {
    console.error('Erreur updatePresident:', err);
    res.status(500).json({ error: err.message });
  }
};

const deletePresident = async (req, res) => {
  try {
    await query('DELETE FROM anciens_presidents WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  getAllPresidents,
  addPresident,
  updatePresident,
  deletePresident
};
