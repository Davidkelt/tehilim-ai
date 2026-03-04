import { Router, Request, Response } from 'express';
import { getPsalm } from '../services/sefaria.js';
import { generateAnalysis, getCachedAnalysis } from '../services/claude.js';

const router = Router();

// GET /api/analysis/:chapter?age_group=adults
router.get('/:chapter', async (req: Request, res: Response) => {
  try {
    const chapter = parseInt(req.params.chapter as string, 10);
    if (isNaN(chapter) || chapter < 1 || chapter > 150) {
      res.status(400).json({ error: 'Chapter must be between 1 and 150' });
      return;
    }

    const ageGroup = (req.query.age_group as string) || 'adults';
    const validAgeGroups = ['children', 'teens', 'adults', 'seniors'];
    if (!validAgeGroups.includes(ageGroup)) {
      res.status(400).json({ error: `age_group must be one of: ${validAgeGroups.join(', ')}` });
      return;
    }

    // Check cache first
    const cached = getCachedAnalysis(chapter, ageGroup);
    if (cached) {
      res.json({ chapter, age_group: ageGroup, analysis: cached, cached: true });
      return;
    }

    // Get psalm text
    const psalm = await getPsalm(chapter);

    // Generate analysis
    const analysis = await generateAnalysis(chapter, psalm.verses, ageGroup);

    res.json({ chapter, age_group: ageGroup, analysis, cached: false });
  } catch (error: any) {
    console.error(`Analysis error for chapter ${req.params.chapter}:`, error);
    res.status(500).json({ error: 'שגיאה בניתוח הפרק. נסה שוב מאוחר יותר.' });
  }
});

export default router;
