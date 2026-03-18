import { toHebrewNumeral } from '../lib/constants';
import { getParticipantId } from '../lib/participant';
import type { DedicationChapterStatus } from '../lib/api';

interface Props {
  chapters: Record<number, DedicationChapterStatus>;
}

export default function DedicationChapterGrid({ chapters }: Props) {
  const myId = getParticipantId();

  return (
    <div className="mb-6">
      <h3
        className="text-base font-bold mb-3"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
      >
        מפת הפרקים
      </h3>
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
        {Array.from({ length: 150 }, (_, i) => i + 1).map(ch => {
          const claim = chapters[ch];
          const isMine = claim?.participant_id === myId;
          const isCompleted = claim?.status === 'completed';
          const isClaimed = claim?.status === 'claimed';

          let bg = 'var(--bg-card)';
          let color = 'var(--text-muted)';
          let border = '1px solid var(--border-color)';
          let opacity = 1;

          if (isCompleted) {
            bg = isMine ? 'var(--color-accent)' : 'var(--color-primary)';
            color = isMine ? 'var(--color-primary)' : 'var(--color-accent)';
            border = 'none';
          } else if (isClaimed) {
            if (isMine) {
              bg = 'var(--color-accent)';
              color = 'var(--color-primary)';
              border = '2px solid var(--color-accent)';
            } else {
              opacity = 0.4;
              bg = 'var(--bg-card)';
              color = 'var(--text-muted)';
            }
          }

          return (
            <div
              key={ch}
              className="flex items-center justify-center h-9 rounded-lg text-xs font-medium"
              style={{
                backgroundColor: bg,
                color,
                border,
                opacity,
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
              }}
              title={
                isCompleted
                  ? `פרק ${ch} - הושלם${claim?.participant_name ? ` ע״י ${claim.participant_name}` : ''}`
                  : isClaimed
                    ? `פרק ${ch} - נלקח${isMine ? ' (שלך)' : ''}`
                    : `פרק ${ch} - פנוי`
              }
            >
              {toHebrewNumeral(ch)}
              {isCompleted && (
                <span className="mr-0.5 text-[8px]">✓</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 justify-center">
        {[
          { label: 'פנוי', bg: 'var(--bg-card)', border: '1px solid var(--border-color)' },
          { label: 'שלך', bg: 'var(--color-accent)', border: 'none' },
          { label: 'הושלם', bg: 'var(--color-primary)', border: 'none' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: item.bg, border: item.border }}
            />
            <span
              className="text-xs"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-muted)' }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
