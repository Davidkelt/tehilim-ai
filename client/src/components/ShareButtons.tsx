import { getWhatsAppUrl, getTelegramUrl, getTwitterUrl } from '../lib/share';

interface Props {
  chapter: number;
  verseText: string;
  lesson?: string;
}

export default function ShareButtons({ chapter, verseText, lesson }: Props) {
  const buttons = [
    {
      label: 'WhatsApp',
      icon: '💬',
      url: getWhatsAppUrl(chapter, verseText, lesson),
      bg: '#25D366',
      color: '#fff',
    },
    {
      label: 'Telegram',
      icon: '✈️',
      url: getTelegramUrl(chapter, verseText, lesson),
      bg: '#0088cc',
      color: '#fff',
    },
    {
      label: 'X',
      icon: '𝕏',
      url: getTwitterUrl(chapter, verseText, lesson),
      bg: '#1a1a1a',
      color: '#fff',
    },
  ];

  return (
    <div className="flex gap-2 justify-center">
      {buttons.map(btn => (
        <a
          key={btn.label}
          href={btn.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl no-underline text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: btn.bg,
            color: btn.color,
            fontFamily: 'var(--font-heading)',
          }}
        >
          <span>{btn.icon}</span>
          <span>{btn.label}</span>
        </a>
      ))}
    </div>
  );
}
