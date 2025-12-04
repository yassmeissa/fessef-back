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
    console.log('📤 Multer destination - File:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype
    });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Nettoyer le nom du fichier - remplacer les caractères spéciaux
    const sanitized = file.originalname
      .replace(/[^\w\s.-]/g, '_')  // Remplacer caractères spéciaux par _
      .replace(/\s+/g, '_');        // Remplacer espaces par _
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + sanitized;
    console.log('📝 Multer filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,        // 10MB max pour les fichiers
    fieldSize: 1 * 1024 * 1024,        // 1MB max pour les champs texte (nom, mandat)
    fields: 100,
    files: 1,
    parts: 100                         // Augmenter le nombre de parts
  },
  fileFilter: function (req, file, cb) {
    console.log('🔍 Multer fileFilter - Vérification du fichier:');
    console.log('  - Fieldname:', file.fieldname);
    console.log('  - Originalname:', file.originalname);
    console.log('  - Mimetype:', file.mimetype);
    console.log('  - Size:', file.size);
    
    // Accepter seulement les images et vidéos
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mpeg'];
    if (allowedMimes.includes(file.mimetype)) {
      console.log('✅ Type accepté');
      cb(null, true);
    } else {
      console.log('❌ Type rejeté:', file.mimetype);
      cb(new Error('Type de fichier non autorisé: ' + file.mimetype));
    }
  }
});

export default upload;
