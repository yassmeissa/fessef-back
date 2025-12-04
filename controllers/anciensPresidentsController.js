import { query } from '../config/database.js';

// Fonction helper pour construire les URLs complètes des images
const buildImageUrl = (imagePath, req) => {
  if (!imagePath) return '';
  
  // Si c'est déjà une URL complète ou du base64, retourner tel quel
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:image')) {
    return imagePath;
  }
  
  // Construire l'URL complète avec le protocole et l'host
  const protocol = req.protocol || 'http';
  const host = req.get('host') || 'localhost:3001';
  return `${protocol}://${host}${imagePath}`;
};

const getAllPresidents = async (req, res) => {
  try {
    const rows = await query('SELECT * FROM anciens_presidents');
    // Transformer les images pour inclure les URLs complètes
    const rowsWithUrls = rows.map(row => ({
      ...row,
      image: buildImageUrl(row.image, req)
    }));
    res.json(rowsWithUrls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addPresident = async (req, res) => {
  try {
    console.log('📥 Requête POST /anciens-presidents');
    console.log('Body reçu:', req.body);
    console.log('File reçu:', req.file ? {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : 'Aucun fichier');
    
    const { nom, dates_mandat, image } = req.body;
    
    // Validation des champs requis
    if (!nom || !dates_mandat) {
      console.error('❌ Validation échouée - Nom ou mandat manquant');
      console.log('  - nom:', nom);
      console.log('  - dates_mandat:', dates_mandat);
      return res.status(400).json({ error: 'Nom et mandat sont requis' });
    }
    
    console.log('✅ Validation réussie');
    
    let imagePath = '';
    if (req.file) {
      imagePath = '/uploads/' + req.file.filename;
      console.log('📸 Image uploadée:', imagePath);
    } else if (image && image.startsWith('data:image')) {
      // Si l'image est en base64, la garder telle quelle
      imagePath = image;
      console.log('📸 Image base64 détectée');
    } else if (image) {
      imagePath = image;
      console.log('📸 Image URL:', imagePath);
    } else {
      console.log('📸 Aucune image fournie');
    }
    
    console.log('💾 Insertion en base de données...');
    console.log('  - nom:', nom);
    console.log('  - dates_mandat:', dates_mandat);
    console.log('  - imagePath:', imagePath);
    
    await query('INSERT INTO anciens_presidents (nom, dates_mandat, image) VALUES (?, ?, ?)', [nom, dates_mandat, imagePath]);
    console.log('✅ Insertion réussie');
    
    const rows = await query('SELECT * FROM anciens_presidents ORDER BY id DESC LIMIT 1');
    const presidentData = rows[0];
    
    // Construire l'URL complète pour l'image
    presidentData.image = buildImageUrl(presidentData.image, req);
    
    console.log('🎉 Président créé:', presidentData);
    res.json(presidentData);
  } catch (err) {
    console.error('❌ ERREUR dans addPresident:');
    console.error('  Message:', err.message);
    console.error('  Stack:', err.stack);
    console.error('  Code erreur:', err.code);
    res.status(500).json({ error: err.message, details: err.code });
  }
};

const updatePresident = async (req, res) => {
  try {
    console.log('📥 Requête PUT /anciens-presidents/:id');
    console.log('ID:', req.params.id);
    console.log('Body reçu:', req.body);
    console.log('File reçu:', req.file ? {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : 'Aucun fichier');
    
    const { nom, dates_mandat, image } = req.body;
    
    // Validation des champs requis
    if (!nom || !dates_mandat) {
      console.error('❌ Validation échouée - Nom ou mandat manquant');
      return res.status(400).json({ error: 'Nom et mandat sont requis' });
    }
    
    console.log('✅ Validation réussie');
    
    let imagePath = image || '';
    
    // Si une nouvelle image est uploadée, utiliser celle-ci
    if (req.file) {
      imagePath = '/uploads/' + req.file.filename;
      console.log('📸 Nouvelle image uploadée:', imagePath);
    } else if (image && image.startsWith('data:image')) {
      // Si l'image est en base64, la garder telle quelle
      imagePath = image;
      console.log('📸 Image base64 détectée');
    } else if (image) {
      console.log('📸 Conserve image existante:', image);
    } else {
      console.log('📸 Aucune image fournie, conserve l\'existante');
    }
    
    console.log('💾 Mise à jour en base de données...');
    console.log('  - ID:', req.params.id);
    console.log('  - nom:', nom);
    console.log('  - dates_mandat:', dates_mandat);
    console.log('  - imagePath:', imagePath);
    
    await query('UPDATE anciens_presidents SET nom=?, dates_mandat=?, image=? WHERE id=?', [nom, dates_mandat, imagePath, req.params.id]);
    console.log('✅ Mise à jour réussie');
    
    const fullImageUrl = buildImageUrl(imagePath, req);
    console.log('🎉 Président modifié');
    res.json({ id: req.params.id, nom, dates_mandat, image: fullImageUrl });
  } catch (err) {
    console.error('❌ ERREUR dans updatePresident:');
    console.error('  Message:', err.message);
    console.error('  Stack:', err.stack);
    console.error('  Code erreur:', err.code);
    res.status(500).json({ error: err.message, details: err.code });
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
