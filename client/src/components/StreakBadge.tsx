import { useStreaks } from '../hooks/useStreaks';

export default function StreakBadge() {
  const { streaks } = useStreaks();

  if (streaks.currentStreak === 0) return null;

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full streak-badge-glow"
      style={{
        background: 'linear-gradient(135deg, rgba(212,168,67,0.2), rgba(212,168,67,0.1))',
        border: '1px solid rgba(212,168,67,0.3)',
      }}
    >
      <span className="text-lg streak-fire">🔥</span>
      <span
        className="text-sm font-bold"
        style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-accent)',
        }}
      >
        {streaks.currentStreak}
      </span>
    </div>
  );
}
