import { useEffect, useState } from 'react';
import type { ToastItem } from '../hooks/useToast';
import { dismissToast } from '../hooks/useToast';

interface Props {
  toast: ToastItem;
}

const TYPE_STYLES: Record<ToastItem['type'], { bg: string; border: string; icon: string }> = {
  success: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', icon: '✅' },
  error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', icon: '❌' },
  info: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', icon: 'ℹ️' },
  achievement: { bg: 'rgba(212,168,67,0.2)', border: 'rgba(212,168,67,0.4)', icon: '🏆' },
};

export default function Toast({ toast }: Props) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, toast.duration - 400);

    return () => clearTimeout(exitTimer);
  }, [toast.duration]);

  const style = TYPE_STYLES[toast.type];

  return (
    <div
      className={`toast-item ${exiting ? 'toast-exit' : 'toast-enter'}`}
      onClick={() => dismissToast(toast.id)}
      style={{
        background: style.bg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${style.border}`,
        borderRadius: '16px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        fontFamily: 'var(--font-heading)',
        color: 'var(--text-primary)',
        fontSize: '15px',
        fontWeight: 500,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        maxWidth: '380px',
        width: '100%',
      }}
    >
      <span className="text-xl shrink-0">{style.icon}</span>
      <span className="flex-1">{toast.message}</span>
    </div>
  );
}
