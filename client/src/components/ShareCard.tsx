import { useRef, useCallback } from 'react';
import { toHebrewNumeral } from '../lib/constants';
import { useAchievements } from '../hooks/useAchievements';
import { showToast } from '../hooks/useToast';
import ShareButtons from './ShareButtons';

interface Props {
  chapter: number;
  verseText: string;
  lesson?: string;
  onClose: () => void;
}

export default function ShareCard({ chapter, verseText, lesson, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { recordShare } = useAchievements();

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `tehillim-${chapter}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      recordShare();
      showToast('התמונה נשמרה!', 'success');
    } catch (err) {
      console.error('Failed to generate image:', err);
      showToast('שגיאה ביצירת התמונה', 'error');
    }
  }, [chapter, recordShare]);

  const handleCopy = useCallback(async () => {
    const text = `תהילים פרק ${toHebrewNumeral(chapter)}\n\n${verseText}${lesson ? `\n\n${lesson}` : ''}`;
    try {
      await navigator.clipboard.writeText(text);
      recordShare();
      showToast('הטקסט הועתק!', 'success');
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      recordShare();
      showToast('הטקסט הועתק!', 'success');
    }
  }, [chapter, verseText, lesson, recordShare]);

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl overflow-hidden fade-in"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          {/* Card preview */}
          <div
            ref={cardRef}
            className="p-8"
            style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #142842 100%)',
              minHeight: '280px',
            }}
          >
            {/* Decorative elements */}
            <div className="flex items-center justify-between mb-6">
              <span
                className="text-sm font-medium"
                style={{ color: 'rgba(212,168,67,0.7)', fontFamily: 'var(--font-heading)' }}
              >
                תהילים
              </span>
              <span
                className="text-sm"
                style={{ color: 'rgba(212,168,67,0.7)', fontFamily: 'var(--font-heading)' }}
              >
                פרק {toHebrewNumeral(chapter)}
              </span>
            </div>

            {/* Verse */}
            <p
              className="text-xl leading-relaxed text-white mb-6"
              style={{ fontFamily: 'var(--font-body)', fontSize: '22px', lineHeight: 2 }}
            >
              {verseText}
            </p>

            {/* Lesson */}
            {lesson && (
              <div
                className="border-t pt-4"
                style={{ borderColor: 'rgba(212,168,67,0.3)' }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-heading)' }}
                >
                  {lesson}
                </p>
              </div>
            )}

            {/* Decorative bottom */}
            <div className="flex justify-center mt-6">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'rgba(212,168,67,0.5)' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Social share buttons */}
          <div className="p-4 pb-2">
            <ShareButtons chapter={chapter} verseText={verseText} lesson={lesson} />
          </div>

          {/* Actions */}
          <div className="px-4 pb-4 flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 rounded-xl font-medium cursor-pointer border-0 transition-all hover:scale-[1.02] active:scale-95"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              📥 הורד תמונה
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 py-3 rounded-xl font-medium cursor-pointer border-0 transition-all hover:scale-[1.02] active:scale-95"
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              📋 העתק טקסט
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 text-sm cursor-pointer border-0 transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            סגור
          </button>
        </div>
      </div>
    </>
  );
}
