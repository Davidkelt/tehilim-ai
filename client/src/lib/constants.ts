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
