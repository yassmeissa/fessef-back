import express from 'express'
import {
  getAllInstitutions,
  getInstitutionById,
  getInstitutionByVille,
  createInstitution,
  updateInstitution,
  deleteInstitution
} from '../controllers/institutionController.js'
import { verifyToken } from '../controllers/authController.js'
import upload from '../config/multer.js'

const router = express.Router()

// Routes publiques
router.get('/', getAllInstitutions)
router.get('/id/:id', getInstitutionById)
router.get('/ville/:villeId', getInstitutionByVille)

// Routes protégées (admin only)
router.post('/', verifyToken, upload.single('file'), createInstitution)
router.put('/:id', verifyToken, upload.single('file'), updateInstitution)
router.delete('/:id', verifyToken, deleteInstitution)

export default router
