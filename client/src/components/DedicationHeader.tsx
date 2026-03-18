interface Props {
  dedicationText: string;
  occasionIcon?: string;
  compact?: boolean;
}

const OCCASION_ICONS: Record<string, string> = {
  refua: '💊',
  ilui_nishmat: '🕯️',
  hatzlacha: '🌟',
  zivug: '💍',
  shmira: '🛡️',
  parnasa: '🪙',
  hodaya: '🙏',
};

export default function DedicationHeader({ dedicationText, occasionIcon, compact }: Props) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${compact ? 'mb-4' : 'mb-6'}`}
      style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #142842 100%)',
        boxShadow: '0 4px 20px rgba(30,58,95,0.25)',
      }}
    >
      <div className={compact ? 'p-4 text-center' : 'p-6 text-center'}>
        {occasionIcon && (
          <span className={compact ? 'text-2xl mb-2 block' : 'text-3xl mb-3 block'}>
            {OCCASION_ICONS[occasionIcon] || '📖'}
          </span>
        )}
        <p
          className={`font-bold leading-relaxed m-0 ${compact ? 'text-lg' : 'text-xl'}`}
          style={{
            color: '#d4a843',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.8,
          }}
        >
          {dedicationText}
        </p>
      </div>
    </div>
  );
}

export { OCCASION_ICONS };
