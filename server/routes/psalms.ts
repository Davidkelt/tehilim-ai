import { Router, Request, Response } from 'express';
import { getPsalm, getAllCachedPsalms } from '../services/sefaria.js';

const router = Router();

// GET /api/psalms — All 150 chapters (summaries)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const psalms = getAllCachedPsalms();

    if (psalms.length === 0) {
      // If nothing cached yet, try to fetch chapter 1 at least
      try {
        const first = await getPsalm(1);
        res.json({ psalms: [first], total: 150, cached: 1 });
        return;
      } catch {
        res.json({ psalms: [], total: 150, cached: 0 });
        return;
      }
    }

    res.json({ psalms, total: 150, cached: psalms.length });
  } catch (error: any) {
    console.error('Psalms error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת הפרקים' });
  }
});

// GET /api/psalms/:chapter — Single chapter
router.get('/:chapter', async (req: Request, res: Response) => {
  try {
    const chapter = parseInt(req.params.chapter as string, 10);
    if (isNaN(chapter) || chapter < 1 || chapter > 150) {
      res.status(400).json({ error: 'Chapter must be between 1 and 150' });
      return;
    }

    const psalm = await getPsalm(chapter);
    res.json(psalm);
  } catch (error: any) {
    console.error('Psalms error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת הפרקים' });
  }
});

export default router;
