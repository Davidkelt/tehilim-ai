import { Router, Request, Response } from 'express';
import { getPsalm } from '../services/sefaria.js';

const router = Router();

// Traditional monthly Tehillim division (30 days)
const DAILY_CHAPTERS: number[][] = [
  [1, 2, 3, 4, 5, 6],          // Day 1
  [7, 8, 9],                     // Day 2
  [10, 11, 12, 13, 14, 15, 16, 17], // Day 3
  [18, 19, 20, 21, 22],          // Day 4
  [23, 24, 25, 26, 27, 28, 29],  // Day 5
  [30, 31, 32, 33, 34],          // Day 6
  [35, 36, 37, 38],              // Day 7
  [39, 40, 41, 42, 43],          // Day 8
  [44, 45, 46, 47, 48],          // Day 9
  [49, 50, 51, 52, 53, 54],      // Day 10
  [55, 56, 57, 58, 59],          // Day 11
  [60, 61, 62, 63, 64, 65],      // Day 12
  [66, 67, 68],                   // Day 13
  [69, 70, 71],                   // Day 14
  [72, 73, 74, 75, 76],          // Day 15
  [77, 78],                       // Day 16
  [79, 80, 81, 82],              // Day 17
  [83, 84, 85, 86, 87],          // Day 18
  [88, 89],                       // Day 19
  [90, 91, 92, 93, 94, 95, 96],  // Day 20
  [97, 98, 99, 100, 101, 102, 103], // Day 21
  [104],                          // Day 22
  [105, 106, 107],                // Day 23
  [108, 109, 110, 111, 112],     // Day 24
  [113, 114, 115, 116, 117, 118], // Day 25
  [119],                          // Day 26
  [120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134], // Day 27
  [135, 136, 137, 138, 139],     // Day 28
  [140, 141, 142, 143, 144],     // Day 29
  [145, 146, 147, 148, 149, 150], // Day 30
];

// ============================================================================
// Hebrew calendar — Dershowitz-Reingold algorithm
// Reference: "Calendrical Calculations" by Nachum Dershowitz and Edward Reingold
// ============================================================================

const HEBREW_EPOCH = 347995.5; // Julian Day of 1 Tishrei 1 AM

function mod(a: number, b: number): number {
  return a - b * Math.floor(a / b);
}

function hebrewLeapYear(year: number): boolean {
  return mod(7 * year + 1, 19) < 7;
}

function hebrewMonthsInYear(year: number): number {
  return hebrewLeapYear(year) ? 13 : 12;
}

function hebrewDelay1(year: number): number {
  const months = Math.floor((235 * year - 234) / 19);
  const parts = 12084 + 13753 * months;
  let day = months * 29 + Math.floor(parts / 25920);
  if (mod(3 * (day + 1), 7) < 3) {
    day++;
  }
  return day;
}

function hebrewDelay2(year: number): number {
  const last = hebrewDelay1(year - 1);
  const present = hebrewDelay1(year);
  const next = hebrewDelay1(year + 1);

  if (next - present === 356) return 2;
  if (present - last === 382) return 1;
  return 0;
}

function hebrewYearDays(year: number): number {
  return hebrewToJD(year + 1, 7, 1) - hebrewToJD(year, 7, 1);
}

function hebrewMonthDays(year: number, month: number): number {
  // 29-day months: 2(Iyyar), 4(Tammuz), 6(Elul), 10(Tevet), 13(Adar II)
  if ([2, 4, 6, 10, 13].includes(month)) return 29;
  // Cheshvan (8): 29 normally, 30 in complete years
  if (month === 8 && hebrewYearDays(year) % 10 !== 5) return 29;
  // Kislev (9): 30 normally, 29 in deficient years
  if (month === 9 && hebrewYearDays(year) % 10 === 3) return 29;
  // Adar (12): 29 in non-leap years
  if (month === 12 && !hebrewLeapYear(year)) return 29;
  // All others: 30
  return 30;
}

function hebrewToJD(year: number, month: number, day: number): number {
  let jd = HEBREW_EPOCH + hebrewDelay1(year) + hebrewDelay2(year) + day + 1;

  if (month < 7) {
    // Months after Tishrei in civil order
    for (let m = 7; m <= hebrewMonthsInYear(year); m++) {
      jd += hebrewMonthDays(year, m);
    }
    for (let m = 1; m < month; m++) {
      jd += hebrewMonthDays(year, m);
    }
  } else {
    for (let m = 7; m < month; m++) {
      jd += hebrewMonthDays(year, m);
    }
  }

  return jd;
}

function gregorianToJD(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045.5;
}

function jdToHebrew(jd: number): { year: number; month: number; day: number } {
  jd = Math.floor(jd) + 0.5;
  const count = Math.floor((jd - HEBREW_EPOCH) * 98496 / 35975351);
  let year = count - 1;

  // Find correct year
  while (jd >= hebrewToJD(year + 1, 7, 1)) {
    year++;
  }

  // Find correct month
  let month: number;
  if (jd < hebrewToJD(year, 1, 1)) {
    month = 7;
    while (jd > hebrewToJD(year, month, hebrewMonthDays(year, month))) {
      month++;
    }
  } else {
    month = 1;
    while (jd > hebrewToJD(year, month, hebrewMonthDays(year, month))) {
      month++;
    }
  }

  const day = Math.floor(jd - hebrewToJD(year, month, 1)) + 1;
  return { year, month, day };
}

const MONTH_NAMES: Record<number, string> = {
  1: 'ניסן',
  2: 'אייר',
  3: 'סיון',
  4: 'תמוז',
  5: 'אב',
  6: 'אלול',
  7: 'תשרי',
  8: 'חשון',
  9: 'כסלו',
  10: 'טבת',
  11: 'שבט',
  12: 'אדר',
  13: 'אדר ב׳',
};

function toHebrewNumeral(num: number): string {
  const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const tens = ['', 'י', 'כ', 'ל'];

  if (num === 15) return 'ט״ו';
  if (num === 16) return 'ט״ז';

  const t = Math.floor(num / 10);
  const o = num % 10;
  const letters = (tens[t] || '') + (ones[o] || '');

  if (letters.length === 0) return '';
  if (letters.length === 1) return letters + '׳';
  return letters.slice(0, -1) + '״' + letters.slice(-1);
}

function getHebrewDateInfo() {
  const now = new Date();
  const gYear = now.getFullYear();
  const gMonth = now.getMonth() + 1;
  const gDay = now.getDate();

  const jd = gregorianToJD(gYear, gMonth, gDay);
  const heb = jdToHebrew(jd);

  let monthName: string;
  if (heb.month === 12 && hebrewLeapYear(heb.year)) {
    monthName = 'אדר א׳';
  } else {
    monthName = MONTH_NAMES[heb.month] || '';
  }

  return {
    day: heb.day,
    dayHebrew: toHebrewNumeral(heb.day),
    monthName,
    year: heb.year,
  };
}

// GET /api/daily — Today's psalm(s)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const hebrewDate = getHebrewDateInfo();
    const dayOfMonth = hebrewDate.day;
    const dayIndex = Math.min(dayOfMonth - 1, 29); // 0-based, max 29
    const chapters = DAILY_CHAPTERS[dayIndex];

    // Get the primary chapter (first one)
    const primaryChapter = chapters[0];
    const psalm = await getPsalm(primaryChapter);

    // Pick a highlighted verse (roughly middle of the psalm)
    const highlightIndex = Math.floor(psalm.verses.length / 3);
    const highlightedVerse = psalm.verses[highlightIndex];

    res.json({
      day_of_month: dayOfMonth,
      day_of_month_hebrew: hebrewDate.dayHebrew,
      month_name: hebrewDate.monthName,
      chapters,
      primary_chapter: primaryChapter,
      psalm,
      highlighted_verse: highlightedVerse,
    });
  } catch (error: any) {
    console.error('Daily route error:', error);
    res.status(500).json({ error: 'שגיאה בטעינת הפרק היומי' });
  }
});

export default router;
