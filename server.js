import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

import { testConnection } from './config/database.js';
import eventRoutes from './routes/eventRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bureauMemberRoutes from './routes/bureauMemberRoutes.js';
import offresEmploisRoutes from './routes/offresEmploisRoutes.js';
import institutionRoutes from './routes/institutionRoutes.js';
import associationRoutes from './routes/associationRoutes.js';
import villeRoutes from './routes/villeRoutes.js';
import anciensPresidentsRoutes from './routes/anciensPresidentsRoutes.js';

// Configuration ES6 pour __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Créer les dossiers s'ils n'existent pas
const uploadDir = path.join(__dirname, '../public/uploads');
const imagesDir = path.join(__dirname, '../public/images');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Dossier uploads créé');
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('📁 Dossier images créé');
}

// Middleware
// Configuration CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://87.106.53.3'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

// Servir les fichiers statiques (images)
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes API
app.use('/api', bureauMemberRoutes);
app.use('/api', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/offres-emplois', offresEmploisRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/associations', associationRoutes);
app.use('/api', villeRoutes);
app.use('/api/anciens-presidents', anciensPresidentsRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API FESSEF fonctionne correctement',
    timestamp: new Date().toISOString()
  });
});

// Gestion globale des erreurs
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  
  // Erreur multer (upload de fichier)
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Fichier trop volumineux',
      error: 'La taille maximale autorisée est dépassée'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
  });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Test de connexion à la base de données
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Impossible de se connecter à la base de données');
      console.log('📝 Assurez-vous que MySQL est démarré et que la configuration dans .env est correcte');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('🚀 Serveur FESSEF démarré avec succès');
      console.log(`📍 URL locale: http://localhost:${PORT}`);
      console.log(`📍 URL publique: http://87.106.53.3:${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Origins CORS autorisées:`);
      console.log(`   - http://localhost:5173`);
      console.log(`   - http://localhost:5174`);
      console.log(`   - http://localhost:5175`);
      console.log(`   - http://87.106.53.3`);
      console.log('');
      console.log('📚 Endpoints API disponibles:');
      console.log('  GET    /api/health              - Test de l\'API');
      console.log('  GET    /api/events              - Liste des événements');
      console.log('  GET    /api/events/:id          - Détails d\'un événement');
      console.log('  GET    /api/events/search?q=... - Recherche d\'événements');
      console.log('  POST   /api/events              - Créer un événement (avec upload)');
      console.log('  PUT    /api/events/:id          - Modifier un événement');
      console.log('  DELETE /api/events/:id          - Supprimer un événement');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion de l'arrêt gracieux
process.on('SIGINT', () => {
  console.log('\n🔄 Arrêt du serveur en cours...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Arrêt du serveur en cours...');
  process.exit(0);
});

startServer();
