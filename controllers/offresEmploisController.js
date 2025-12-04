import OffresEmplois from '../models/OffresEmplois.js'

export const getAllOffres = async (req, res) => {
  try {
    const offres = await OffresEmplois.getAll()
    res.json(offres)
  } catch (error) {
    console.error('Erreur lors de la récupération des offres d\'emplois:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des offres d\'emplois',
      details: error.message 
    })
  }
}

export const getActiveOffres = async (req, res) => {
  try {
    const offres = await OffresEmplois.getActive()
    res.json(offres)
  } catch (error) {
    console.error('Erreur lors de la récupération des offres actives:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des offres actives',
      details: error.message 
    })
  }
}

export const getOffreById = async (req, res) => {
  try {
    const { id } = req.params
    const offre = await OffresEmplois.getById(id)
    
    if (!offre) {
      return res.status(404).json({ error: 'Offre d\'emploi non trouvée' })
    }
    
    res.json(offre)
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'offre d\'emploi:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération de l\'offre d\'emploi',
      details: error.message 
    })
  }
}

export const createOffre = async (req, res) => {
  try {
    console.log('📥 Création offre - Body:', req.body)
    console.log('📥 Création offre - File:', req.file)
    
    const { poste, contact_entreprise, lien, description, date_limite, date_publication, img_affiche } = req.body
    
    // Validation
    if (!poste || !contact_entreprise || !date_limite || !date_publication) {
      return res.status(400).json({ 
        error: 'Les champs poste, contact_entreprise, date_publication et date_limite sont obligatoires' 
      })
    }
    
    const offreData = req.body
    
    // Si un fichier a été uploadé, ajouter son chemin aux données
    if (req.file) {
      console.log('✅ Fichier uploadé:', req.file.filename)
      offreData.img_affiche = `/uploads/${req.file.filename}`
    } else if (img_affiche && img_affiche.startsWith('data:image')) {
      // Si l'image est en base64, la garder telle quelle
      offreData.img_affiche = img_affiche
    }
    
    const offre = await OffresEmplois.create(offreData)
    res.status(201).json(offre)
  } catch (error) {
    console.error('Erreur lors de la création de l\'offre d\'emploi:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la création de l\'offre d\'emploi',
      details: error.message 
    })
  }
}

export const updateOffre = async (req, res) => {
  try {
    console.log('📥 Mise à jour offre ID:', req.params.id)
    console.log('📥 Mise à jour offre - Body:', req.body)
    console.log('📥 Mise à jour offre - File:', req.file)
    
    const { id } = req.params
    const { poste, contact_entreprise, lien, description, date_limite, date_publication, img_affiche } = req.body
    
    // Validation
    if (!poste || !contact_entreprise || !date_limite || !date_publication) {
      return res.status(400).json({ 
        error: 'Les champs poste, contact_entreprise, date_publication et date_limite sont obligatoires' 
      })
    }
    
    const offreData = req.body
    
    // Si un fichier a été uploadé, ajouter son chemin aux données
    if (req.file) {
      console.log('✅ Fichier uploadé:', req.file.filename)
      offreData.img_affiche = `/uploads/${req.file.filename}`
    } else if (img_affiche && img_affiche.startsWith('data:image')) {
      // Si l'image est en base64, la garder telle quelle
      offreData.img_affiche = img_affiche
    }
    
    const offre = await OffresEmplois.update(id, offreData)
    res.json(offre)
  } catch (error) {
    if (error.message === 'Offre d\'emploi non trouvée') {
      return res.status(404).json({ error: error.message })
    }
    console.error('Erreur lors de la mise à jour de l\'offre d\'emploi:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour de l\'offre d\'emploi',
      details: error.message 
    })
  }
}

export const deleteOffre = async (req, res) => {
  try {
    const { id } = req.params
    
    await OffresEmplois.delete(id)
    res.json({ message: 'Offre d\'emploi supprimée avec succès' })
  } catch (error) {
    if (error.message === 'Offre d\'emploi non trouvée') {
      return res.status(404).json({ error: error.message })
    }
    console.error('Erreur lors de la suppression de l\'offre d\'emploi:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la suppression de l\'offre d\'emploi',
      details: error.message 
    })
  }
}
