import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMoods } from '../hooks/usePsalm';
import { toHebrewNumeral } from '../lib/constants';

interface Props {
  /** Show compact version (fewer results) for homepage */
  compact?: boolean;
}

// Top 4 categories shown initially on homepage
const TOP_CATEGORIES = ['רפואה', 'פרנסה', 'הצלחה', 'הודיה'];

export default function MoodExplorer({ compact = false }: Props) {
  const { data: moodsData, isLoading } = useMoods();
  const [selectedMoods, setSelectedMoods] = useState<Set<string>>(new Set());
  const [showAllCategories, setShowAllCategories] = useState(!compact);

  // Toggle a mood on/off (multi-select)
  const toggleMood = (mood: string) => {
    setSelectedMoods(prev => {
      const next = new Set(prev);
      if (next.has(mood)) {
        next.delete(mood);
      } else {
        next.add(mood);
      }
      return next;
    });
  };

  // Compute merged chapter list from all selected moods
  const matchingChapters = useMemo(() => {
    if (!moodsData || selectedMoods.size === 0) return [];

    const chapterMoods = new Map<number, Set<string>>();

    for (const moodGroup of moodsData.moods) {
      if (!selectedMoods.has(moodGroup.mood)) continue;
      for (const ch of moodGroup.chapters) {
        if (!chapterMoods.has(ch.chapter)) {
          chapterMoods.set(ch.chapter, new Set());
        }
        chapterMoods.get(ch.chapter)!.add(moodGroup.mood);
      }
    }

    // Sort: chapters matching more selected moods first, then by chapter number
    return Array.from(chapterMoods.entries())
      .sort((a, b) => {
        if (b[1].size !== a[1].size) return b[1].size - a[1].size;
        return a[0] - b[0];
      })
      .map(([chapter, moods]) => ({ chapter, moods: Array.from(moods) }));
  }, [moodsData, selectedMoods]);

  if (isLoading || !moodsData || moodsData.moods.length === 0) return null;

  const allMoods = moodsData.moods;
  const maxResults = compact ? 6 : 20;

  // In compact mode, show only top 4 initially; when expanded, show all
  const visibleMoods = compact && !showAllCategories
    ? allMoods.filter(m => TOP_CATEGORIES.includes(m.mood))
    : allMoods;

  const hiddenCount = compact && !showAllCategories
    ? allMoods.length - visibleMoods.length
    : 0;

  // Get emoji for a mood name
  const getEmoji = (mood: string) => {
    return allMoods.find(m => m.mood === mood)?.emoji || '📖';
  };

  return (
    <div className="mb-6">
      <h3
        className="text-lg font-bold mb-1 flex items-center gap-2"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        🎭 מה על הלב?
      </h3>
      <p
        className="text-xs mb-3 m-0"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
      >
        חיפוש פרקים לפי נושא
      </p>

      {/* Category chips — multi-select */}
      <div className="flex gap-2 flex-wrap mb-2">
        {visibleMoods.map(mood => {
          const isSelected = selectedMoods.has(mood.mood);
          return (
            <button
              key={mood.mood}
              onClick={() => toggleMood(mood.mood)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border-0 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--bg-card)',
                color: isSelected ? 'var(--color-accent)' : 'var(--text-secondary)',
                border: isSelected ? '1px solid var(--color-primary-light, var(--color-primary))' : '1px solid var(--border-color)',
                fontFamily: 'var(--font-heading)',
                boxShadow: isSelected ? '0 2px 8px rgba(30,58,95,0.2)' : 'none',
              }}
            >
              <span>{mood.emoji}</span>
              <span>{mood.mood}</span>
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: isSelected ? 'rgba(212,168,67,0.2)' : 'var(--bg-primary)',
                  color: isSelected ? 'var(--color-accent)' : 'var(--text-muted)',
                }}
              >
                {mood.chapters.length}
              </span>
            </button>
          );
        })}

        {/* Show more / less button */}
        {compact && hiddenCount > 0 && (
          <button
            onClick={() => setShowAllCategories(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border-0 transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-accent)',
              border: '1px dashed var(--color-accent)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            <span>+</span>
            <span>נושאים נוספים ({hiddenCount})</span>
          </button>
        )}
        {compact && showAllCategories && allMoods.length > TOP_CATEGORIES.length && (
          <button
            onClick={() => setShowAllCategories(false)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border-0 transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              border: '1px dashed var(--border-color)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            <span>▲</span>
            <span>הצג פחות</span>
          </button>
        )}
      </div>

      {/* Selected moods indicator */}
      {selectedMoods.size > 1 && (
        <div
          className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs mt-3"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          <span>🔍</span>
          <span>מציג {matchingChapters.length} פרקים ב-{selectedMoods.size} נושאים</span>
          <button
            onClick={() => setSelectedMoods(new Set())}
            className="mr-auto px-2 py-0.5 rounded-lg text-xs cursor-pointer border-0 transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            נקה הכל
          </button>
        </div>
      )}

      {/* Results — chapters matching selected moods */}
      {selectedMoods.size > 0 && matchingChapters.length > 0 && (
        <div className="fade-in mt-3">
          <div
            className="rounded-2xl p-4 space-y-2"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 12px var(--shadow-color)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h4
                className="font-bold m-0 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-heading)', fontSize: '16px' }}
              >
                {selectedMoods.size === 1
                  ? `${getEmoji(Array.from(selectedMoods)[0])} פרקי ${Array.from(selectedMoods)[0]}`
                  : '📖 פרקים מתאימים'}
              </h4>
              <span
                className="text-xs"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
              >
                {matchingChapters.length} פרקים
              </span>
            </div>

            {matchingChapters.slice(0, maxResults).map((item, idx) => (
              <Link
                key={item.chapter}
                to={`/chapter/${item.chapter}`}
                className="block p-3 rounded-xl no-underline transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  animationDelay: `${idx * 30}ms`,
                }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-bold"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-accent)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    פרק {toHebrewNumeral(item.chapter)}
                  </span>

                  {/* Show mood tags for this chapter (when multiple moods selected) */}
                  {selectedMoods.size > 1 && item.moods.map(m => (
                    <span
                      key={m}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: 'rgba(212,168,67,0.15)',
                        color: 'var(--color-accent)',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      {getEmoji(m)} {m}
                    </span>
                  ))}

                  {/* Show match count badge when chapter matches multiple selections */}
                  {selectedMoods.size > 1 && item.moods.length > 1 && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold mr-auto"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-accent)',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      ✓ {item.moods.length} התאמות
                    </span>
                  )}
                </div>
              </Link>
            ))}

            {matchingChapters.length > maxResults && (
              <p
                className="text-center text-xs m-0 pt-2"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
              >
                + עוד {matchingChapters.length - maxResults} פרקים
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
