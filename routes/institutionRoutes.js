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

const router = express.Router()

// Routes publiques
router.get('/', getAllInstitutions)
router.get('/id/:id', getInstitutionById)
router.get('/ville/:villeId', getInstitutionByVille)

// Routes protégées (admin only)
router.post('/', verifyToken, createInstitution)
router.put('/:id', verifyToken, updateInstitution)
router.delete('/:id', verifyToken, deleteInstitution)

export default router
