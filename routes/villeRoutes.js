import express from 'express';
import { getAllVilles, getVilleById, createVille, updateVille, deleteVille } from '../controllers/villeController.js';
import { verifyToken } from '../controllers/authController.js';

const router = express.Router();

router.get('/villes', getAllVilles);
router.get('/villes/:id', getVilleById);
router.post('/villes', verifyToken, createVille);
router.put('/villes/:id', verifyToken, updateVille);
router.delete('/villes/:id', verifyToken, deleteVille);

export default router;
