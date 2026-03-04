import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const { user, isConfigured, loginWithGoogle, loginWithEmail, registerWithEmail, logout } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is already logged in, show profile
  if (user) {
    return (
      <div className="fade-in max-w-lg mx-auto">
        <h2
          className="text-2xl font-bold mb-8"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          👤 החשבון שלי
        </h2>

        <div
          className="rounded-2xl p-6 text-center"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-20 h-20 rounded-full mx-auto mb-4"
              style={{ border: '3px solid var(--color-accent)' }}
            />
          )}
          {!user.photoURL && (
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-accent)',
              }}
            >
              {(user.displayName || user.email || '?')[0].toUpperCase()}
            </div>
          )}

          <h3
            className="font-bold text-lg m-0 mb-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {user.displayName || 'משתמש'}
          </h3>
          <p className="text-sm m-0 mb-4" style={{ color: 'var(--text-muted)' }}>
            {user.email}
          </p>

          <div
            className="px-4 py-3 rounded-xl mb-4 text-sm"
            style={{
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              color: '#4CAF50',
              fontFamily: 'var(--font-heading)',
            }}
          >
            ✓ הנתונים שלך מסונכרנים ונשמרים
          </div>

          <button
            onClick={async () => {
              await logout();
              navigate('/settings');
            }}
            className="px-6 py-2.5 rounded-xl cursor-pointer border-0 transition-all hover:scale-105 active:scale-95 text-sm font-medium"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
              border: '1px solid var(--border-color)',
            }}
          >
            התנתק
          </button>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="fade-in max-w-lg mx-auto">
        <h2
          className="text-2xl font-bold mb-8"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          👤 התחברות
        </h2>
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          <p className="text-4xl mb-4">🔧</p>
          <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-muted)' }}>
            מערכת ההתחברות עדיין לא הוגדרה.
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            יש להגדיר את פרטי Firebase ב-.env
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/settings');
    } catch (err: any) {
      // Translate Firebase error codes to Hebrew
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('אימייל או סיסמה שגויים');
      } else if (code === 'auth/email-already-in-use') {
        setError('האימייל הזה כבר רשום, נסה להתחבר');
      } else if (code === 'auth/weak-password') {
        setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      } else if (code === 'auth/invalid-email') {
        setError('כתובת אימייל לא תקינה');
      } else {
        setError('שגיאה בהתחברות. נסה שוב.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/settings');
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError('שגיאה בהתחברות עם גוגל');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-lg mx-auto">
      <h2
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        👤 {mode === 'login' ? 'התחברות' : 'הרשמה'}
      </h2>
      <p
        className="text-sm mb-8"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
      >
        {mode === 'login' ? 'התחבר כדי לשמור את ההתקדמות שלך' : 'צור חשבון חדש כדי לשמור את ההתקדמות שלך'}
      </p>

      <div className="space-y-4">
        {/* Google Sign-In */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl cursor-pointer border-0 transition-all hover:scale-[1.02] active:scale-[0.98] text-base font-medium disabled:opacity-50"
          style={{
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            fontFamily: 'var(--font-heading)',
            boxShadow: '0 2px 8px var(--shadow-color)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          <span>התחבר עם Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>או</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl text-base border-0 outline-none"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              fontFamily: 'var(--font-heading)',
              direction: 'ltr',
              textAlign: 'right',
            }}
          />
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl text-base border-0 outline-none"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              fontFamily: 'var(--font-heading)',
              direction: 'ltr',
              textAlign: 'right',
            }}
          />

          {error && (
            <div
              className="px-4 py-2 rounded-xl text-sm text-center"
              style={{
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                color: '#F44336',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-3.5 rounded-xl cursor-pointer border-0 transition-all hover:scale-[1.02] active:scale-[0.98] text-base font-bold disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {loading ? '...' : (mode === 'login' ? 'התחבר' : 'הרשם')}
          </button>
        </form>

        {/* Toggle mode */}
        <p
          className="text-center text-sm m-0 pt-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
        >
          {mode === 'login' ? 'אין לך חשבון?' : 'כבר יש לך חשבון?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="cursor-pointer border-0 bg-transparent font-bold"
            style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}
          >
            {mode === 'login' ? 'הרשם כאן' : 'התחבר כאן'}
          </button>
        </p>
      </div>
    </div>
  );
}
