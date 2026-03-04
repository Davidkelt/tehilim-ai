import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useSettings } from '../hooks/useSettings';
import StreakBadge from './StreakBadge';

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  const location = useLocation();
  const { settings, updateSettings } = useSettings();

  const navItems = [
    { path: '/', label: 'בית', icon: '🏠' },
    { path: '/search', label: 'חיפוש', icon: '🔍' },
    { path: '/achievements', label: 'הישגים', icon: '🏆' },
    { path: '/favorites', label: 'מועדפים', icon: '⭐' },
    { path: '/settings', label: 'הגדרות', icon: '⚙️' },
  ];

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300"
        style={{
          backgroundColor: settings.darkMode ? 'rgba(26,26,46,0.9)' : 'rgba(250,247,240,0.9)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <span className="text-lg" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-body)' }}>
                תְ
              </span>
            </div>
            <h1
              className="text-xl font-bold m-0"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              תהילים
            </h1>
          </Link>

          <div className="flex items-center gap-2">
            <StreakBadge />
            <button
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-transform hover:scale-110 cursor-pointer border-0"
              style={{ backgroundColor: 'transparent' }}
              title={settings.darkMode ? 'מצב יום' : 'מצב לילה'}
            >
              {settings.darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t transition-colors duration-300"
        style={{
          backgroundColor: settings.darkMode ? 'rgba(26,26,46,0.95)' : 'rgba(255,255,255,0.95)',
          borderColor: 'var(--border-color)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-4xl mx-auto flex justify-around py-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path ||
              (item.path === '/achievements' && location.pathname === '/stats');
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center py-1 px-2 no-underline transition-all duration-200"
                style={{
                  color: isActive ? 'var(--color-accent)' : 'var(--text-muted)',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <span
                  className="text-[10px] mt-0.5"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
