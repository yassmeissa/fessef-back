import express from 'express';
import {
  getBureauMembers,
  getBureauMemberById,
  createBureauMember,
  updateBureauMember,
  deleteBureauMember
} from '../controllers/bureauMemberController.js';
import { verifyToken } from '../controllers/authController.js';

const router = express.Router();

// Routes publiques
router.get('/bureau-members', getBureauMembers);
router.get('/bureau-members/:id', getBureauMemberById);

// Routes protégées (admin seulement)
router.post('/bureau-members', verifyToken, createBureauMember);
router.put('/bureau-members/:id', verifyToken, updateBureauMember);
router.delete('/bureau-members/:id', verifyToken, deleteBureauMember);

export default router;
