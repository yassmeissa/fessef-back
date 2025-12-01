import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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

// Middleware
// Configuration CORS
const corsOptions = {
  origin: [
    // 'http://localhost:5173',
    // 'http://localhost:5174', 
    // 'http://localhost:5175',
    // 'http://127.0.0.1:5173',
    // 'http://127.0.0.1:5174',
    // 'http://127.0.0.1:5175'
      'http://87.106.53.3'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques (images)
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'))); // Ajout pour les images uploadées

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
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend autorisé: http://localhost:5173, 5174, 5175`);
      console.log('');
      console.log('📚 Endpoints API disponibles:');
      console.log('  GET    /api/health              - Test de l\'API');
      console.log('  GET    /api/events              - Liste des événements');
      console.log('  GET    /api/events/:id          - Détails d\'un événement');
      console.log('  GET    /api/events/search?q=... - Recherche d\'événements');
      console.log('  POST   /api/events              - Créer un événement');
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
