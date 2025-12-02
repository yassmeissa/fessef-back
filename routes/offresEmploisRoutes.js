import express from 'express'
import {
  getAllOffres,
  getActiveOffres,
  getOffreById,
  createOffre,
  updateOffre,
  deleteOffre
} from '../controllers/offresEmploisController.js'
import { verifyToken } from '../controllers/authController.js'
import upload from '../config/multer.js'

const router = express.Router()

// Routes publiques
router.get('/', getAllOffres)
router.get('/actives', getActiveOffres)
router.get('/:id', getOffreById)

// Routes protégées (admin only)
router.post('/', verifyToken, upload.single('file'), createOffre)
router.put('/:id', verifyToken, upload.single('file'), updateOffre)
router.delete('/:id', verifyToken, deleteOffre)

export default router
