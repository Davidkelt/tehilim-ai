import { GoogleGenerativeAI } from '@google/generative-ai';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// ─── Config ──────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..', '..');
dotenv.config({ path: path.resolve(ROOT_DIR, '.env') });

const DB_PATH = path.resolve(ROOT_DIR, 'tehillim.db');
const PROGRESS_PATH = path.resolve(__dirname, 'precache-progress.json');

const AGE_GROUPS = ['children', 'teens', 'adults', 'seniors'] as const;
type AgeGroup = (typeof AGE_GROUPS)[number];

const AGE_GROUP_DESCRIPTIONS: Record<AgeGroup, string> = {
  children: 'ילדים בגילאי 8-12. השתמש בשפה פשוטה וברורה, דוגמאות מעולם בית הספר, חברים ומשפחה. הימנע ממושגים מופשטים מדי.',
  teens: 'נוער בגילאי 13-18. דבר על זהות, אתגרים חברתיים, לחץ חברתי, ומציאת הדרך בחיים. השתמש בשפה ישירה ורלוונטית.',
  adults: 'מבוגרים בגילאי 19-45. התמקד בקריירה, מערכות יחסים, צמיחה אישית, ואתגרי החיים המודרניים. ניתוח מעמיק אך מעשי.',
  seniors: 'בוגרים מעל גיל 45. התמקד בחוכמה, מורשת, הכרת תודה, בריאות, ומשמעות. גישה חמה ומכבדת עם עומק.',
};

const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  children: 'ילדים',
  teens: 'נוער',
  adults: 'מבוגרים',
  seniors: 'בוגרים',
};

interface PsalmVerse {
  verse: number;
  text: string;
}

interface AnalysisResult {
  summary: string;
  key_verses: Array<{ verse_number: number; text: string; explanation: string }>;
  life_lessons: Array<{ title: string; description: string }>;
  emotional_tone: string;
  historical_context: string;
}

interface ProgressData {
  total: number;
  completed: number;
  errors: number;
  last_run: string;
  error_log: Array<{ chapter: number; age_group: string; error: string }>;
}

// ─── Parse CLI args ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const chapterArgIdx = args.indexOf('--chapter');
const singleChapter = chapterArgIdx !== -1 ? parseInt(args[chapterArgIdx + 1], 10) : null;

if (singleChapter !== null && (isNaN(singleChapter) || singleChapter < 1 || singleChapter > 150)) {
  console.error('❌ --chapter must be between 1 and 150');
  process.exit(1);
}

// ─── Database ────────────────────────────────────────────────────────────────

function openDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  // Ensure all tables exist
  db.exec(`
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
  `);
  return db;
}

function getAllPsalms(db: Database.Database): Map<number, PsalmVerse[]> {
  const rows = db.prepare('SELECT chapter, verses_json FROM psalms ORDER BY chapter').all() as any[];
  const map = new Map<number, PsalmVerse[]>();
  for (const row of rows) {
    map.set(row.chapter, JSON.parse(row.verses_json));
  }
  return map;
}

function analysisExists(db: Database.Database, chapter: number, ageGroup: string): boolean {
  const row = db.prepare(
    'SELECT 1 FROM analyses WHERE chapter = ? AND age_group = ?'
  ).get(chapter, ageGroup);
  return !!row;
}

function storeAnalysis(db: Database.Database, chapter: number, ageGroup: string, analysis: AnalysisResult): void {
  db.prepare(
    'INSERT OR REPLACE INTO analyses (chapter, age_group, analysis_json) VALUES (?, ?, ?)'
  ).run(chapter, ageGroup, JSON.stringify(analysis));
}

// ─── Gemini ──────────────────────────────────────────────────────────────────

function buildPrompt(chapter: number, verses: PsalmVerse[], ageGroup: AgeGroup): string {
  const ageDesc = AGE_GROUP_DESCRIPTIONS[ageGroup];
  const psalmText = verses.map(v => `(${v.verse}) ${v.text}`).join('\n');

  return `אתה תלמיד חכם חם ונגיש שהופך את ספר תהילים לרלוונטי ומשמעותי לחיים המודרניים. אתה דובר עברית שוטפת ומתבטא בשפה טבעית, חמה ועשירה. הניתוח שלך צריך להרגיש אישי, תובנתי ומעשי — לא אקדמי או יבש.

קהל יעד: ${ageDesc}

נתח את פרק ${chapter} בתהילים:

${psalmText}

הנחיות:
- בחר 2-3 פסוקים משמעותיים במיוחד ל-key_verses. ציטוט הפסוק חייב להיות מדויק מהטקסט שקיבלת.
- כתוב 3 לקחים מעשיים ל-life_lessons
- התאם את השפה והדוגמאות לקהל היעד
- הטון הרגשי: בחר מתוך: תקווה, תפילה, הודיה, צער, אמונה, גבורה, ענווה, שמחה, חרטה, ביטחון
- ענה בעברית בלבד
- החזר JSON תקין בלבד, ללא טקסט נוסף, ללא markdown:
{
  "summary": "סיכום קצר של 2-3 משפטים על נושא הפרק",
  "key_verses": [
    { "verse_number": 3, "text": "הפסוק המלא", "explanation": "למה הפסוק הזה חשוב ומשמעותי" }
  ],
  "life_lessons": [
    { "title": "כותרת קצרה", "description": "הסבר מעשי ויישומי" }
  ],
  "emotional_tone": "מילה אחת או שתיים שמתארות את הטון הרגשי",
  "historical_context": "הקשר היסטורי קצר - מתי ולמה נכתב הפרק"
}`;
}

async function generateWithGemini(
  model: any,
  chapter: number,
  verses: PsalmVerse[],
  ageGroup: AgeGroup
): Promise<AnalysisResult> {
  const prompt = buildPrompt(chapter, verses, ageGroup);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Extract JSON — handle potential markdown code blocks
  let jsonStr = text.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  const analysis: AnalysisResult = JSON.parse(jsonStr);

  // Basic validation
  if (!analysis.summary || !Array.isArray(analysis.key_verses) || !Array.isArray(analysis.life_lessons)) {
    throw new Error('Invalid analysis structure — missing required fields');
  }

  return analysis;
}

// ─── Progress ────────────────────────────────────────────────────────────────

function loadProgress(): ProgressData {
  try {
    if (fs.existsSync(PROGRESS_PATH)) {
      return JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8'));
    }
  } catch {}
  return { total: 600, completed: 0, errors: 0, last_run: '', error_log: [] };
}

function saveProgress(progress: ProgressData): void {
  progress.last_run = new Date().toISOString();
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8');
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validateAnalyses(db: Database.Database, chapters?: number[]): void {
  const chaptersToCheck = chapters || Array.from({ length: 150 }, (_, i) => i + 1);
  const totalExpected = chaptersToCheck.length * AGE_GROUPS.length;

  console.log(`\n🔍 Validating ${totalExpected} analyses...`);

  let missing = 0;
  let malformed = 0;
  const issues: string[] = [];

  for (const ch of chaptersToCheck) {
    for (const ag of AGE_GROUPS) {
      const row = db.prepare(
        'SELECT analysis_json FROM analyses WHERE chapter = ? AND age_group = ?'
      ).get(ch, ag) as any;

      if (!row) {
        missing++;
        issues.push(`  ❌ Missing: Psalm ${ch} / ${ag}`);
        continue;
      }

      try {
        const data = JSON.parse(row.analysis_json);
        if (!data.summary || !Array.isArray(data.key_verses) || !Array.isArray(data.life_lessons) || !data.emotional_tone || !data.historical_context) {
          malformed++;
          issues.push(`  ⚠️  Malformed: Psalm ${ch} / ${ag} — missing fields`);
        }
      } catch {
        malformed++;
        issues.push(`  ⚠️  Malformed: Psalm ${ch} / ${ag} — invalid JSON`);
      }
    }
  }

  if (issues.length > 0 && issues.length <= 20) {
    issues.forEach(i => console.log(i));
  } else if (issues.length > 20) {
    issues.slice(0, 10).forEach(i => console.log(i));
    console.log(`  ... and ${issues.length - 10} more issues`);
  }

  const valid = totalExpected - missing - malformed;
  console.log(`\n✅ Valid: ${valid}/${totalExpected} | ❌ Missing: ${missing} | ⚠️  Malformed: ${malformed}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Tehillim AI Analysis Pre-Cache Script');
  console.log('  Using: Google Gemini 2.5 Flash');
  console.log('═══════════════════════════════════════════════════');

  if (dryRun) {
    console.log('🏃 DRY RUN — no API calls will be made\n');
  }

  if (singleChapter) {
    console.log(`📌 Single chapter mode: Psalm ${singleChapter}\n`);
  }

  // Open DB
  const db = openDb();

  // Load all psalms
  const psalmsMap = getAllPsalms(db);
  console.log(`📚 Loaded ${psalmsMap.size} psalms from cache`);

  if (psalmsMap.size === 0) {
    console.error('❌ No psalms in database. Run the server first to fetch them from Sefaria.');
    process.exit(1);
  }

  // Determine chapters to process
  const chapters: number[] = singleChapter
    ? [singleChapter]
    : Array.from({ length: 150 }, (_, i) => i + 1);

  // Check which psalms we have text for
  const missingText = chapters.filter(ch => !psalmsMap.has(ch));
  if (missingText.length > 0) {
    console.warn(`⚠️  Missing psalm text for chapters: ${missingText.join(', ')}`);
    console.warn('   These will be skipped. Run the server to fetch them.\n');
  }

  const availableChapters = chapters.filter(ch => psalmsMap.has(ch));

  // Build work list
  type WorkItem = { chapter: number; ageGroup: AgeGroup; index: number };
  const workItems: WorkItem[] = [];
  let skipped = 0;

  let idx = 0;
  for (const ch of availableChapters) {
    for (const ag of AGE_GROUPS) {
      idx++;
      if (analysisExists(db, ch, ag)) {
        skipped++;
        continue;
      }
      workItems.push({ chapter: ch, ageGroup: ag, index: idx });
    }
  }

  const totalPossible = availableChapters.length * AGE_GROUPS.length;
  console.log(`📊 Total: ${totalPossible} | Already cached: ${skipped} | To generate: ${workItems.length}\n`);

  if (workItems.length === 0) {
    console.log('✅ All analyses are already cached!');
    validateAnalyses(db, availableChapters);
    db.close();
    return;
  }

  if (dryRun) {
    console.log('Would generate the following analyses:\n');
    for (const item of workItems) {
      const label = AGE_GROUP_LABELS[item.ageGroup];
      console.log(`  [${item.index}/${totalPossible}] פרק ${item.chapter} / ${label}`);
    }
    console.log(`\nTotal API calls needed: ${workItems.length}`);
    console.log(`Estimated time: ~${Math.ceil(workItems.length * 2.5 / 60)} minutes (at ~2.5s per call)`);
    db.close();
    return;
  }

  // Initialize Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    console.error('❌ GEMINI_API_KEY is not set in .env');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Load progress
  const progress = loadProgress();
  progress.total = totalPossible;
  progress.completed = skipped;

  // Process
  let completed = 0;
  let errors = 0;
  const startTime = Date.now();

  for (const item of workItems) {
    const label = AGE_GROUP_LABELS[item.ageGroup];
    const counter = `[${skipped + completed + errors + 1}/${totalPossible}]`;

    try {
      const verses = psalmsMap.get(item.chapter)!;
      const analysis = await generateWithGemini(model, item.chapter, verses, item.ageGroup);
      storeAnalysis(db, item.chapter, item.ageGroup, analysis);

      completed++;
      progress.completed = skipped + completed;
      console.log(`${counter} פרק ${item.chapter} / ${label} — ✅ cached`);
    } catch (err: any) {
      errors++;
      progress.errors = errors;
      progress.error_log.push({
        chapter: item.chapter,
        age_group: item.ageGroup,
        error: err.message || String(err),
      });
      console.error(`${counter} פרק ${item.chapter} / ${label} — ❌ ${err.message || err}`);
    }

    // Save progress periodically (every 10 items)
    if ((completed + errors) % 10 === 0) {
      saveProgress(progress);
    }

    // Rate limit: 2 second delay between calls
    if (completed + errors < workItems.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Final progress save
  saveProgress(progress);

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  Summary');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  ✅ Generated: ${completed}`);
  console.log(`  ⏭️  Skipped (already cached): ${skipped}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log(`  ⏱️  Time: ${elapsed}s`);
  console.log(`  📄 Progress saved to: ${PROGRESS_PATH}`);

  if (errors > 0) {
    console.log(`\n  ⚠️  ${errors} errors occurred. Run the script again to retry failed items.`);
  }

  // Validate
  validateAnalyses(db, availableChapters);

  db.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
