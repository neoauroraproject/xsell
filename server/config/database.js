import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database connection
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Promisify database methods
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));
db.runAsync = promisify(db.run.bind(db));

// Initialize database tables
export async function initDatabase() {
  try {
    // Enable foreign keys
    await db.runAsync('PRAGMA foreign_keys = ON');

    // Create admins table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create panels table with VPS access fields
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS panels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        status TEXT DEFAULT 'inactive',
        vpsUsername TEXT,
        vpsPassword TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if VPS columns exist, if not add them
    const tableInfo = await db.allAsync('PRAGMA table_info(panels)');
    const hasVpsUsername = tableInfo.some(column => column.name === 'vpsUsername');
    const hasVpsPassword = tableInfo.some(column => column.name === 'vpsPassword');
    
    if (!hasVpsUsername) {
      await db.runAsync('ALTER TABLE panels ADD COLUMN vpsUsername TEXT');
    }
    if (!hasVpsPassword) {
      await db.runAsync('ALTER TABLE panels ADD COLUMN vpsPassword TEXT');
    }

    // Create users table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        panel_id INTEGER,
        username TEXT NOT NULL,
        email TEXT,
        traffic_limit INTEGER DEFAULT 0,
        traffic_used INTEGER DEFAULT 0,
        expiry_date DATETIME,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (panel_id) REFERENCES panels (id) ON DELETE CASCADE
      )
    `);

    // Create settings table WITHOUT description column initially
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if description column exists, if not add it
    const settingsTableInfo = await db.allAsync('PRAGMA table_info(settings)');
    const hasDescriptionColumn = settingsTableInfo.some(column => column.name === 'description');
    
    if (!hasDescriptionColumn) {
      await db.runAsync('ALTER TABLE settings ADD COLUMN description TEXT');
    }

    // Insert default admin if not exists
    const adminExists = await db.getAsync('SELECT id FROM admins WHERE username = ?', ['admin']);
    if (!adminExists) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('admin123', 10);
      await db.runAsync(
        'INSERT INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@xsell.com', hashedPassword, 'super_admin']
      );
      console.log('✅ Default admin created: username=admin, password=admin123');
    } else {
      console.log('✅ Default admin already exists');
    }

    // Insert default settings
    const defaultSettings = [
      { key: 'app_name', value: 'X-UI SELL Panel', description: 'Application name' },
      { key: 'app_version', value: '1.0.0', description: 'Application version' },
      { key: 'max_panels', value: '10', description: 'Maximum number of panels' },
      { key: 'auto_backup', value: 'true', description: 'Enable automatic backups' }
    ];

    for (const setting of defaultSettings) {
      const exists = await db.getAsync('SELECT id FROM settings WHERE key = ?', [setting.key]);
      if (!exists) {
        await db.runAsync(
          'INSERT INTO settings (key, value, description) VALUES (?, ?, ?)',
          [setting.key, setting.value, setting.description]
        );
      }
    }

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

export default db;