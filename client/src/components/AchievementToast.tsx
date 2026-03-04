import type { AchievementDef } from '../lib/achievements';

interface Props {
  achievement: AchievementDef;
}

export default function AchievementToast({ achievement }: Props) {
  return (
    <div
      className="achievement-toast-enter flex items-center gap-3 p-4 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(212,168,67,0.2), rgba(30,58,95,0.3))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(212,168,67,0.4)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,168,67,0.2)',
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 achievement-icon-bounce"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))',
          boxShadow: '0 4px 12px rgba(212,168,67,0.4)',
        }}
      >
        {achievement.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-xs font-bold mb-0.5"
          style={{
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.05em',
          }}
        >
          הישג חדש!
        </div>
        <div
          className="font-bold text-base"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
          }}
        >
          {achievement.title}
        </div>
        <div
          className="text-xs mt-0.5"
          style={{
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {achievement.description}
        </div>
      </div>
    </div>
  );
}
