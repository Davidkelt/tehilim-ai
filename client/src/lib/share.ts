import { toHebrewNumeral } from './constants';

function buildShareText(chapter: number, verseText: string, lesson?: string): string {
  let text = `תהילים פרק ${toHebrewNumeral(chapter)}\n\n${verseText}`;
  if (lesson) {
    text += `\n\n💡 ${lesson}`;
  }
  return text;
}

export function getWhatsAppUrl(chapter: number, verseText: string, lesson?: string): string {
  const text = buildShareText(chapter, verseText, lesson);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function getTelegramUrl(chapter: number, verseText: string, lesson?: string): string {
  const text = buildShareText(chapter, verseText, lesson);
  return `https://t.me/share/url?text=${encodeURIComponent(text)}`;
}

export function getTwitterUrl(chapter: number, verseText: string, lesson?: string): string {
  const text = buildShareText(chapter, verseText, lesson);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}
