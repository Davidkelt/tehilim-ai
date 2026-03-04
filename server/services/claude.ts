import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '../db/database.js';
import type { PsalmVerse } from './sefaria.js';

const AGE_GROUP_DESCRIPTIONS: Record<string, string> = {
  children: 'ילדים בגילאי 8-12. השתמש בשפה פשוטה וברורה, דוגמאות מעולם בית הספר, חברים ומשפחה. הימנע ממושגים מופשטים מדי.',
  teens: 'נוער בגילאי 13-18. דבר על זהות, אתגרים חברתיים, לחץ חברתי, ומציאת הדרך בחיים. השתמש בשפה ישירה ורלוונטית.',
  adults: 'מבוגרים בגילאי 19-45. התמקד בקריירה, מערכות יחסים, צמיחה אישית, ואתגרי החיים המודרניים. ניתוח מעמיק אך מעשי.',
  seniors: 'בוגרים מעל גיל 45. התמקד בחוכמה, מורשת, הכרת תודה, בריאות, ומשמעות. גישה חמה ומכבדת עם עומק.'
};

interface AnalysisResult {
  summary: string;
  key_verses: Array<{
    verse_number: number;
    text: string;
    explanation: string;
  }>;
  life_lessons: Array<{
    title: string;
    description: string;
  }>;
  emotional_tone: string;
  historical_context: string;
}

/**
 * Get cached analysis or null
 */
export function getCachedAnalysis(chapter: number, ageGroup: string): AnalysisResult | null {
  const db = getDb();
  const row = db.prepare(
    'SELECT analysis_json FROM analyses WHERE chapter = ? AND age_group = ?'
  ).get(chapter, ageGroup) as any;

  if (row) {
    return JSON.parse(row.analysis_json);
  }
  return null;
}

/**
 * Generate AI analysis for a psalm chapter
 */
export async function generateAnalysis(
  chapter: number,
  verses: PsalmVerse[],
  ageGroup: string = 'adults'
): Promise<AnalysisResult> {
  // Check cache first
  const cached = getCachedAnalysis(chapter, ageGroup);
  if (cached) return cached;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Service configuration error');
  }

  const client = new Anthropic({ apiKey });

  const ageDesc = AGE_GROUP_DESCRIPTIONS[ageGroup] || AGE_GROUP_DESCRIPTIONS.adults;

  const psalmText = verses.map(v => `(${v.verse}) ${v.text}`).join('\n');

  const systemPrompt = `אתה תלמיד חכם חם ונגיש שהופך את ספר תהילים לרלוונטי ומשמעותי לחיים המודרניים. אתה דובר עברית שוטפת. הניתוח שלך צריך להרגיש אישי, תובנתי ומעשי — לא אקדמי או יבש.

קהל יעד: ${ageDesc}

ענה בעברית בלבד. השב בפורמט JSON תקין בלבד, ללא טקסט נוסף:
{
  "summary": "סיכום קצר של 2-3 משפטים על נושא הפרק",
  "key_verses": [
    { "verse_number": 3, "text": "הפסוק המלא", "explanation": "למה הפסוק הזה חשוב ומשמעותי" }
  ],
  "life_lessons": [
    { "title": "כותרת קצרה", "description": "הסבר מעשי ויישומי" }
  ],
  "emotional_tone": "מילה אחת או שתיים שמתארות את הטון הרגשי",
  "historical_context": "הקשר היסטורי קצר - מתי ולמה נכתב הפרק"
}`;

  const userPrompt = `נתח את פרק ${chapter} בתהילים:

${psalmText}

הנחיות:
- בחר 2-3 פסוקים משמעותיים במיוחד ל-key_verses
- כתוב 3 לקחים מעשיים ל-life_lessons
- התאם את השפה והדוגמאות לקהל היעד
- הטון הרגשי: בחר מתוך: תקווה, תפילה, הודיה, צער, אמונה, גבורה, ענווה, שמחה, חרטה, ביטחון
- החזר JSON תקין בלבד`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      { role: 'user', content: userPrompt }
    ],
    system: systemPrompt
  });

  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  let analysis: AnalysisResult;
  try {
    // Try to extract JSON from the response
    let jsonStr = textContent.text.trim();
    // Handle potential markdown code blocks
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    analysis = JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse Claude response:', textContent.text.substring(0, 200));
    throw new Error('Failed to parse analysis response');
  }

  // Cache the analysis
  const db = getDb();
  db.prepare(
    'INSERT OR REPLACE INTO analyses (chapter, age_group, analysis_json) VALUES (?, ?, ?)'
  ).run(chapter, ageGroup, JSON.stringify(analysis));

  return analysis;
}
