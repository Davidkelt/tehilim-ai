import type { StreaksData } from './streaks';
import { loadStreaks } from './streaks';
import { getFavoriteChapters, getFavoriteVerses } from './favorites';

const ACHIEVEMENTS_KEY = 'tehillim-achievements';

export interface AchievementDef {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'first_read', icon: '📜', title: 'קורא ראשון', description: 'קראת פרק ראשון בתהילים' },
  { id: 'ten_chapters', icon: '📖', title: 'עשרה פרקים', description: 'קראת 10 פרקים' },
  { id: 'fifty_chapters', icon: '📚', title: 'חמישים פרקים', description: 'קראת 50 פרקים' },
  { id: 'five_books', icon: '🕮', title: 'חמשה חומשי תהילים', description: 'קראת מכל 5 ספרי התהילים' },
  { id: 'halfway', icon: '⛰️', title: 'חצי הדרך', description: 'קראת 75 פרקים שונים' },
  { id: 'completionist', icon: '🏆', title: 'השלמת הספר', description: 'קראת את כל 150 הפרקים!' },
  { id: 'night_reader', icon: '🌙', title: 'חובב לילה', description: 'קראת 3 פעמים במצב כהה' },
  { id: 'ai_researcher', icon: '🧠', title: 'חוקר AI', description: 'השתמשת בניתוח AI 5 פעמים' },
  { id: 'fav_keeper', icon: '⭐', title: 'שומר מועדפים', description: 'שמרת 10 פריטים במועדפים' },
  { id: 'sharer', icon: '📤', title: 'מפיץ תורה', description: 'שיתפת 5 פסוקים' },
  { id: 'searcher', icon: '🔍', title: 'חוקר הספר', description: 'חיפשת 10 פעמים בתהילים' },
  { id: 'streak_7', icon: '🔥', title: 'שבעת ימים', description: 'רצף קריאה של 7 ימים!' },
  { id: 'streak_30', icon: '🔥', title: 'חודש שלם', description: 'רצף קריאה של 30 יום!' },
  { id: 'streak_100', icon: '🌋', title: 'מאה ימים', description: 'רצף קריאה של 100 יום!' },
  { id: 'streak_365', icon: '👑', title: 'שנה תמימה', description: 'רצף קריאה של שנה שלמה!' },
];

export interface AchievementsData {
  unlocked: Record<string, string>; // id -> ISO date string
  analysisUsageCount: number;
  darkModeReadCount: number;
  shareCount: number;
  searchCount: number;
}

const defaultAchievements: AchievementsData = {
  unlocked: {},
  analysisUsageCount: 0,
  darkModeReadCount: 0,
  shareCount: 0,
  searchCount: 0,
};

export function loadAchievements(): AchievementsData {
  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (stored) {
      return { ...defaultAchievements, ...JSON.parse(stored) };
    }
  } catch {}
  return { ...defaultAchievements };
}

export function saveAchievements(data: AchievementsData): void {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(data));
}

export function incrementAnalysisUsage(): void {
  const data = loadAchievements();
  data.analysisUsageCount += 1;
  saveAchievements(data);
}

export function incrementDarkModeRead(): void {
  const data = loadAchievements();
  data.darkModeReadCount += 1;
  saveAchievements(data);
}

export function incrementShareCount(): void {
  const data = loadAchievements();
  data.shareCount += 1;
  saveAchievements(data);
}

export function incrementSearchCount(): void {
  const data = loadAchievements();
  data.searchCount += 1;
  saveAchievements(data);
}

/**
 * Check all achievement conditions and return newly unlocked IDs
 */
export function checkAndUnlockAchievements(): string[] {
  const streaks = loadStreaks();
  const achievements = loadAchievements();
  const favCount = getFavoriteChapters().length + getFavoriteVerses().length;

  const newlyUnlocked: string[] = [];

  const checks: Record<string, boolean> = {
    first_read: streaks.totalChaptersRead >= 1,
    ten_chapters: streaks.totalChaptersRead >= 10,
    fifty_chapters: streaks.totalChaptersRead >= 50,
    five_books: streaks.booksRead.length >= 5,
    halfway: streaks.uniqueChaptersRead.length >= 75,
    completionist: streaks.uniqueChaptersRead.length >= 150,
    night_reader: achievements.darkModeReadCount >= 3,
    ai_researcher: achievements.analysisUsageCount >= 5,
    fav_keeper: favCount >= 10,
    sharer: achievements.shareCount >= 5,
    searcher: achievements.searchCount >= 10,
    streak_7: streaks.longestStreak >= 7,
    streak_30: streaks.longestStreak >= 30,
    streak_100: streaks.longestStreak >= 100,
    streak_365: streaks.longestStreak >= 365,
  };

  for (const [id, condition] of Object.entries(checks)) {
    if (condition && !achievements.unlocked[id]) {
      achievements.unlocked[id] = new Date().toISOString();
      newlyUnlocked.push(id);
    }
  }

  if (newlyUnlocked.length > 0) {
    saveAchievements(achievements);
  }

  return newlyUnlocked;
}
