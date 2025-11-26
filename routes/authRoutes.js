import express from 'express';
import { login, verifyToken, getCurrentUser } from '../controllers/authController.js';

const router = express.Router();

// Route de login
router.post('/login', login);

// Route pour obtenir l'utilisateur actuel (protégée par token)
router.get('/me', verifyToken, getCurrentUser);

export default router;
