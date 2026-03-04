import { createPortal } from 'react-dom';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';

export default function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center',
        pointerEvents: 'none',
        width: '100%',
        maxWidth: '420px',
        padding: '0 16px',
      }}
    >
      {toasts.map(toast => (
        <div key={toast.id} style={{ pointerEvents: 'auto', width: '100%' }}>
          <Toast toast={toast} />
        </div>
      ))}
    </div>,
    document.body
  );
}
