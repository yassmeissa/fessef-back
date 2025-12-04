import Event from '../models/Event.js'

// Fonction helper pour construire les URLs complètes des images
const buildImageUrl = (imagePath, req) => {
  if (!imagePath) return '';
  
  // Si c'est déjà une URL complète ou du base64, retourner tel quel
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:image')) {
    return imagePath;
  }
  
  // Construire l'URL complète avec le protocole et l'host
  // Utiliser le header X-Forwarded-Proto si disponible (pour nginx/reverse proxy)
  let protocol = req.get('X-Forwarded-Proto') || req.protocol || 'http';
  const host = req.get('host') || 'localhost:3001';
  
  return `${protocol}://${host}${imagePath}`;
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.getAll()
    // Transformer les images pour inclure les URLs complètes
    const eventsWithUrls = events.map(event => ({
      ...event,
      image_url: buildImageUrl(event.image_url, req)
    }))
    res.json(eventsWithUrls)
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
    // Transformer les images pour inclure les URLs complètes
    const eventsWithUrls = events.map(event => ({
      ...event,
      image_url: buildImageUrl(event.image_url, req)
    }))
    res.json(eventsWithUrls)
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
    
    // Construire l'URL complète pour l'image
    event.image_url = buildImageUrl(event.image_url, req)
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
    
    // Si un fichier a été uploadé, ajouter son chemin aux données
    if (req.file) {
      eventData.image_url = `/uploads/${req.file.filename}`
    } else if (eventData.image_url && !eventData.image_url.startsWith('data:image')) {
      // Si c'est déjà une URL, la garder telle quelle
    } else if (eventData.image_url && eventData.image_url.startsWith('data:image')) {
      // Si l'image est en base64, rejeter et demander un upload
      return res.status(400).json({
        error: 'Les images en base64 ne sont pas supportées. Veuillez utiliser un upload de fichier.'
      })
    }
    
    const newEvent = await Event.create(eventData)
    
    // Construire l'URL complète pour la réponse
    newEvent.image_url = buildImageUrl(newEvent.image_url, req)
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
    
    // Si un fichier a été uploadé, ajouter son chemin aux données
    if (req.file) {
      eventData.image_url = `/uploads/${req.file.filename}`
    } else if (eventData.image_url && eventData.image_url.startsWith('data:image')) {
      // Si l'image est en base64, rejeter et demander un upload
      return res.status(400).json({
        error: 'Les images en base64 ne sont pas supportées. Veuillez utiliser un upload de fichier.'
      })
    }
    
    const updatedEvent = await Event.update(id, eventData)
    
    if (!updatedEvent) {
      return res.status(404).json({ error: 'Événement non trouvé' })
    }
    
    // Construire l'URL complète pour la réponse
    updatedEvent.image_url = buildImageUrl(updatedEvent.image_url, req)
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
