import { Router, Request, Response } from 'express';
import { getAllCachedPsalms } from '../services/sefaria.js';

const router = Router();

// Strip nikud (Hebrew vowel marks) for search matching
function stripNikud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '');
}

// GET /api/search?q=keyword
router.get('/', (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string || '').trim().substring(0, 200);
    if (!query) {
      res.status(400).json({ error: 'Query parameter q is required' });
      return;
    }

    const psalms = getAllCachedPsalms();

    if (psalms.length === 0) {
      res.json({ results: [], message: 'Psalms not yet cached. Please wait for initial fetch.' });
      return;
    }

    // Search by chapter number
    const chapterNum = parseInt(query, 10);
    if (!isNaN(chapterNum) && chapterNum >= 1 && chapterNum <= 150) {
      const psalm = psalms.find(p => p.chapter === chapterNum);
      if (psalm) {
        res.json({
          results: [{
            chapter: psalm.chapter,
            matches: psalm.verses.map(v => ({
              verse: v.verse,
              text: v.text
            }))
          }]
        });
        return;
      }
    }

    // Search by Hebrew keyword — strip nikud from both query and stored text
    const queryNormalized = stripNikud(query);

    const results: Array<{
      chapter: number;
      matches: Array<{ verse: number; text: string }>;
    }> = [];

    for (const psalm of psalms) {
      const matches = psalm.verses.filter(v =>
        stripNikud(v.text).includes(queryNormalized)
      );
      if (matches.length > 0) {
        results.push({
          chapter: psalm.chapter,
          matches: matches.map(v => ({ verse: v.verse, text: v.text }))
        });
      }
    }

    res.json({ results, query });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'שגיאה בחיפוש' });
  }
});

export default router;
