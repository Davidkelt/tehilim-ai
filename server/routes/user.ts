import { Router, Response } from 'express';
import { getDb } from '../db/database.js';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware as any);

// POST /api/user/sync — Sync user data between client and server
router.post('/sync', (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.uid!;
    const { streaks, favorites, settings, achievements } = req.body;
    const db = getDb();

    // Get existing server data
    const existingRow = db.prepare(
      'SELECT * FROM user_data WHERE uid = ?'
    ).get(uid) as any;

    if (!existingRow) {
      // First sync — save client data to server
      db.prepare(
        `INSERT INTO user_data (uid, email, streaks_json, favorites_json, settings_json, achievements_json)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        uid,
        req.userEmail || '',
        streaks ? JSON.stringify(streaks) : null,
        favorites ? JSON.stringify(favorites) : null,
        settings ? JSON.stringify(settings) : null,
        achievements ? JSON.stringify(achievements) : null,
      );

      res.json({
        status: 'created',
        streaks,
        favorites,
        settings,
        achievements,
      });
      return;
    }

    // Merge strategy: prefer data with more progress
    const serverStreaks = existingRow.streaks_json ? JSON.parse(existingRow.streaks_json) : null;
    const serverFavorites = existingRow.favorites_json ? JSON.parse(existingRow.favorites_json) : null;
    const serverSettings = existingRow.settings_json ? JSON.parse(existingRow.settings_json) : null;
    const serverAchievements = existingRow.achievements_json ? JSON.parse(existingRow.achievements_json) : null;

    // Merge streaks: keep the one with more total chapters read
    const mergedStreaks = mergeStreaks(serverStreaks, streaks);
    const mergedFavorites = mergeFavorites(serverFavorites, favorites);
    const mergedSettings = settings || serverSettings;
    const mergedAchievements = mergeAchievements(serverAchievements, achievements);

    // Update server with merged data
    db.prepare(
      `UPDATE user_data SET
        email = ?,
        streaks_json = ?,
        favorites_json = ?,
        settings_json = ?,
        achievements_json = ?,
        updated_at = datetime('now')
       WHERE uid = ?`
    ).run(
      req.userEmail || existingRow.email,
      mergedStreaks ? JSON.stringify(mergedStreaks) : existingRow.streaks_json,
      mergedFavorites ? JSON.stringify(mergedFavorites) : existingRow.favorites_json,
      mergedSettings ? JSON.stringify(mergedSettings) : existingRow.settings_json,
      mergedAchievements ? JSON.stringify(mergedAchievements) : existingRow.achievements_json,
      uid,
    );

    res.json({
      status: 'synced',
      streaks: mergedStreaks || serverStreaks,
      favorites: mergedFavorites || serverFavorites,
      settings: mergedSettings || serverSettings,
      achievements: mergedAchievements || serverAchievements,
    });
  } catch (error: any) {
    console.error('User sync error:', error);
    res.status(500).json({ error: 'שגיאה בסנכרון הנתונים' });
  }
});

// GET /api/user/data — Get user data from server
router.get('/data', (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.uid!;
    const db = getDb();

    const row = db.prepare(
      'SELECT * FROM user_data WHERE uid = ?'
    ).get(uid) as any;

    if (!row) {
      res.json({
        streaks: null,
        favorites: null,
        settings: null,
        achievements: null,
      });
      return;
    }

    res.json({
      streaks: row.streaks_json ? JSON.parse(row.streaks_json) : null,
      favorites: row.favorites_json ? JSON.parse(row.favorites_json) : null,
      settings: row.settings_json ? JSON.parse(row.settings_json) : null,
      achievements: row.achievements_json ? JSON.parse(row.achievements_json) : null,
    });
  } catch (error: any) {
    console.error('User data fetch error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת הנתונים' });
  }
});

// Merge helpers

function mergeStreaks(server: any, client: any): any {
  if (!server) return client;
  if (!client) return server;

  // Keep whichever has more progress
  const merged = { ...server };

  // Keep highest values
  merged.totalChaptersRead = Math.max(server.totalChaptersRead || 0, client.totalChaptersRead || 0);
  merged.longestStreak = Math.max(server.longestStreak || 0, client.longestStreak || 0);
  merged.currentStreak = Math.max(server.currentStreak || 0, client.currentStreak || 0);

  // Merge unique chapters (union)
  const uniqueSet = new Set([
    ...(server.uniqueChaptersRead || []),
    ...(client.uniqueChaptersRead || []),
  ]);
  merged.uniqueChaptersRead = Array.from(uniqueSet);

  // Merge books read (union)
  const booksSet = new Set([
    ...(server.booksRead || []),
    ...(client.booksRead || []),
  ]);
  merged.booksRead = Array.from(booksSet);

  // Merge reading log (union of dates, union of chapters per date)
  const serverLog = server.readingLog || {};
  const clientLog = client.readingLog || {};
  const mergedLog: Record<string, number[]> = { ...serverLog };
  for (const [date, chapters] of Object.entries(clientLog)) {
    if (!mergedLog[date]) {
      mergedLog[date] = chapters as number[];
    } else {
      const chapSet = new Set([...mergedLog[date], ...(chapters as number[])]);
      mergedLog[date] = Array.from(chapSet);
    }
  }
  merged.readingLog = mergedLog;

  // Keep most recent lastReadDate
  if (client.lastReadDate && (!server.lastReadDate || client.lastReadDate > server.lastReadDate)) {
    merged.lastReadDate = client.lastReadDate;
    merged.chaptersReadToday = client.chaptersReadToday || [];
  }

  return merged;
}

function mergeFavorites(server: any, client: any): any {
  if (!server) return client;
  if (!client) return server;

  // Merge chapter favorites (union)
  const chapters = Array.from(new Set([
    ...(server.chapters || []),
    ...(client.chapters || []),
  ]));

  // Merge verse favorites (union by key)
  const serverVerses = server.verses || [];
  const clientVerses = client.verses || [];
  const verseMap = new Map<string, any>();
  for (const v of serverVerses) {
    verseMap.set(`${v.chapter}:${v.verse}`, v);
  }
  for (const v of clientVerses) {
    verseMap.set(`${v.chapter}:${v.verse}`, v);
  }

  return {
    chapters,
    verses: Array.from(verseMap.values()),
  };
}

function mergeAchievements(server: any, client: any): any {
  if (!server) return client;
  if (!client) return server;

  // Union of unlocked achievements (keep earliest unlock date)
  const serverUnlocked = server.unlocked || {};
  const clientUnlocked = client.unlocked || {};
  const merged: Record<string, string> = { ...serverUnlocked };

  for (const [key, date] of Object.entries(clientUnlocked)) {
    if (!merged[key] || (date as string) < merged[key]) {
      merged[key] = date as string;
    }
  }

  return {
    ...server,
    ...client,
    unlocked: merged,
    darkModeReadCount: Math.max(server.darkModeReadCount || 0, client.darkModeReadCount || 0),
  };
}

export default router;
