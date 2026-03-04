import { getDb } from '../db/database.js';

interface SefariaResponse {
  versions: Array<{
    text: string[][];
    versionTitle: string;
    language: string;
  }>;
}

export interface PsalmVerse {
  verse: number;
  text: string;
}

export interface PsalmChapter {
  chapter: number;
  verses: PsalmVerse[];
}

/**
 * Fetch a single psalm chapter from Sefaria API
 */
async function fetchChapterFromSefaria(chapter: number): Promise<PsalmVerse[]> {
  const url = `https://www.sefaria.org/api/v3/texts/Psalms.${chapter}`;

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Sefaria API error for chapter ${chapter}: ${response.status}`);
  }

  const data = await response.json();

  // Extract Hebrew text - Sefaria v3 returns versions array
  let hebrewTexts: string[] = [];

  if (data.versions && Array.isArray(data.versions)) {
    const heVersion = data.versions.find((v: any) => v.language === 'he');
    if (heVersion && heVersion.text) {
      if (Array.isArray(heVersion.text)) {
        hebrewTexts = heVersion.text.map((t: any) =>
          typeof t === 'string' ? t : Array.isArray(t) ? t.join(' ') : String(t)
        );
      }
    }
  }

  if (hebrewTexts.length === 0) {
    throw new Error(`No Hebrew text found for chapter ${chapter}`);
  }

  // Strip HTML tags and entities from text
  const stripHtml = (html: string): string => {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&thinsp;/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&[a-zA-Z]+;/g, '')
      .trim();
  };

  return hebrewTexts.map((text, i) => ({
    verse: i + 1,
    text: stripHtml(text)
  }));
}

/**
 * Get a psalm chapter - from cache or Sefaria
 */
export function getCachedPsalm(chapter: number): PsalmChapter | null {
  const db = getDb();
  const row = db.prepare('SELECT verses_json FROM psalms WHERE chapter = ?').get(chapter) as any;
  if (row) {
    return {
      chapter,
      verses: JSON.parse(row.verses_json)
    };
  }
  return null;
}

export async function getPsalm(chapter: number): Promise<PsalmChapter> {
  // Try cache first
  const cached = getCachedPsalm(chapter);
  if (cached) return cached;

  // Fetch from Sefaria
  const verses = await fetchChapterFromSefaria(chapter);
  const db = getDb();

  db.prepare('INSERT OR REPLACE INTO psalms (chapter, verses_json) VALUES (?, ?)')
    .run(chapter, JSON.stringify(verses));

  return { chapter, verses };
}

/**
 * Get all 150 psalms from cache
 */
export function getAllCachedPsalms(): PsalmChapter[] {
  const db = getDb();
  const rows = db.prepare('SELECT chapter, verses_json FROM psalms ORDER BY chapter').all() as any[];
  return rows.map(row => ({
    chapter: row.chapter,
    verses: JSON.parse(row.verses_json)
  }));
}

/**
 * Pre-fetch all 150 chapters in background
 */
export async function prefetchAllPsalms(): Promise<void> {
  const db = getDb();
  const count = (db.prepare('SELECT COUNT(*) as cnt FROM psalms').get() as any).cnt;

  if (count >= 150) {
    console.log('All 150 psalms already cached');
    return;
  }

  console.log(`Cached ${count}/150 psalms. Fetching remaining...`);

  for (let ch = 1; ch <= 150; ch++) {
    const exists = db.prepare('SELECT 1 FROM psalms WHERE chapter = ?').get(ch);
    if (exists) continue;

    try {
      await getPsalm(ch);
      console.log(`Fetched psalm ${ch}`);
      // Be nice to the API
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Failed to fetch psalm ${ch}:`, error);
    }
  }

  console.log('Psalm pre-fetch complete');
}
