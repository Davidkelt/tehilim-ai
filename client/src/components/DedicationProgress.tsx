interface Props {
  completed: number;
  total?: number;
  participants: number;
}

export default function DedicationProgress({ completed, total = 150, participants }: Props) {
  const pct = Math.round((completed / total) * 100);

  return (
    <div
      className="rounded-2xl p-5 mb-6"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 12px var(--shadow-color)',
      }}
    >
      {/* Progress bar */}
      <div
        className="w-full h-3 rounded-full overflow-hidden mb-3"
        style={{ backgroundColor: 'var(--border-color)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #d4a843, #e8c36b)',
          }}
        />
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center">
        <span
          className="text-sm font-medium"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          {completed}/{total} פרקים
        </span>
        <span
          className="text-sm"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-muted)' }}
        >
          {participants} משתתפים
        </span>
      </div>

      {pct > 0 && (
        <div className="text-center mt-2">
          <span
            className="text-xs"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}
          >
            {pct}%
          </span>
        </div>
      )}
    </div>
  );
}
