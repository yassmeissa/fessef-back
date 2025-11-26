import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuration de la connexion MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fessef_db',
  charset: 'utf8mb4',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Pool de connexions pour de meilleures performances
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de connexion
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connexion MySQL établie avec succès');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion MySQL:', error.message);
    return false;
  }
};

// Fonction pour exécuter des requêtes
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête:', error);
    throw error;
  }
};

// Fonction pour fermer le pool de connexions
const closePool = async () => {
  await pool.end();
};

export {
  pool,
  query,
  testConnection,
  closePool
};
