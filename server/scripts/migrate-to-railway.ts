/**
 * One-time migration script: uploads local DB cache to Railway
 * Sends data in small batches to avoid the 50kb global body limit.
 *
 * Usage:
 *   IMPORT_SECRET=migrate2026tehilim RAILWAY_URL=https://tehilim-ai-production.up.railway.app npx tsx server/scripts/migrate-to-railway.ts
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BATCH_SIZE = 5; // records per request — each analysis is ~3-4KB, 5×4KB = 20KB, well under 50kb limit

async function sendBatch(
  url: string,
  secret: string,
  payload: { analyses?: any[]; psalms?: any[]; moods?: any[] }
): Promise<{ analyses: number; psalms: number; moods: number }> {
  const response = await fetch(`${url}/api/import-cache`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Import-Secret': secret,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  const result = await response.json() as any;
  return result.imported;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function main() {
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
    db.close();
    process.exit(0);
  }

  const totals = { analyses: 0, psalms: 0, moods: 0 };

  // Upload analyses in batches
  const analysisBatches = chunk(analyses, BATCH_SIZE);
  console.log(`\nUploading ${analyses.length} analyses in ${analysisBatches.length} batches...`);
  for (let i = 0; i < analysisBatches.length; i++) {
    const batch = analysisBatches[i];
    process.stdout.write(`  Batch ${i + 1}/${analysisBatches.length} (${batch.length} records)... `);
    try {
      const result = await sendBatch(RAILWAY_URL, IMPORT_SECRET, { analyses: batch });
      totals.analyses += result.analyses;
      console.log(`✓ (total: ${totals.analyses})`);
    } catch (err: any) {
      console.error(`✗ ERROR: ${err.message}`);
      db.close();
      process.exit(1);
    }
  }

  // Upload psalms in batches
  const psalmBatches = chunk(psalms, BATCH_SIZE);
  console.log(`\nUploading ${psalms.length} psalms in ${psalmBatches.length} batches...`);
  for (let i = 0; i < psalmBatches.length; i++) {
    const batch = psalmBatches[i];
    process.stdout.write(`  Batch ${i + 1}/${psalmBatches.length} (${batch.length} records)... `);
    try {
      const result = await sendBatch(RAILWAY_URL, IMPORT_SECRET, { psalms: batch });
      totals.psalms += result.psalms;
      console.log(`✓ (total: ${totals.psalms})`);
    } catch (err: any) {
      console.error(`✗ ERROR: ${err.message}`);
      db.close();
      process.exit(1);
    }
  }

  // Upload mood tags in batches
  const moodBatches = chunk(moods, BATCH_SIZE);
  console.log(`\nUploading ${moods.length} mood tags in ${moodBatches.length} batches...`);
  for (let i = 0; i < moodBatches.length; i++) {
    const batch = moodBatches[i];
    process.stdout.write(`  Batch ${i + 1}/${moodBatches.length} (${batch.length} records)... `);
    try {
      const result = await sendBatch(RAILWAY_URL, IMPORT_SECRET, { moods: batch });
      totals.moods += result.moods;
      console.log(`✓ (total: ${totals.moods})`);
    } catch (err: any) {
      console.error(`✗ ERROR: ${err.message}`);
      db.close();
      process.exit(1);
    }
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Analyses: ${totals.analyses}`);
  console.log(`   Psalms:   ${totals.psalms}`);
  console.log(`   Moods:    ${totals.moods}`);

  db.close();
}

main();
