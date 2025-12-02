import { pool } from '../config/database.js';
import BureauMember from '../models/BureauMember.js';

// Obtenir tous les membres du bureau
export const getBureauMembers = async (req, res) => {
  try {
    const members = await BureauMember.findAll();
    res.json({
      success: true,
      data: members,
      count: members.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Obtenir un membre par ID
export const getBureauMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await BureauMember.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Membre non trouvé'
      });
    }

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du membre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Créer un nouveau membre (protégé - admin seulement)
// Créer un nouveau membre (protégé - admin seulement)
export const createBureauMember = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { poste, nom, fonction, ordre, photo } = req.body;

    console.log('Données reçues pour création:');
    console.log('  poste:', poste);
    console.log('  nom:', nom);
    console.log('  fonction:', fonction);
    console.log('  ordre:', ordre);
    console.log('  photo présente:', !!photo);

    // Validation
    if (!poste || !nom || !fonction) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Les champs poste, nom et fonction sont requis'
      });
    }

    await connection.beginTransaction();

    const targetOrdre = typeof ordre === 'number' ? ordre : 0;
    
    let photoToStore = null;
    
    // Gérer la photo : soit base64, soit fichier uploadé
    if (photo && photo.trim() !== '') {
      photoToStore = photo; // Peut être base64 ou URL
      console.log('Photo ajoutée (base64 ou URL)');
    } else if (req.file) {
      photoToStore = `/uploads/${req.file.filename}`;
      console.log('Photo ajoutée (fichier):', photoToStore);
    }

    // Si on demande un ordre > 0, verrouiller la plage et décaler les ordres existants (atomiquement)
    if (targetOrdre > 0) {
      // Verrouille les lignes afin d'éviter des insertions concurrentes au même ordre
      await connection.execute(
        'SELECT id FROM bureauMembers WHERE ordre >= ? FOR UPDATE',
        [targetOrdre]
      );

      await connection.execute(
        'UPDATE bureauMembers SET ordre = ordre + 1 WHERE ordre >= ?',
        [targetOrdre]
      );
    }

    const [result] = await connection.execute(
      'INSERT INTO bureauMembers (poste, nom, fonction, photo, ordre) VALUES (?, ?, ?, ?, ?)',
      [poste, nom, fonction, photoToStore, targetOrdre]
    );

    await connection.commit();
    connection.release();

    res.status(201).json({
      success: true,
      message: 'Membre créé avec succès',
      id: result.insertId
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (e) {
      console.error('Erreur rollback:', e);
    }
    connection.release();
    console.error('Erreur lors de la création du membre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Mettre à jour un membre (protégé - admin seulement)
export const updateBureauMember = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { poste, nom, fonction, ordre, photo } = req.body;

    console.log('Données reçues pour mise à jour:');
    console.log('  ID:', id);
    console.log('  poste:', poste);
    console.log('  nom:', nom);
    console.log('  fonction:', fonction);
    console.log('  ordre:', ordre);
    console.log('  photo présente:', !!photo);

    await connection.beginTransaction();

    // Verrouiller la ligne du membre
    const [rows] = await connection.execute('SELECT * FROM bureauMembers WHERE id = ? FOR UPDATE', [id]);
    const member = rows[0];

    if (!member) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Membre non trouvé' });
    }

    // Validation - permettre mises à jour partielles
    if ((poste || nom || fonction) && (!poste || !nom || !fonction)) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Les champs poste, nom et fonction sont requis ensemble'
      });
    }

    const updatedPoste = poste || member.poste;
    const updatedNom = nom || member.nom;
    const updatedFonction = fonction || member.fonction;
    
    let updatedPhoto = member.photo;
    
    // Gérer la photo : base64, fichier, ou conserver l'existante
    if (photo && photo.trim() !== '') {
      updatedPhoto = photo; // Peut être base64 ou URL
      console.log('Photo mise à jour (base64 ou URL)');
    } else if (req.file) {
      updatedPhoto = `/uploads/${req.file.filename}`;
      console.log('Photo mise à jour (fichier):', updatedPhoto);
    } else {
      console.log('Photo conservée:', updatedPhoto);
    }
    
    const updatedOrdre = typeof ordre === 'number' ? ordre : member.ordre;

    // Si l'ordre change, verrouiller la plage affectée puis ajuster les autres rangs dans la transaction
    if (typeof ordre === 'number' && updatedOrdre !== member.ordre) {
      const oldOrdre = member.ordre;
      const newOrdre = updatedOrdre;

      if (newOrdre > oldOrdre) {
        // Verrouiller les lignes entre oldOrdre+1 et newOrdre afin d'éviter des insertions concurrentes
        await connection.execute(
          'SELECT id FROM bureauMembers WHERE ordre > ? AND ordre <= ? FOR UPDATE',
          [oldOrdre, newOrdre]
        );

        // Décrémenter ceux entre oldOrdre+1 et newOrdre
        await connection.execute(
          'UPDATE bureauMembers SET ordre = ordre - 1 WHERE ordre > ? AND ordre <= ?',
          [oldOrdre, newOrdre]
        );
      } else if (newOrdre < oldOrdre) {
        // Verrouiller les lignes entre newOrdre et oldOrdre-1
        await connection.execute(
          'SELECT id FROM bureauMembers WHERE ordre >= ? AND ordre < ? FOR UPDATE',
          [newOrdre, oldOrdre]
        );

        // Incrémenter ceux entre newOrdre et oldOrdre-1
        await connection.execute(
          'UPDATE bureauMembers SET ordre = ordre + 1 WHERE ordre >= ? AND ordre < ?',
          [newOrdre, oldOrdre]
        );
      }
    }

    // Mettre à jour le membre
    const [result] = await connection.execute(
      'UPDATE bureauMembers SET poste = ?, nom = ?, fonction = ?, photo = ?, ordre = ? WHERE id = ?',
      [updatedPoste, updatedNom, updatedFonction, updatedPhoto, updatedOrdre || 0, id]
    );

    await connection.commit();
    connection.release();

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Membre mis à jour avec succès' });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour' });
    }
  } catch (error) {
    try {
      await connection.rollback();
    } catch (e) {
      console.error('Erreur rollback:', e);
    }
    connection.release();
    console.error('Erreur lors de la mise à jour du membre:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer un membre (protégé - admin seulement) — désormais dans une transaction qui réajuste les ordres
export const deleteBureauMember = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;

    await connection.beginTransaction();

    // Verrouiller la ligne du membre à supprimer
    const [rows] = await connection.execute('SELECT * FROM bureauMembers WHERE id = ? FOR UPDATE', [id]);
    const member = rows[0];

    if (!member) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Membre non trouvé' });
    }

    const deletedOrdre = member.ordre || 0;

    // Supprimer le membre
    const [delResult] = await connection.execute('DELETE FROM bureauMembers WHERE id = ?', [id]);

    if (delResult.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
    }

    // Réajuster les ordres: décrémenter ceux ayant ordre > deletedOrdre
    if (deletedOrdre > 0) {
      // Verrouiller la plage affectée pour éviter les insertions concurrentes
      await connection.execute('SELECT id FROM bureauMembers WHERE ordre > ? FOR UPDATE', [deletedOrdre]);

      await connection.execute('UPDATE bureauMembers SET ordre = ordre - 1 WHERE ordre > ?', [deletedOrdre]);
    }

    await connection.commit();
    connection.release();

    res.json({ success: true, message: 'Membre supprimé avec succès' });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (e) {
      console.error('Erreur rollback:', e);
    }
    connection.release();
    console.error('Erreur lors de la suppression du membre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};
