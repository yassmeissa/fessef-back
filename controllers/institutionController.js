import Institution from '../models/Institution.js'

export const getAllInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.getAll()
    res.json(institutions)
  } catch (error) {
    console.error('Erreur lors de la récupération des institutions:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des institutions',
      details: error.message 
    })
  }
}

export const getInstitutionById = async (req, res) => {
  try {
    const { id } = req.params
    const institution = await Institution.getById(id)
    
    if (!institution) {
      return res.status(404).json({ error: 'Institution non trouvée' })
    }
    
    res.json(institution)
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'institution:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération de l\'institution',
      details: error.message 
    })
  }
}

export const getInstitutionByVille = async (req, res) => {
  try {
    const { villeId } = req.params
    const institution = await Institution.getByVille(villeId)
    
    if (!institution) {
      return res.status(404).json({ error: 'Institution non trouvée pour cette ville' })
    }
    
    res.json(institution)
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'institution par ville:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération de l\'institution par ville',
      details: error.message 
    })
  }
}


export const createInstitution = async (req, res) => {
  try {
    console.log('Données reçues pour création:', req.body);
    
    const { nom, adresse, telephone, email, website } = req.body
    
    // Validation
    if (!nom || nom.trim() === '') {
      return res.status(400).json({ 
        error: 'Le champ nom est obligatoire et ne peut pas être vide' 
      })
    }
    
    const institution = await Institution.create(req.body)
    console.log('Institution créée:', institution);
    res.status(201).json(institution)
  } catch (error) {
    console.error('Erreur lors de la création de l\'institution:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la création de l\'institution',
      details: error.message 
    })
  }
}

export const updateInstitution = async (req, res) => {
  try {
    console.log('Données reçues pour mise à jour:', req.body);
    
    const { id } = req.params
    const { nom, adresse, telephone, email, website } = req.body
    
    // Validation
    if (!nom || nom.trim() === '') {
      return res.status(400).json({ 
        error: 'Le champ nom est obligatoire et ne peut pas être vide' 
      })
    }
    
    const institution = await Institution.update(id, req.body)
    console.log('Institution mise à jour:', institution);
    res.json(institution)
  } catch (error) {
    if (error.message === 'Institution non trouvée') {
      return res.status(404).json({ error: error.message })
    }
    console.error('Erreur lors de la mise à jour de l\'institution:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour de l\'institution',
      details: error.message 
    })
  }
}

export const deleteInstitution = async (req, res) => {
  try {
    const { id } = req.params
    
    await Institution.delete(id)
    res.json({ message: 'Institution supprimée avec succès' })
  } catch (error) {
    if (error.message === 'Institution non trouvée') {
      return res.status(404).json({ error: error.message })
    }
    console.error('Erreur lors de la suppression de l\'institution:', error)
    res.status(500).json({ 
      error: 'Erreur serveur lors de la suppression de l\'institution',
      details: error.message 
    })
  }
}
