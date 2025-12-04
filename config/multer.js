import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Déterminer le répertoire courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin absolu vers le dossier uploads
const uploadDir = path.join(__dirname, '../public/uploads');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,      // 50MB max pour les fichiers (suffisant pour images)
    fieldSize: 200 * 1024 * 1024     // 200MB max pour les champs texte
  },
  fileFilter: function (req, file, cb) {
    // Accepter seulement les images et vidéos
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mpeg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

export default upload;
