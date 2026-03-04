import { usePsalms } from '../hooks/usePsalm';
import { useStreaks } from '../hooks/useStreaks';
import DailyPsalm from '../components/DailyPsalm';
import ChapterGrid from '../components/ChapterGrid';
import ProgressRing from '../components/ProgressRing';
import MoodExplorer from '../components/MoodExplorer';
import { ChapterGridSkeleton } from '../components/LoadingSkeleton';
import { useNavigate, Link } from 'react-router-dom';

export default function Home() {
  const { data, isLoading } = usePsalms();
  const { streaks } = useStreaks();
  const navigate = useNavigate();

  const handleRandom = () => {
    const ch = Math.floor(Math.random() * 150) + 1;
    navigate(`/chapter/${ch}`);
  };

  const cachedChapters = data?.psalms.map(p => p.chapter) || [];

  return (
    <div className="fade-in">
      {/* Daily Psalm */}
      <DailyPsalm />

      {/* Streak & Progress summary */}
      {(streaks.currentStreak > 0 || streaks.uniqueChaptersRead.length > 0) && (
        <div
          className="rounded-2xl p-5 mb-6 flex items-center gap-5"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 12px var(--shadow-color)',
          }}
        >
          <ProgressRing size={90} strokeWidth={7} />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {streaks.currentStreak > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xl streak-fire">🔥</span>
                  <span
                    className="text-lg font-bold"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}
                  >
                    {streaks.currentStreak} ימים
                  </span>
                </div>
              )}
              {streaks.longestStreak > streaks.currentStreak && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  שיא: {streaks.longestStreak}
                </span>
              )}
            </div>
            <p
              className="text-sm m-0"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
            >
              {streaks.totalChaptersRead} קריאות סה״כ
            </p>
            <Link
              to="/stats"
              className="text-xs no-underline mt-1 inline-block"
              style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}
            >
              צפה בסטטיסטיקות →
            </Link>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={handleRandom}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer border-0 transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
          }}
        >
          🎲 הפתעה
        </button>
        <button
          onClick={() => navigate('/search')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer border-0 transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 500,
            border: '1px solid var(--border-color)',
          }}
        >
          🔍 חיפוש
        </button>
      </div>

      {/* Mood Explorer */}
      <MoodExplorer compact />

      {/* Chapter Grid */}
      <div>
        <h2
          className="text-2xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          כל הפרקים
        </h2>

        {isLoading ? (
          <ChapterGridSkeleton />
        ) : (
          <ChapterGrid cachedChapters={cachedChapters} />
        )}

        {data && data.cached < 150 && (
          <p
            className="text-center text-sm mt-4"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
          >
            נטען... {data.cached}/150 פרקים
          </p>
        )}
      </div>
    </div>
  );
}
