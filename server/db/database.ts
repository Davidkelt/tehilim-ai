import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '..', '..', 'tehillim.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDatabase(): void {
  const database = getDb();

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
}
