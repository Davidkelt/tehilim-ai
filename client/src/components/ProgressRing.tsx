import { useStreaks } from '../hooks/useStreaks';

interface Props {
  size?: number;
  strokeWidth?: number;
}

export default function ProgressRing({ size = 120, strokeWidth = 8 }: Props) {
  const { streaks } = useStreaks();
  const uniqueCount = streaks.uniqueChaptersRead.length;
  const progress = uniqueCount / 150;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="progress-ring-rotate">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border-color)"
            strokeWidth={strokeWidth}
            opacity={0.3}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="progress-ring-circle"
            style={{
              transformOrigin: 'center',
              transform: 'rotate(-90deg)',
              transition: 'stroke-dashoffset 1s ease-out',
            }}
          />
        </svg>
        {/* Center text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <span
            className="text-2xl font-bold"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-accent)',
            }}
          >
            {uniqueCount}
          </span>
          <span
            className="text-xs"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-muted)',
            }}
          >
            / 150
          </span>
        </div>
      </div>
      <span
        className="text-sm font-medium"
        style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-secondary)',
        }}
      >
        פרקים שנקראו
      </span>
    </div>
  );
}
