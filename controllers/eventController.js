import Event from '../models/Event.js'

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.getAll()
    res.json(events)
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des événements',
      details: error.message 
    })
  }
}

export const getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.getUpcoming()
    res.json(events)
  } catch (error) {
    console.error('Erreur lors de la récupération des événements à venir:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des événements à venir',
      details: error.message 
    })
  }
}

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params
    const event = await Event.getById(id)
    
    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' })
    }
    
    res.json(event)
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération de l\'événement',
      details: error.message 
    })
  }
}

export const createEvent = async (req, res) => {
  try {
    const eventData = req.body
    const newEvent = await Event.create(eventData)
    res.status(201).json(newEvent)
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la création de l\'événement',
      details: error.message 
    })
  }
}

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params
    const eventData = req.body
    const updatedEvent = await Event.update(id, eventData)
    
    if (!updatedEvent) {
      return res.status(404).json({ error: 'Événement non trouvé' })
    }
    
    res.json(updatedEvent)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour de l\'événement',
      details: error.message 
    })
  }
}

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Event.delete(id)
    
    if (!deleted) {
      return res.status(404).json({ error: 'Événement non trouvé' })
    }
    
    res.json({ message: 'Événement supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la suppression de l\'événement',
      details: error.message 
    })
  }
}

export const testConnection = async (req, res) => {
  try {
    // Test simple de connexion en récupérant le nombre d'événements
    const events = await Event.getAll()
    res.json({ 
      status: 'success', 
      message: 'Connexion à la base de données réussie',
      eventsCount: events.length 
    })
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error)
    res.status(500).json({ 
      status: 'error', 
      message: 'Erreur de connexion à la base de données',
      details: error.message 
    })
  }
}
