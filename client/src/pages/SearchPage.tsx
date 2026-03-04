import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/usePsalm';
import { useSettings } from '../hooks/useSettings';
import { useAchievements } from '../hooks/useAchievements';
import { toHebrewNumeral, stripNikud } from '../lib/constants';
import MoodExplorer from '../components/MoodExplorer';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useSearch(searchTerm);
  const { settings } = useSettings();
  const { recordSearch } = useAchievements();
  const navigate = useNavigate();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setSearchTerm(trimmed);
      recordSearch();
    }
  }, [query, recordSearch]);

  const handleRandom = () => {
    const ch = Math.floor(Math.random() * 150) + 1;
    navigate(`/chapter/${ch}`);
  };

  return (
    <div className="fade-in">
      <h2
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        🔍 חיפוש וגילוי
      </h2>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש מילה, ביטוי, או מספר פרק..."
            className="flex-1 px-5 py-3 rounded-xl text-base outline-none transition-all duration-200"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '2px solid var(--border-color)',
              fontFamily: 'var(--font-heading)',
            }}
            dir="rtl"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-bold cursor-pointer border-0 transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            חפש
          </button>
        </div>
      </form>

      {/* Quick actions */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={handleRandom}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm cursor-pointer border-0 transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
          }}
        >
          🎲 הפתעה
        </button>
      </div>

      {/* Mood-based exploration */}
      <MoodExplorer />

      {/* Results */}
      {isLoading && (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          <div className="text-3xl mb-2">🔄</div>
          <p style={{ fontFamily: 'var(--font-heading)' }}>מחפש...</p>
        </div>
      )}

      {data && data.results.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🔍</p>
          <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-muted)' }}>
            לא נמצאו תוצאות עבור "{searchTerm}"
          </p>
        </div>
      )}

      {data && data.results.length > 0 && (
        <div>
          <p
            className="text-sm mb-4"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
          >
            {data.results.length} פרקים נמצאו
            {data.results.reduce((sum, r) => sum + r.matches.length, 0)} תוצאות
          </p>

          <div className="space-y-4">
            {data.results.slice(0, 20).map(result => (
              <div
                key={result.chapter}
                className="p-4 rounded-xl transition-all hover:scale-[1.01]"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 2px 8px var(--shadow-color)',
                }}
              >
                <Link
                  to={`/chapter/${result.chapter}`}
                  className="flex items-center gap-2 no-underline mb-3"
                >
                  <span
                    className="px-3 py-1 rounded-lg text-sm font-bold"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-accent)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    פרק {toHebrewNumeral(result.chapter)}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
                  >
                    {result.matches.length} תוצאות
                  </span>
                </Link>

                <div className="space-y-2">
                  {result.matches.slice(0, 3).map(match => {
                    const text = settings.showNikud ? match.text : stripNikud(match.text);
                    return (
                      <div key={match.verse} className="flex gap-2 items-start">
                        <span
                          className="text-xs font-bold mt-1 shrink-0"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          {toHebrewNumeral(match.verse)}
                        </span>
                        <p
                          className="text-sm m-0 hebrew-text"
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '16px',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {text}
                        </p>
                      </div>
                    );
                  })}
                  {result.matches.length > 3 && (
                    <Link
                      to={`/chapter/${result.chapter}`}
                      className="text-xs no-underline"
                      style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}
                    >
                      + עוד {result.matches.length - 3} תוצאות...
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
