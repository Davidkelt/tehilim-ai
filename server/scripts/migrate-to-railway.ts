/**
 * One-time migration script: uploads local DB cache to Railway
 *
 * Usage:
 *   IMPORT_SECRET=your_secret RAILWAY_URL=https://tehilim-ai-production.up.railway.app npx tsx server/scripts/migrate-to-railway.ts
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAILWAY_URL = process.env.RAILWAY_URL || 'https://tehilim-ai-production.up.railway.app';
const IMPORT_SECRET = process.env.IMPORT_SECRET;

if (!IMPORT_SECRET) {
  console.error('ERROR: Set IMPORT_SECRET env var (must match the one in Railway)');
  process.exit(1);
}

// Open local database
const dbPath = path.resolve(__dirname, '..', '..', 'tehillim.db');
console.log(`Opening local database: ${dbPath}`);
const db = new Database(dbPath, { readonly: true });

// Read all data
const analyses = db.prepare('SELECT chapter, age_group, analysis_json, created_at FROM analyses').all();
const psalms = db.prepare('SELECT chapter, verses_json, fetched_at FROM psalms').all();
const moods = db.prepare('SELECT chapter, tags_json FROM mood_tags').all();

console.log(`Found: ${analyses.length} analyses, ${psalms.length} psalms, ${moods.length} mood tags`);

if (analyses.length === 0 && psalms.length === 0 && moods.length === 0) {
  console.log('Nothing to migrate!');
  process.exit(0);
}

// Upload to Railway
console.log(`Uploading to ${RAILWAY_URL}/api/import-cache ...`);

const response = await fetch(`${RAILWAY_URL}/api/import-cache`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Import-Secret': IMPORT_SECRET,
  },
  body: JSON.stringify({ analyses, psalms, moods }),
});

if (!response.ok) {
  const text = await response.text();
  console.error(`ERROR: ${response.status} ${response.statusText}`);
  console.error(text);
  process.exit(1);
}

const result = await response.json();
console.log('Migration complete!', result);

db.close();
