const FAVORITES_KEY = 'tehillim-favorites';
const VERSE_FAVORITES_KEY = 'tehillim-verse-favorites';

export interface FavoriteVerse {
  chapter: number;
  verse: number;
  text: string;
}

export function getFavoriteChapters(): number[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteChapter(chapter: number): boolean {
  const favorites = getFavoriteChapters();
  const index = favorites.indexOf(chapter);
  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(chapter);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return index < 0; // returns true if added
}

export function isChapterFavorited(chapter: number): boolean {
  return getFavoriteChapters().includes(chapter);
}

export function getFavoriteVerses(): FavoriteVerse[] {
  try {
    const stored = localStorage.getItem(VERSE_FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteVerse(fav: FavoriteVerse): boolean {
  const favorites = getFavoriteVerses();
  const index = favorites.findIndex(
    f => f.chapter === fav.chapter && f.verse === fav.verse
  );
  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(fav);
  }
  localStorage.setItem(VERSE_FAVORITES_KEY, JSON.stringify(favorites));
  return index < 0;
}

export function isVerseFavorited(chapter: number, verse: number): boolean {
  return getFavoriteVerses().some(
    f => f.chapter === chapter && f.verse === verse
  );
}
