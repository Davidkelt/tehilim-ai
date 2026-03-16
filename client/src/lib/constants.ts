// Hebrew numeral conversion
const ONES = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
const TENS = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
const HUNDREDS = ['', 'ק', 'ר', 'ש', 'ת'];

export function toHebrewNumeral(num: number): string {
  if (num === 15) return 'ט״ו';
  if (num === 16) return 'ט״ז';

  let result = '';

  if (num >= 100) {
    const h = Math.floor(num / 100);
    result += HUNDREDS[h] || '';
    num %= 100;
  }

  if (num >= 10) {
    const t = Math.floor(num / 10);
    result += TENS[t] || '';
    num %= 10;
  }

  if (num > 0) {
    result += ONES[num];
  }

  // Add gershayim (״) before last character
  if (result.length > 1) {
    result = result.slice(0, -1) + '״' + result.slice(-1);
  } else if (result.length === 1) {
    result += '׳';
  }

  return result;
}

// Five books of Tehillim
export const TEHILLIM_BOOKS = [
  { name: 'ספר ראשון', range: [1, 41] as const, label: 'א׳-מ״א' },
  { name: 'ספר שני', range: [42, 72] as const, label: 'מ״ב-ע״ב' },
  { name: 'ספר שלישי', range: [73, 89] as const, label: 'ע״ג-פ״ט' },
  { name: 'ספר רביעי', range: [90, 106] as const, label: 'צ׳-ק״ו' },
  { name: 'ספר חמישי', range: [107, 150] as const, label: 'ק״ז-ק״נ' },
];

// Weekly Tehillim division — complete all 150 in 7 days (Sunday–Shabbat)
export const WEEKLY_DIVISIONS = [
  { name: 'יום ראשון', chapters: Array.from({ length: 29 }, (_, i) => i + 1) },       // 1–29
  { name: 'יום שני', chapters: Array.from({ length: 21 }, (_, i) => i + 30) },         // 30–50
  { name: 'יום שלישי', chapters: Array.from({ length: 22 }, (_, i) => i + 51) },       // 51–72
  { name: 'יום רביעי', chapters: Array.from({ length: 17 }, (_, i) => i + 73) },       // 73–89
  { name: 'יום חמישי', chapters: Array.from({ length: 17 }, (_, i) => i + 90) },       // 90–106
  { name: 'יום שישי', chapters: Array.from({ length: 13 }, (_, i) => i + 107) },       // 107–119
  { name: 'שבת', chapters: Array.from({ length: 31 }, (_, i) => i + 120) },             // 120–150
];

// Monthly Tehillim division — complete all 150 in 30 days (Hebrew month)
export const MONTHLY_DIVISIONS = [
  { name: 'יום א׳', chapters: [1, 2, 3, 4, 5, 6] },
  { name: 'יום ב׳', chapters: [7, 8, 9] },
  { name: 'יום ג׳', chapters: [10, 11, 12, 13, 14, 15, 16, 17] },
  { name: 'יום ד׳', chapters: [18, 19, 20, 21, 22] },
  { name: 'יום ה׳', chapters: [23, 24, 25, 26, 27, 28, 29] },
  { name: 'יום ו׳', chapters: [30, 31, 32, 33, 34] },
  { name: 'יום ז׳', chapters: [35, 36, 37, 38] },
  { name: 'יום ח׳', chapters: [39, 40, 41, 42, 43] },
  { name: 'יום ט׳', chapters: [44, 45, 46, 47, 48] },
  { name: 'יום י׳', chapters: [49, 50, 51, 52, 53, 54] },
  { name: 'יום י״א', chapters: [55, 56, 57, 58, 59] },
  { name: 'יום י״ב', chapters: [60, 61, 62, 63, 64, 65] },
  { name: 'יום י״ג', chapters: [66, 67, 68] },
  { name: 'יום י״ד', chapters: [69, 70, 71] },
  { name: 'יום ט״ו', chapters: [72, 73, 74, 75, 76] },
  { name: 'יום ט״ז', chapters: [77, 78] },
  { name: 'יום י״ז', chapters: [79, 80, 81, 82] },
  { name: 'יום י״ח', chapters: [83, 84, 85, 86, 87] },
  { name: 'יום י״ט', chapters: [88, 89] },
  { name: 'יום כ׳', chapters: [90, 91, 92, 93, 94, 95, 96] },
  { name: 'יום כ״א', chapters: [97, 98, 99, 100, 101, 102, 103] },
  { name: 'יום כ״ב', chapters: [104] },
  { name: 'יום כ״ג', chapters: [105, 106, 107] },
  { name: 'יום כ״ד', chapters: [108, 109, 110, 111, 112] },
  { name: 'יום כ״ה', chapters: [113, 114, 115, 116, 117, 118] },
  { name: 'יום כ״ו', chapters: [119] },
  { name: 'יום כ״ז', chapters: [120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134] },
  { name: 'יום כ״ח', chapters: [135, 136, 137, 138, 139] },
  { name: 'יום כ״ט', chapters: [140, 141, 142, 143, 144] },
  { name: 'יום ל׳', chapters: [145, 146, 147, 148, 149, 150] },
];

export type ViewMode = 'books' | 'weekly' | 'monthly';

export type AgeGroup = 'children' | 'teens' | 'adults' | 'seniors';

export const AGE_GROUPS: { value: AgeGroup; label: string; desc: string }[] = [
  { value: 'children', label: 'ילדים', desc: '8-12' },
  { value: 'teens', label: 'נוער', desc: '13-18' },
  { value: 'adults', label: 'מבוגרים', desc: '19-45' },
  { value: 'seniors', label: 'בוגרים', desc: '45+' },
];

export const EMOTIONAL_TONES: Record<string, string> = {
  'תקווה': '🌅',
  'תפילה': '🙏',
  'הודיה': '💛',
  'צער': '😢',
  'אמונה': '✨',
  'גבורה': '💪',
  'ענווה': '🕊️',
  'שמחה': '😊',
  'חרטה': '💔',
  'ביטחון': '🛡️',
};

// Strip nikud (vowel marks) from Hebrew text
export function stripNikud(text: string): string {
  // Unicode range for Hebrew nikud: 0x0591-0x05C7
  return text.replace(/[\u0591-\u05C7]/g, '');
}
