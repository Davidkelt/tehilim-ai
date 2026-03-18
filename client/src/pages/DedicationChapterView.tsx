import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePsalm } from '../hooks/usePsalm';
import { useDedication, useCompleteChapter } from '../hooks/useDedication';
import { useSettings } from '../hooks/useSettings';
import { toHebrewNumeral, stripNikud } from '../lib/constants';
import DedicationHeader from '../components/DedicationHeader';
import { showToast } from '../hooks/useToast';

export default function DedicationChapterView() {
  const { eventId, chapter: chapterStr } = useParams<{ eventId: string; chapter: string }>();
  const chapter = parseInt(chapterStr || '1', 10);
  const navigate = useNavigate();
  const { settings } = useSettings();

  const { data: psalm, isLoading: psalmLoading } = usePsalm(chapter);
  const { data: dedication } = useDedication(eventId);
  const completeMutation = useCompleteChapter(eventId || '');

  const [completed, setCompleted] = useState(false);

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync(chapter);
      setCompleted(true);
      showToast('הפרק הושלם! תזכו למצוות', 'success');
      setTimeout(() => {
        navigate(`/dedicate/${eventId}`);
      }, 1500);
    } catch {
      showToast('שגיאה בסימון הפרק', 'error');
    }
  };

  if (psalmLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent" />
      </div>
    );
  }

  if (!psalm) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">😔</p>
        <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-muted)' }}>
          שגיאה בטעינת הפרק
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-lg mx-auto">
      {/* Back link */}
      <button
        onClick={() => navigate(`/dedicate/${eventId}`)}
        className="flex items-center gap-1 mb-4 px-3 py-1.5 rounded-lg cursor-pointer border-0 text-sm"
        style={{
          backgroundColor: 'transparent',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-heading)',
        }}
      >
        ← חזרה להקדשה
      </button>

      {/* Dedication banner */}
      {dedication && (
        <DedicationHeader
          dedicationText={dedication.event.dedication_text}
          occasionIcon={dedication.event.occasion_type}
          compact
        />
      )}

      {/* Chapter header */}
      <div className="text-center mb-6">
        <h2
          className="text-3xl font-bold mb-1"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-accent)',
          }}
        >
          פרק {toHebrewNumeral(chapter)}
        </h2>
        <div
          className="w-16 h-0.5 mx-auto mt-2 rounded-full"
          style={{ backgroundColor: 'var(--color-accent)' }}
        />
      </div>

      {/* Verses */}
      <div
        className="rounded-2xl p-6 sm:p-8 mb-6"
        style={{
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 4px 16px var(--shadow-color)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div className="space-y-4">
          {psalm.verses.map(v => {
            const text = settings.showNikud ? v.text : stripNikud(v.text);

            return (
              <div key={v.verse} className="flex gap-3 items-start">
                <span
                  className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-full text-xs font-bold shrink-0 mt-2"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-accent)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {toHebrewNumeral(v.verse)}
                </span>
                <p
                  className="hebrew-text m-0 leading-relaxed flex-1"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: `${settings.fontSize}px`,
                    lineHeight: 2.2,
                  }}
                >
                  {text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complete button */}
      {!completed ? (
        <button
          onClick={handleComplete}
          disabled={completeMutation.isPending}
          className="w-full py-4 rounded-xl font-bold cursor-pointer border-0 transition-all hover:scale-[1.02] active:scale-95 mb-8 disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5280 100%)',
            color: '#d4a843',
            fontFamily: 'var(--font-heading)',
            fontSize: '18px',
            boxShadow: '0 4px 16px rgba(30,58,95,0.3)',
          }}
        >
          {completeMutation.isPending ? 'מסיים...' : '✓ סיימתי לקרוא'}
        </button>
      ) : (
        <div
          className="w-full py-4 rounded-xl text-center mb-8 scale-spring"
          style={{
            backgroundColor: 'rgba(212,168,67,0.1)',
            border: '2px solid var(--color-accent)',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-heading)',
            fontSize: '18px',
            fontWeight: 700,
          }}
        >
          ✓ הפרק הושלם!
        </div>
      )}
    </div>
  );
}
