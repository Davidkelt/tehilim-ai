import { useAchievements } from '../hooks/useAchievements';
import { ACHIEVEMENT_DEFS } from '../lib/achievements';

export default function AchievementsPage() {
  const { achievements } = useAchievements();
  const unlockedCount = Object.keys(achievements.unlocked).length;

  return (
    <div className="fade-in">
      <h2
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        🏆 הישגים
      </h2>
      <p
        className="text-sm mb-6"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
      >
        {unlockedCount} מתוך {ACHIEVEMENT_DEFS.length} הישגים
      </p>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full mb-8 overflow-hidden"
        style={{ backgroundColor: 'var(--border-color)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${(unlockedCount / ACHIEVEMENT_DEFS.length) * 100}%`,
            background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-light))',
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACHIEVEMENT_DEFS.map((def, index) => {
          const unlocked = achievements.unlocked[def.id];
          const unlockedDate = unlocked
            ? new Date(unlocked).toLocaleDateString('he-IL', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : null;

          return (
            <div
              key={def.id}
              className="p-4 rounded-2xl transition-all duration-300"
              style={{
                backgroundColor: unlocked ? 'var(--bg-card)' : 'var(--bg-primary)',
                border: unlocked
                  ? '1px solid var(--color-accent)'
                  : '1px solid var(--border-color)',
                opacity: unlocked ? 1 : 0.5,
                boxShadow: unlocked
                  ? '0 4px 16px rgba(212,168,67,0.15)'
                  : 'none',
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{
                    background: unlocked
                      ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))'
                      : 'var(--border-color)',
                    filter: unlocked ? 'none' : 'grayscale(1)',
                  }}
                >
                  {unlocked ? def.icon : '🔒'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-bold m-0 text-base"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    {def.title}
                  </h3>
                  <p
                    className="text-xs m-0 mt-0.5"
                    style={{
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {def.description}
                  </p>
                  {unlockedDate && (
                    <p
                      className="text-xs m-0 mt-1"
                      style={{
                        color: 'var(--color-accent)',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      🎉 {unlockedDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
