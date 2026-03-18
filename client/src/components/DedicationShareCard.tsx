import { useCallback } from 'react';
import { showToast } from '../hooks/useToast';

interface Props {
  eventId: string;
  dedicationText: string;
  onClose: () => void;
}

export default function DedicationShareCard({ eventId, dedicationText, onClose }: Props) {
  const shareUrl = `${window.location.origin}/dedicate/${eventId}`;
  const shareText = `${dedicationText}\n\nבואו נשלים יחד את כל 150 פרקי תהילים!\n${shareUrl}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('הקישור הועתק!', 'success');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('הקישור הועתק!', 'success');
    }
  }, [shareUrl]);

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(dedicationText + '\nבואו נשלים יחד את כל 150 פרקי תהילים!')}`;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm rounded-2xl overflow-hidden fade-in"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <div className="p-6 text-center">
            <span className="text-4xl mb-3 block">📤</span>
            <h3
              className="text-lg font-bold mb-1"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              שתפו את ההקדשה
            </h3>
            <p
              className="text-sm mb-5"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-muted)' }}
            >
              הזמינו אחרים להצטרף ולקרוא פרקים
            </p>

            {/* Share buttons */}
            <div className="flex flex-col gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-medium no-underline transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  backgroundColor: '#25D366',
                  color: '#fff',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                WhatsApp שתף ב
              </a>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-medium no-underline transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  backgroundColor: '#0088cc',
                  color: '#fff',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                Telegram שתף ב
              </a>

              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-medium cursor-pointer border-0 transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                  border: '1px solid var(--border-color)',
                }}
              >
                📋 העתק קישור
              </button>
            </div>
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
