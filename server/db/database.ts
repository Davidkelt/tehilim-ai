import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';  // ← הוספנו את זה!

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    // השתמש בנתיב מלא מה-volume – fallback רק להתפתחות מקומית
    const dbPath = process.env.DATABASE_PATH || '/data/tehillim.db';

    // יצירת התיקייה אם היא לא קיימת (זה הפתרון לשגיאה!)
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`[DB] Created missing directory: ${dbDir}`);
    }

    console.log(`[DB] Opening database at: ${dbPath}`);

    try {
      db = new Database(dbPath, {
        // אופציות מומלצות – verbose logging אם צריך debug
        // verbose: console.log,
      });
      db.pragma('journal_mode = WAL');
      db.pragma('foreign_keys = ON');
    } catch (err) {
      console.error('[DB] Failed to open database:', err);
      throw err;  // כדי שהשרת יקרוס ותראה ב-logs
    }
  }
  return db;
}

export function initDatabase(): void {
  const database = getDb();

  console.log('[DB] Initializing tables...');

  database.exec(`
    CREATE TABLE IF NOT EXISTS psalms (
      chapter INTEGER PRIMARY KEY,
      verses_json TEXT NOT NULL,
      fetched_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter INTEGER NOT NULL,
      age_group TEXT NOT NULL,
      analysis_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(chapter, age_group)
    );

    CREATE TABLE IF NOT EXISTS mood_tags (
      chapter INTEGER PRIMARY KEY,
      tags_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_data (
      uid TEXT PRIMARY KEY,
      email TEXT,
      streaks_json TEXT,
      favorites_json TEXT,
      settings_json TEXT,
      achievements_json TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  console.log('[DB] Tables initialized successfully.');
}