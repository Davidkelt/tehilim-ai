import { Link } from 'react-router-dom';
import { toHebrewNumeral, TEHILLIM_BOOKS, WEEKLY_DIVISIONS, MONTHLY_DIVISIONS } from '../lib/constants';
import type { ViewMode } from '../lib/constants';
import { useFavorites } from '../hooks/useFavorites';
import { useStreaks } from '../hooks/useStreaks';

interface Props {
  cachedChapters?: number[];
  viewMode?: ViewMode;
  hebrewDayOfMonth?: number;
}

interface ChapterGroup {
  name: string;
  chapters: number[];
  isToday: boolean;
}

function buildGroups(viewMode: ViewMode, hebrewDayOfMonth?: number): ChapterGroup[] {
  const today = new Date().getDay(); // 0=Sunday

  switch (viewMode) {
    case 'weekly':
      return WEEKLY_DIVISIONS.map((div, i) => ({
        name: div.name,
        chapters: div.chapters,
        isToday: i === today,
      }));

    case 'monthly':
      return MONTHLY_DIVISIONS.map((div, i) => ({
        name: div.name,
        chapters: div.chapters,
        isToday: hebrewDayOfMonth != null && i === hebrewDayOfMonth - 1,
      }));

    default: // 'books'
      return TEHILLIM_BOOKS.map((book) => {
        const chapters: number[] = [];
        for (let i = book.range[0]; i <= book.range[1]; i++) {
          chapters.push(i);
        }
        return { name: book.name, chapters, isToday: false };
      });
  }
}

export default function ChapterGrid({ cachedChapters, viewMode = 'books', hebrewDayOfMonth }: Props) {
  const { isChapterFav } = useFavorites();
  const { streaks } = useStreaks();
  const cachedSet = new Set(cachedChapters || []);
  const readSet = new Set(streaks.uniqueChaptersRead);

  const groups = buildGroups(viewMode, hebrewDayOfMonth);

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const readCount = group.chapters.filter(ch => readSet.has(ch)).length;
        const bookInfo = viewMode === 'books'
          ? TEHILLIM_BOOKS.find(b => b.name === group.name)
          : null;

        return (
          <div key={group.name}>
            <h3
              className="text-lg font-bold mb-3 flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              {bookInfo && (
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {bookInfo.label}
                </span>
              )}
              {!bookInfo && (
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: group.isToday ? 'var(--color-accent)' : 'var(--color-primary)',
                    color: group.isToday ? 'var(--color-primary)' : 'var(--color-accent)',
                    fontWeight: group.isToday ? 700 : 400,
                  }}
                >
                  {toHebrewNumeral(group.chapters[0])}-{toHebrewNumeral(group.chapters[group.chapters.length - 1])}
                </span>
              )}
              {group.name}
              {group.isToday && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-primary)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                  }}
                >
                  היום
                </span>
              )}
              {readCount > 0 && (
                <span
                  className="text-xs mr-auto"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
                >
                  {readCount}/{group.chapters.length}
                </span>
              )}
            </h3>

            <div
              className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2"
              style={group.isToday ? {
                borderRadius: '16px',
                padding: '8px',
                backgroundColor: 'rgba(212,168,67,0.08)',
                border: '1px solid rgba(212,168,67,0.2)',
              } : undefined}
            >
              {group.chapters.map(ch => {
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
