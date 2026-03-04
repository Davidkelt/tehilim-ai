import { useState, useCallback } from 'react';
import {
  getFavoriteChapters,
  toggleFavoriteChapter,
  isChapterFavorited,
  getFavoriteVerses,
  toggleFavoriteVerse,
  isVerseFavorited,
  type FavoriteVerse,
} from '../lib/favorites';

export function useFavorites() {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  return {
    favoriteChapters: getFavoriteChapters(),
    favoriteVerses: getFavoriteVerses(),

    toggleChapter: (chapter: number) => {
      const added = toggleFavoriteChapter(chapter);
      refresh();
      return added;
    },

    toggleVerse: (fav: FavoriteVerse) => {
      const added = toggleFavoriteVerse(fav);
      refresh();
      return added;
    },

    isChapterFav: (chapter: number) => isChapterFavorited(chapter),
    isVerseFav: (chapter: number, verse: number) => isVerseFavorited(chapter, verse),
  };
}
