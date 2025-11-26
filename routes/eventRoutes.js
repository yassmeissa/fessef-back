import express from 'express'
import {
  getAllEvents,
  getUpcomingEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController.js'
import { verifyToken } from '../controllers/authController.js';

const router = express.Router()

// Routes générales
router.get('/events', getAllEvents)
router.get('/events/upcoming', getUpcomingEvents)
router.get('/events/:id',  getEventById)


// Routes protégées
router.post('/events', verifyToken, createEvent)
router.put('/events/:id', verifyToken, updateEvent)
router.delete('/events/:id', verifyToken, deleteEvent)

export default router

