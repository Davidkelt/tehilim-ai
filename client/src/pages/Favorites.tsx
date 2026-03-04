import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { toHebrewNumeral } from '../lib/constants';
import { useSettings } from '../hooks/useSettings';
import { stripNikud } from '../lib/constants';

export default function Favorites() {
  const { favoriteChapters, favoriteVerses, toggleChapter, toggleVerse } = useFavorites();
  const { settings } = useSettings();

  const hasContent = favoriteChapters.length > 0 || favoriteVerses.length > 0;

  return (
    <div className="fade-in">
      <h2
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        ⭐ מועדפים
      </h2>

      {!hasContent && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📚</p>
          <p
            className="text-lg mb-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}
          >
            אין מועדפים עדיין
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            לחץ על ☆ ליד פרק או פסוק כדי לשמור אותו כאן
          </p>
          <Link
            to="/"
            className="inline-block mt-6 px-6 py-3 rounded-xl no-underline font-medium transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            דפדוף בתהילים
          </Link>
        </div>
      )}

      {/* Favorite Chapters */}
      {favoriteChapters.length > 0 && (
        <div className="mb-8">
          <h3
            className="text-lg font-bold mb-3"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}
          >
            פרקים ({favoriteChapters.length})
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {favoriteChapters.sort((a, b) => a - b).map(ch => (
              <div key={ch} className="relative">
                <Link
                  to={`/chapter/${ch}`}
                  className="flex items-center justify-center h-14 rounded-xl no-underline transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 2px 8px var(--shadow-color)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    fontSize: '16px',
                  }}
                >
                  {toHebrewNumeral(ch)}
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); toggleChapter(ch); }}
                  className="absolute -top-2 -left-2 w-6 h-6 rounded-full text-xs flex items-center justify-center cursor-pointer border-0 transition-all hover:scale-125"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
                  title="הסר ממועדפים"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Verses */}
      {favoriteVerses.length > 0 && (
        <div>
          <h3
            className="text-lg font-bold mb-3"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}
          >
            פסוקים ({favoriteVerses.length})
          </h3>
          <div className="space-y-3">
            {favoriteVerses.map((fav, i) => {
              const text = settings.showNikud ? fav.text : stripNikud(fav.text);
              return (
                <div
                  key={i}
                  className="p-4 rounded-xl flex gap-3 items-start transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 2px 8px var(--shadow-color)',
                  }}
                >
                  <Link
                    to={`/chapter/${fav.chapter}`}
                    className="shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center no-underline"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-accent)' }}
                  >
                    <span className="text-[10px]" style={{ fontFamily: 'var(--font-heading)' }}>פרק</span>
                    <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                      {toHebrewNumeral(fav.chapter)}
                    </span>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm mb-1 font-medium"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
                    >
                      פסוק {toHebrewNumeral(fav.verse)}
                    </p>
                    <p
                      className="m-0 hebrew-text"
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '18px',
                        lineHeight: 1.8,
                      }}
                    >
                      {text}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleVerse(fav)}
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs cursor-pointer border-0 transition-all hover:scale-125"
                    style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}
                    title="הסר ממועדפים"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
