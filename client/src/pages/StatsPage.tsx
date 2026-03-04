import { useMemo } from 'react';
import { useStreaks } from '../hooks/useStreaks';
import { useAchievements } from '../hooks/useAchievements';
import { ACHIEVEMENT_DEFS } from '../lib/achievements';
import { Link } from 'react-router-dom';

export default function StatsPage() {
  const { streaks } = useStreaks();
  const { achievements } = useAchievements();

  // Build heatmap data for the last 52 weeks
  const heatmapData = useMemo(() => {
    const today = new Date();
    const cells: { date: string; count: number; dayOfWeek: number }[] = [];

    // Go back 364 days (52 weeks)
    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const count = streaks.readingLog[dateStr]?.length || 0;
      cells.push({ date: dateStr, count, dayOfWeek: d.getDay() });
    }

    return cells;
  }, [streaks.readingLog]);

  // Stats
  const unlockedCount = Object.keys(achievements.unlocked).length;
  const totalDaysRead = Object.keys(streaks.readingLog).length;

  // Most-read chapters (from readingLog)
  const chapterCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const chapters of Object.values(streaks.readingLog)) {
      for (const ch of chapters) {
        counts[ch] = (counts[ch] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([ch, count]) => ({ chapter: parseInt(ch), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [streaks.readingLog]);

  function getHeatColor(count: number): string {
    if (count === 0) return 'var(--border-color)';
    if (count === 1) return 'rgba(212,168,67,0.3)';
    if (count <= 3) return 'rgba(212,168,67,0.5)';
    if (count <= 5) return 'rgba(212,168,67,0.7)';
    return 'rgba(212,168,67,0.9)';
  }

  return (
    <div className="fade-in">
      <h2
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        📊 סטטיסטיקות
      </h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'רצף נוכחי', value: streaks.currentStreak, icon: '🔥', suffix: ' ימים' },
          { label: 'רצף שיא', value: streaks.longestStreak, icon: '⭐', suffix: ' ימים' },
          { label: 'סה״כ קריאות', value: streaks.totalChaptersRead, icon: '📖', suffix: '' },
          { label: 'פרקים ייחודיים', value: streaks.uniqueChaptersRead.length, icon: '📚', suffix: '/150' },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl text-center"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 8px var(--shadow-color)',
            }}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}
            >
              {stat.value}{stat.suffix}
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* More stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div
          className="p-4 rounded-2xl text-center"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="text-2xl mb-1">📅</div>
          <div
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}
          >
            {totalDaysRead}
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
          >
            ימים עם קריאה
          </div>
        </div>
        <Link
          to="/achievements"
          className="p-4 rounded-2xl text-center no-underline transition-all hover:scale-[1.02]"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="text-2xl mb-1">🏆</div>
          <div
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}
          >
            {unlockedCount}/{ACHIEVEMENT_DEFS.length}
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
          >
            הישגים
          </div>
        </Link>
      </div>

      {/* Heatmap */}
      <div
        className="p-5 rounded-2xl mb-8"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      >
        <h3
          className="font-bold mb-4 m-0"
          style={{ fontFamily: 'var(--font-heading)', fontSize: '16px' }}
        >
          📅 היסטוריית קריאה
        </h3>

        <div
          className="overflow-x-auto pb-2"
          style={{ direction: 'ltr' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateRows: 'repeat(7, 1fr)',
              gridAutoFlow: 'column',
              gap: '3px',
              width: 'fit-content',
            }}
          >
            {heatmapData.map((cell, i) => (
              <div
                key={i}
                className="rounded-sm transition-colors duration-200"
                style={{
                  width: '14px',
                  height: '14px',
                  backgroundColor: getHeatColor(cell.count),
                }}
                title={`${cell.date}: ${cell.count} פרקים`}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 justify-end" style={{ direction: 'rtl' }}>
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
            פחות
          </span>
          {[0, 1, 3, 5, 7].map(n => (
            <div
              key={n}
              className="rounded-sm"
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: getHeatColor(n),
              }}
            />
          ))}
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
            יותר
          </span>
        </div>
      </div>

      {/* Most-read chapters */}
      {chapterCounts.length > 0 && (
        <div
          className="p-5 rounded-2xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          <h3
            className="font-bold mb-4 m-0"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '16px' }}
          >
            📈 הפרקים הנקראים ביותר
          </h3>
          <div className="space-y-3">
            {chapterCounts.map((item, i) => (
              <Link
                key={item.chapter}
                to={`/chapter/${item.chapter}`}
                className="flex items-center gap-3 no-underline transition-all hover:scale-[1.01]"
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    backgroundColor: i === 0 ? 'var(--color-accent)' : 'var(--bg-primary)',
                    color: i === 0 ? 'var(--color-primary)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-color)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(item.count / (chapterCounts[0]?.count || 1)) * 100}%`,
                        backgroundColor: 'var(--color-accent)',
                        transition: 'width 1s ease-out',
                      }}
                    />
                  </div>
                </div>
                <span
                  className="text-sm font-medium shrink-0"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}
                >
                  פרק {item.chapter} ({item.count}x)
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
