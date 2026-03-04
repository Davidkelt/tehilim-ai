import { Link } from 'react-router-dom';
import { toHebrewNumeral, TEHILLIM_BOOKS } from '../lib/constants';
import { useFavorites } from '../hooks/useFavorites';
import { useStreaks } from '../hooks/useStreaks';

interface Props {
  cachedChapters?: number[];
}

export default function ChapterGrid({ cachedChapters }: Props) {
  const { isChapterFav } = useFavorites();
  const { streaks } = useStreaks();
  const cachedSet = new Set(cachedChapters || []);
  const readSet = new Set(streaks.uniqueChaptersRead);

  return (
    <div className="space-y-8">
      {TEHILLIM_BOOKS.map((book) => {
        const chapters: number[] = [];
        for (let i = book.range[0]; i <= book.range[1]; i++) {
          chapters.push(i);
        }
        const readCount = chapters.filter(ch => readSet.has(ch)).length;

        return (
          <div key={book.name}>
            <h3
              className="text-lg font-bold mb-3 flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              <span
                className="inline-block px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-accent)',
                }}
              >
                {book.label}
              </span>
              {book.name}
              {readCount > 0 && (
                <span
                  className="text-xs mr-auto"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
                >
                  {readCount}/{chapters.length}
                </span>
              )}
            </h3>

            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {chapters.map(ch => {
                const isFav = isChapterFav(ch);
                const isCached = cachedSet.size === 0 || cachedSet.has(ch);
                const isRead = readSet.has(ch);

                return (
                  <Link
                    key={ch}
                    to={`/chapter/${ch}`}
                    className="relative flex items-center justify-center h-12 rounded-xl no-underline transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: isRead ? 'var(--color-primary)' : 'var(--bg-card)',
                      color: isRead ? 'var(--color-accent)' : 'var(--text-primary)',
                      border: isRead
                        ? '1px solid var(--color-primary-light)'
                        : '1px solid var(--border-color)',
                      boxShadow: isRead
                        ? '0 2px 8px rgba(30,58,95,0.2)'
                        : '0 2px 4px var(--shadow-color)',
                      opacity: isCached ? 1 : 0.5,
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 600,
                      fontSize: '15px',
                    }}
                  >
                    {toHebrewNumeral(ch)}
                    {isFav && (
                      <span className="absolute -top-1 -left-1 text-xs">⭐</span>
                    )}
                    {isRead && (
                      <span
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] check-pop"
                        style={{
                          backgroundColor: 'var(--color-accent)',
                          color: 'var(--color-primary)',
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
