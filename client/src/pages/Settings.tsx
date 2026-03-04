import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import { AGE_GROUPS } from '../lib/constants';

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const { user, isConfigured } = useAuth();

  return (
    <div className="fade-in max-w-lg mx-auto">
      <h2
        className="text-2xl font-bold mb-8"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        ⚙️ הגדרות
      </h2>

      <div className="space-y-6">
        {/* Account / Auth Section */}
        <Link
          to="/auth"
          className="block p-5 rounded-2xl no-underline transition-all hover:scale-[1.01]"
          style={{
            backgroundColor: user ? 'var(--bg-card)' : 'var(--color-primary)',
            border: user ? '1px solid var(--border-color)' : '1px solid var(--color-primary)',
          }}
        >
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-12 h-12 rounded-full"
                style={{ border: '2px solid var(--color-accent)' }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{
                  backgroundColor: user ? 'var(--color-primary)' : 'rgba(212,168,67,0.2)',
                  color: 'var(--color-accent)',
                }}
              >
                {user ? (user.displayName || user.email || '?')[0].toUpperCase() : '👤'}
              </div>
            )}
            <div className="flex-1">
              {user ? (
                <>
                  <h3
                    className="font-bold m-0"
                    style={{ fontFamily: 'var(--font-heading)', fontSize: '16px' }}
                  >
                    {user.displayName || 'משתמש'}
                  </h3>
                  <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {user.email} · ✓ מסונכרן
                  </p>
                </>
              ) : (
                <>
                  <h3
                    className="font-bold m-0"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '16px',
                      color: 'var(--color-accent)',
                    }}
                  >
                    התחבר או הירשם
                  </h3>
                  <p className="text-xs m-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    שמור את ההתקדמות שלך בענן
                  </p>
                </>
              )}
            </div>
            <span style={{ color: user ? 'var(--text-muted)' : 'var(--color-accent)' }}>←</span>
          </div>
        </Link>

        {/* Dark Mode */}
        <div
          className="p-5 rounded-2xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3
                className="font-bold m-0"
                style={{ fontFamily: 'var(--font-heading)', fontSize: '16px' }}
              >
                🌙 מצב כהה
              </h3>
              <p className="text-sm m-0 mt-1" style={{ color: 'var(--text-muted)' }}>
                {settings.darkMode ? 'מופעל' : 'כבוי'}
              </p>
            </div>
            <button
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className="w-14 h-8 rounded-full cursor-pointer border-0 transition-all duration-300 relative"
              style={{
                backgroundColor: settings.darkMode ? 'var(--color-accent)' : 'var(--border-color)',
              }}
            >
              <div
                className="w-6 h-6 rounded-full absolute top-1 transition-all duration-300"
                style={{
                  backgroundColor: settings.darkMode ? 'var(--color-primary)' : 'white',
                  left: settings.darkMode ? '2px' : undefined,
                  right: settings.darkMode ? undefined : '2px',
                }}
              />
            </button>
          </div>
        </div>

        {/* Nikud Toggle */}
        <div
          className="p-5 rounded-2xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3
                className="font-bold m-0"
                style={{ fontFamily: 'var(--font-heading)', fontSize: '16px' }}
              >
                ניקוד
              </h3>
              <p className="text-sm m-0 mt-1" style={{ color: 'var(--text-muted)' }}>
                {settings.showNikud ? 'מציג ניקוד' : 'ללא ניקוד'}
              </p>
            </div>
            <button
              onClick={() => updateSettings({ showNikud: !settings.showNikud })}
              className="w-14 h-8 rounded-full cursor-pointer border-0 transition-all duration-300 relative"
              style={{
                backgroundColor: settings.showNikud ? 'var(--color-accent)' : 'var(--border-color)',
              }}
            >
              <div
                className="w-6 h-6 rounded-full absolute top-1 transition-all duration-300"
                style={{
                  backgroundColor: settings.showNikud ? 'var(--color-primary)' : 'white',
                  left: settings.showNikud ? '2px' : undefined,
                  right: settings.showNikud ? undefined : '2px',
                }}
              />
            </button>
          </div>
          {/* Preview */}
          <p
            className="mt-3 text-lg"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
          >
            {settings.showNikud ? 'שִׁיר הַמַּעֲלוֹת' : 'שיר המעלות'}
          </p>
        </div>

        {/* Font Size */}
        <div
          className="p-5 rounded-2xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          <h3
            className="font-bold m-0 mb-3"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '16px' }}
          >
            📏 גודל גופן — {settings.fontSize}px
          </h3>
          <input
            type="range"
            min="16"
            max="36"
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
            className="w-full"
            style={{ accentColor: 'var(--color-accent)' }}
          />
          <div className="flex justify-between text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            <span>קטן</span>
            <span>גדול</span>
          </div>
          {/* Preview */}
          <p
            className="mt-3 hebrew-text"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: `${settings.fontSize}px`,
              lineHeight: 2,
            }}
          >
            אַשְׁרֵי הָאִישׁ אֲשֶׁר לֹא הָלַךְ בַּעֲצַת רְשָׁעִים
          </p>
        </div>

        {/* Age Group */}
        <div
          className="p-5 rounded-2xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          <h3
            className="font-bold m-0 mb-3"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '16px' }}
          >
            👤 קבוצת גיל (לניתוח AI)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {AGE_GROUPS.map(ag => (
              <button
                key={ag.value}
                onClick={() => updateSettings({ ageGroup: ag.value })}
                className="p-3 rounded-xl text-center cursor-pointer border-0 transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: settings.ageGroup === ag.value ? 'var(--color-primary)' : 'var(--bg-primary)',
                  color: settings.ageGroup === ag.value ? 'var(--color-accent)' : 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                <div className="font-bold">{ag.label}</div>
                <div className="text-xs mt-0.5 opacity-70">{ag.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="flex gap-3">
          <Link
            to="/stats"
            className="flex-1 p-4 rounded-2xl no-underline text-center transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div className="text-2xl mb-1">📊</div>
            <div
              className="text-sm font-medium"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              סטטיסטיקות
            </div>
          </Link>
          <Link
            to="/achievements"
            className="flex-1 p-4 rounded-2xl no-underline text-center transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div className="text-2xl mb-1">🏆</div>
            <div
              className="text-sm font-medium"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              הישגים
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
