import { Router, Request, Response } from 'express';

const router = Router();

// ============================================================================
// CURATED TRADITIONAL TEHILLIM CATEGORIES
// Based on established Jewish tradition and sources:
// - Tehillim Center, Hidabroot, Aish, traditional siddurim
// - Chapters may appear in multiple categories (this is intentional and good)
// ============================================================================

interface CuratedCategory {
  mood: string;
  emoji: string;
  description: string;
  chapters: number[];
}

const CURATED_CATEGORIES: CuratedCategory[] = [
  {
    mood: 'רפואה',
    emoji: '🏥',
    description: 'פרקים שנהוג לאמרם לרפואת חולים',
    chapters: [6, 9, 13, 16, 17, 20, 22, 23, 25, 30, 31, 32, 33, 37, 38, 41, 51, 55, 56, 69, 86, 88, 90, 91, 102, 103, 107, 116, 118, 119, 130, 142, 143],
  },
  {
    mood: 'פרנסה',
    emoji: '💰',
    description: 'פרקים לפרנסה טובה וכלכלה',
    chapters: [23, 34, 36, 62, 65, 67, 85, 104, 107, 111, 112, 121, 128, 136, 145, 146],
  },
  {
    mood: 'הצלחה',
    emoji: '⭐',
    description: 'פרקים להצלחה בכל מעשה ידיכם',
    chapters: [1, 8, 15, 19, 20, 23, 24, 32, 37, 65, 67, 90, 91, 101, 112, 119, 121, 128, 133],
  },
  {
    mood: 'שמירה',
    emoji: '🛡️',
    description: 'פרקים לשמירה והגנה מפני כל רע',
    chapters: [3, 7, 10, 13, 17, 20, 22, 31, 35, 46, 54, 59, 69, 70, 71, 83, 91, 104, 121, 124, 130, 142],
  },
  {
    mood: 'הודיה',
    emoji: '🙏',
    description: 'פרקים להודיה ושבח לבורא עולם',
    chapters: [8, 9, 18, 19, 29, 30, 33, 34, 47, 65, 66, 92, 95, 96, 97, 98, 100, 103, 104, 107, 111, 113, 117, 135, 136, 145, 146, 147, 148, 149, 150],
  },
  {
    mood: 'ביטחון ואמונה',
    emoji: '✨',
    description: 'פרקים לחיזוק הביטחון והאמונה בה׳',
    chapters: [4, 11, 16, 23, 25, 27, 31, 33, 37, 40, 46, 56, 62, 71, 73, 84, 91, 112, 115, 121, 125, 131, 146],
  },
  {
    mood: 'שמחה',
    emoji: '😊',
    description: 'פרקים לשמחה וששון',
    chapters: [16, 19, 30, 47, 65, 66, 67, 68, 92, 95, 96, 97, 98, 100, 104, 126, 133, 135, 145, 147, 148, 149, 150],
  },
  {
    mood: 'תשובה',
    emoji: '💔',
    description: 'פרקים לתשובה, חרטה וסליחה',
    chapters: [6, 25, 32, 38, 39, 40, 51, 69, 86, 90, 102, 103, 130, 143],
  },
  {
    mood: 'נחמה',
    emoji: '🕊️',
    description: 'פרקים לנחמה בעת צער ואבל',
    chapters: [16, 23, 27, 30, 31, 34, 42, 43, 46, 49, 71, 73, 77, 86, 90, 91, 102, 116, 121, 126, 130, 147],
  },
  {
    mood: 'שלום בית',
    emoji: '🏠',
    description: 'פרקים לשלום הבית והמשפחה',
    chapters: [15, 34, 37, 101, 112, 121, 127, 128, 133, 144, 145],
  },
  {
    mood: 'זיווג',
    emoji: '💑',
    description: 'פרקים למציאת זיווג הגון',
    chapters: [32, 38, 70, 71, 121, 124, 128, 130],
  },
  {
    mood: 'ישועה',
    emoji: '🌅',
    description: 'פרקים לישועה וגאולה בעת צרה',
    chapters: [3, 6, 13, 20, 22, 25, 27, 28, 31, 42, 43, 51, 69, 70, 77, 86, 88, 102, 107, 118, 121, 130, 137, 142, 143],
  },
  {
    mood: 'ילדים',
    emoji: '👶',
    description: 'פרקים לפריון ולשמירה על הילדים',
    chapters: [20, 23, 91, 102, 103, 107, 112, 113, 121, 127, 128, 130, 139],
  },
  {
    mood: 'שלום',
    emoji: '☮️',
    description: 'פרקים לשלום ואחדות',
    chapters: [29, 34, 85, 120, 121, 122, 125, 128, 133, 147],
  },
  {
    mood: 'תפילה',
    emoji: '🙌',
    description: 'פרקים שנהוג לאמרם כתפילה יומית',
    chapters: [5, 19, 20, 23, 24, 27, 51, 67, 86, 90, 91, 100, 121, 130, 145, 148, 150],
  },
];

// GET /api/moods — returns all curated categories with chapter lists
router.get('/', (_req: Request, res: Response) => {
  try {
    const moods = CURATED_CATEGORIES.map(cat => ({
      mood: cat.mood,
      emoji: cat.emoji,
      chapters: cat.chapters.map(ch => ({
        chapter: ch,
        summary: cat.description,
      })),
    }));

    res.json({ moods });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/moods/:mood — get chapters for a specific mood/category
router.get('/:mood', (req: Request, res: Response) => {
  try {
    const mood = decodeURIComponent(req.params.mood as string);

    const category = CURATED_CATEGORIES.find(c => c.mood === mood);

    if (!category) {
      res.json({
        mood,
        emoji: '📖',
        chapters: [],
        total: 0,
        description: '',
      });
      return;
    }

    // Return chapters with summary (description of the category)
    const chapters = category.chapters.map(ch => ({
      chapter: ch,
      summary: category.description,
    }));

    res.json({
      mood: category.mood,
      emoji: category.emoji,
      description: category.description,
      chapters,
      total: chapters.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
