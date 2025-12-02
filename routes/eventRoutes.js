import express from 'express'
import {
  getAllEvents,
  getUpcomingEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController.js'
import { verifyToken } from '../controllers/authController.js'
import upload from '../config/multer.js'

const router = express.Router()

// Routes générales
router.get('/events', getAllEvents)
router.get('/events/upcoming', getUpcomingEvents)
router.get('/events/:id',  getEventById)

// Routes protégées
router.post('/events', verifyToken, upload.single('file'), createEvent)
router.put('/events/:id', verifyToken, upload.single('file'), updateEvent)
router.delete('/events/:id', verifyToken, deleteEvent)

export default router

