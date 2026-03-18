import { Router } from 'express';
import { nanoid } from 'nanoid';
import { getDb } from '../db/database.js';

const router = Router();

const OCCASION_MAP: Record<string, { prefix: string; parentLabel: 'mother' | 'father' | null }> = {
  refua: { prefix: 'לרפואת', parentLabel: 'mother' },
  ilui_nishmat: { prefix: 'לעילוי נשמת', parentLabel: 'father' },
  hatzlacha: { prefix: 'להצלחת', parentLabel: 'mother' },
  zivug: { prefix: 'לזיווג', parentLabel: 'mother' },
  shmira: { prefix: 'לשמירת', parentLabel: 'mother' },
  parnasa: { prefix: 'לפרנסת', parentLabel: 'mother' },
  hodaya: { prefix: 'הודיה על', parentLabel: null },
};

function composeDedicationText(
  occasionType: string,
  name: string,
  parentName: string | null,
  gender: string,
): string {
  const occasion = OCCASION_MAP[occasionType];
  if (!occasion) return name;

  if (!occasion.parentLabel || !parentName) {
    return `${occasion.prefix} ${name}`;
  }

  const connector = gender === 'female' ? 'בת' : 'בן';
  return `${occasion.prefix} ${name} ${connector} ${parentName}`;
}

// POST /api/dedications — create event
router.post('/', (req, res) => {
  try {
    const { occasion_type, name, parent_name, gender, creator_name } = req.body;

    if (!occasion_type || !name || !OCCASION_MAP[occasion_type]) {
      res.status(400).json({ error: 'occasion_type ו-name נדרשים' });
      return;
    }

    const g = gender === 'female' ? 'female' : 'male';
    const dedicationText = composeDedicationText(occasion_type, name, parent_name || null, g);
    const id = nanoid(8);

    const db = getDb();
    db.prepare(`
      INSERT INTO dedication_events (id, occasion_type, name, parent_name, gender, dedication_text, creator_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, occasion_type, name, parent_name || null, g, dedicationText, creator_name || null);

    res.json({ id, dedication_text: dedicationText });
  } catch (err) {
    console.error('[Dedications] Create error:', err);
    res.status(500).json({ error: 'שגיאה ביצירת האירוע' });
  }
});

// GET /api/dedications/:id — get event + chapter statuses
router.get('/:id', (req, res) => {
  try {
    const id = req.params.id as string;
    const db = getDb();

    const event = db.prepare('SELECT * FROM dedication_events WHERE id = ?').get(id) as any;
    if (!event) {
      res.status(404).json({ error: 'אירוע לא נמצא' });
      return;
    }

    const claims = db.prepare(
      'SELECT chapter, participant_name, participant_id, status FROM dedication_claims WHERE event_id = ?'
    ).all(id) as any[];

    const chapters: Record<number, { status: string; participant_name: string | null; participant_id: string }> = {};
    for (const c of claims) {
      chapters[c.chapter] = {
        status: c.status,
        participant_name: c.participant_name,
        participant_id: c.participant_id,
      };
    }

    res.json({ event, chapters });
  } catch (err) {
    console.error('[Dedications] Get error:', err);
    res.status(500).json({ error: 'שגיאה בטעינת האירוע' });
  }
});

// POST /api/dedications/:id/claim — claim next available chapter
router.post('/:id/claim', (req, res) => {
  try {
    const id = req.params.id as string;
    const { participant_id, participant_name } = req.body;

    if (!participant_id) {
      res.status(400).json({ error: 'participant_id נדרש' });
      return;
    }

    const db = getDb();

    const event = db.prepare('SELECT * FROM dedication_events WHERE id = ?').get(id) as any;
    if (!event) {
      res.status(404).json({ error: 'אירוע לא נמצא' });
      return;
    }
    if (event.is_completed) {
      res.status(400).json({ error: 'כל הפרקים כבר הושלמו!' });
      return;
    }

    // Find next available chapter in a transaction
    const result = db.transaction(() => {
      const claimed = db.prepare(
        'SELECT chapter FROM dedication_claims WHERE event_id = ?'
      ).all(id) as any[];
      const claimedSet = new Set(claimed.map((c: any) => c.chapter));

      let nextChapter: number | null = null;
      for (let ch = 1; ch <= 150; ch++) {
        if (!claimedSet.has(ch)) {
          nextChapter = ch;
          break;
        }
      }

      if (nextChapter === null) {
        return null;
      }

      db.prepare(`
        INSERT INTO dedication_claims (event_id, chapter, participant_name, participant_id, status)
        VALUES (?, ?, ?, ?, 'claimed')
      `).run(id, nextChapter, participant_name || null, participant_id);

      // Update participant count
      const uniqueParticipants = db.prepare(
        'SELECT COUNT(DISTINCT participant_id) as count FROM dedication_claims WHERE event_id = ?'
      ).get(id) as any;

      db.prepare('UPDATE dedication_events SET participant_count = ? WHERE id = ?')
        .run(uniqueParticipants.count, id);

      return nextChapter;
    })();

    if (result === null) {
      res.status(400).json({ error: 'אין פרקים פנויים' });
      return;
    }

    res.json({ chapter: result });
  } catch (err) {
    console.error('[Dedications] Claim error:', err);
    res.status(500).json({ error: 'שגיאה בלקיחת פרק' });
  }
});

// PUT /api/dedications/:id/chapters/:ch/complete — mark chapter done
router.put('/:id/chapters/:ch/complete', (req, res) => {
  try {
    const id = req.params.id as string;
    const ch = parseInt(req.params.ch as string, 10);
    const { participant_id } = req.body;

    if (!participant_id) {
      res.status(400).json({ error: 'participant_id נדרש' });
      return;
    }

    const db = getDb();

    const claim = db.prepare(
      'SELECT * FROM dedication_claims WHERE event_id = ? AND chapter = ? AND participant_id = ?'
    ).get(id, ch, participant_id) as any;

    if (!claim) {
      res.status(404).json({ error: 'לא נמצאה הקצאה לפרק זה' });
      return;
    }

    db.transaction(() => {
      db.prepare(`
        UPDATE dedication_claims SET status = 'completed', completed_at = datetime('now')
        WHERE event_id = ? AND chapter = ? AND participant_id = ?
      `).run(id, ch, participant_id);

      const completedCount = db.prepare(
        "SELECT COUNT(*) as count FROM dedication_claims WHERE event_id = ? AND status = 'completed'"
      ).get(id) as any;

      const isCompleted = completedCount.count >= 150 ? 1 : 0;

      db.prepare(`
        UPDATE dedication_events
        SET completed_chapters = ?, is_completed = ?, completed_at = CASE WHEN ? = 1 THEN datetime('now') ELSE completed_at END
        WHERE id = ?
      `).run(completedCount.count, isCompleted, isCompleted, id);
    })();

    const event = db.prepare('SELECT completed_chapters, participant_count, is_completed FROM dedication_events WHERE id = ?').get(id) as any;

    res.json({
      completed_chapters: event.completed_chapters,
      participant_count: event.participant_count,
      is_completed: !!event.is_completed,
    });
  } catch (err) {
    console.error('[Dedications] Complete error:', err);
    res.status(500).json({ error: 'שגיאה בסימון הפרק' });
  }
});

// GET /api/dedications/:id/progress — lightweight polling
router.get('/:id/progress', (req, res) => {
  try {
    const id = req.params.id as string;
    const db = getDb();

    const event = db.prepare(
      'SELECT completed_chapters, participant_count, is_completed FROM dedication_events WHERE id = ?'
    ).get(id) as any;

    if (!event) {
      res.status(404).json({ error: 'אירוע לא נמצא' });
      return;
    }

    res.json({
      completed_chapters: event.completed_chapters,
      participant_count: event.participant_count,
      is_completed: !!event.is_completed,
    });
  } catch (err) {
    console.error('[Dedications] Progress error:', err);
    res.status(500).json({ error: 'שגיאה' });
  }
});

export default router;
