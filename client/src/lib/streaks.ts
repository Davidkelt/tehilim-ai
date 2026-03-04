import { TEHILLIM_BOOKS } from './constants';

const STREAKS_KEY = 'tehillim-streaks';

export interface StreaksData {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null; // "YYYY-MM-DD"
  chaptersReadToday: number[];
  totalChaptersRead: number;
  uniqueChaptersRead: number[];
  readingLog: Record<string, number[]>; // "YYYY-MM-DD" -> chapters
  booksRead: number[]; // indices 0-4
}

const defaultStreaks: StreaksData = {
  currentStreak: 0,
  longestStreak: 0,
  lastReadDate: null,
  chaptersReadToday: [],
  totalChaptersRead: 0,
  uniqueChaptersRead: [],
  readingLog: {},
  booksRead: [],
};

export function getToday(): string {
  return new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD"
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('en-CA');
}

export function getBookIndex(chapter: number): number {
  for (let i = 0; i < TEHILLIM_BOOKS.length; i++) {
    if (chapter >= TEHILLIM_BOOKS[i].range[0] && chapter <= TEHILLIM_BOOKS[i].range[1]) {
      return i;
    }
  }
  return 0;
}

export function loadStreaks(): StreaksData {
  try {
    const stored = localStorage.getItem(STREAKS_KEY);
    if (stored) {
      return { ...defaultStreaks, ...JSON.parse(stored) };
    }
  } catch {}
  return { ...defaultStreaks };
}

export function saveStreaks(data: StreaksData): void {
  // Prune reading log older than 365 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 365);
  const cutoffStr = cutoff.toLocaleDateString('en-CA');
  const pruned: Record<string, number[]> = {};
  for (const [date, chapters] of Object.entries(data.readingLog)) {
    if (date >= cutoffStr) {
      pruned[date] = chapters;
    }
  }
  data.readingLog = pruned;
  localStorage.setItem(STREAKS_KEY, JSON.stringify(data));
}

export interface ReadResult {
  isNewDay: boolean;
  isNewStreak: boolean;
  isMilestone: boolean;
  milestoneDay: number;
  isNewChapter: boolean;
}

export function recordRead(chapter: number): ReadResult {
  const data = loadStreaks();
  const today = getToday();
  const yesterday = getYesterday();

  const result: ReadResult = {
    isNewDay: false,
    isNewStreak: false,
    isMilestone: false,
    milestoneDay: 0,
    isNewChapter: false,
  };

  // Check if already read today
  if (data.lastReadDate === today) {
    // Same day — just add chapter if not already tracked today
    if (!data.chaptersReadToday.includes(chapter)) {
      data.chaptersReadToday.push(chapter);
    }
  } else if (data.lastReadDate === yesterday) {
    // Streak continues
    data.currentStreak += 1;
    result.isNewDay = true;
    result.isNewStreak = true;
    data.chaptersReadToday = [chapter];
    data.lastReadDate = today;

    // Check milestones
    const milestones = [7, 30, 100, 365];
    for (const m of milestones) {
      if (data.currentStreak === m) {
        result.isMilestone = true;
        result.milestoneDay = m;
        break;
      }
    }
  } else {
    // Streak broken or first read
    result.isNewDay = true;
    if (data.lastReadDate === null) {
      result.isNewStreak = true;
    }
    data.currentStreak = 1;
    data.chaptersReadToday = [chapter];
    data.lastReadDate = today;
  }

  // Update longest
  data.longestStreak = Math.max(data.longestStreak, data.currentStreak);

  // Total chapters
  data.totalChaptersRead += 1;

  // Unique chapters
  if (!data.uniqueChaptersRead.includes(chapter)) {
    data.uniqueChaptersRead.push(chapter);
    result.isNewChapter = true;
  }

  // Reading log
  if (!data.readingLog[today]) {
    data.readingLog[today] = [];
  }
  if (!data.readingLog[today].includes(chapter)) {
    data.readingLog[today].push(chapter);
  }

  // Book tracking
  const bookIdx = getBookIndex(chapter);
  if (!data.booksRead.includes(bookIdx)) {
    data.booksRead.push(bookIdx);
  }

  saveStreaks(data);
  return result;
}
