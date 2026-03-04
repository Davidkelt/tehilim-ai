import { Link } from 'react-router-dom';
import { useDaily } from '../hooks/usePsalm';
import { toHebrewNumeral } from '../lib/constants';
import { DailyPsalmSkeleton } from './LoadingSkeleton';
import { useSettings } from '../hooks/useSettings';
import { stripNikud } from '../lib/constants';

export default function DailyPsalm() {
  const { data, isLoading, error } = useDaily();
  const { settings } = useSettings();

  if (isLoading) return <DailyPsalmSkeleton />;
  if (error || !data) return null;

  const verseText = settings.showNikud
    ? data.highlighted_verse.text
    : stripNikud(data.highlighted_verse.text);

  return (
    <div
      className="rounded-2xl p-6 mb-8 transition-all duration-300 fade-in gradient-shift"
      style={{
        background: settings.darkMode
          ? 'linear-gradient(135deg, #1e3a5f 0%, #142842 50%, #1e3a5f 100%)'
          : 'linear-gradient(135deg, #1e3a5f 0%, #2a5280 50%, #1e3a5f 100%)',
        boxShadow: '0 8px 32px rgba(30,58,95,0.3)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📖</span>
        <h2
          className="text-xl font-bold text-white m-0"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          תהילים יומי
        </h2>
        <span
          className="mr-auto px-3 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: 'rgba(212,168,67,0.2)', color: '#d4a843' }}
        >
          {data.day_of_month_hebrew} {data.month_name}
        </span>
      </div>

      <div
        className="text-lg leading-relaxed mb-4 hebrew-text"
        style={{
          color: 'rgba(255,255,255,0.9)',
          fontFamily: 'var(--font-body)',
          fontSize: '20px',
        }}
      >
        <span style={{ color: '#d4a843' }}>({toHebrewNumeral(data.highlighted_verse.verse)}) </span>
        {verseText}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Link
          to={`/chapter/${data.primary_chapter}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-base font-medium no-underline transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: '#d4a843',
            color: '#1e3a5f',
            fontFamily: 'var(--font-heading)',
          }}
        >
          קרא פרק {toHebrewNumeral(data.primary_chapter)}
        </Link>
        {data.chapters.length > 1 && (
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            פרקים נוספים: {data.chapters.slice(1).map(c => toHebrewNumeral(c)).join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}
