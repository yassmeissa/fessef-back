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
  const { nom, dates_mandat, image } = req.body;
  let imagePath = '';
  if (req.file) {
    imagePath = '/uploads/' + req.file.filename;
  } else if (image) {
    imagePath = image;
  }
  try {
    await query('INSERT INTO anciens_presidents (nom, dates_mandat, image) VALUES (?, ?, ?)', [nom, dates_mandat, imagePath]);
    const rows = await query('SELECT * FROM anciens_presidents ORDER BY id DESC LIMIT 1');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePresident = async (req, res) => {
  const { nom, dates_mandat } = req.body;
  let imagePath = '';
  if (req.file) {
    imagePath = '/uploads/' + req.file.filename;
  } else if (req.body.image) {
    imagePath = req.body.image;
  }
  try {
    await query('UPDATE anciens_presidents SET nom=?, dates_mandat=?, image=? WHERE id=?', [nom, dates_mandat, imagePath, req.params.id]);
    res.json({ id: req.params.id, nom, dates_mandat, image: imagePath });
  } catch (err) {
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
