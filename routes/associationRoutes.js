import express from 'express';
import {
  getAllAssociations,
  getAssociationById,
  getAssociationByVille,
  getVillesByAssociation,
  createAssociation,
  updateAssociation,
  deleteAssociation,
  addVilleToAssociation,
  removeVilleFromAssociation
} from '../controllers/associationController.js';
import { verifyToken } from '../controllers/authController.js';
import upload from '../config/multer.js';

const router = express.Router();

// Public routes
router.get('/', getAllAssociations);
router.get('/id/:id', getAssociationById);
router.get('/ville/:villeId', getAssociationByVille);
router.get('/:id/villes', getVillesByAssociation);

// Protected routes (require authentication)
router.post('/', verifyToken, upload.single('file'), createAssociation);
router.put('/:id', verifyToken, upload.single('file'), updateAssociation);
router.delete('/:id', verifyToken, deleteAssociation);
router.post('/:id/villes', verifyToken, addVilleToAssociation);
router.delete('/:id/villes/:villeId', verifyToken, removeVilleFromAssociation);

export default router;
