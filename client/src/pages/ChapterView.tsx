import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePsalm } from '../hooks/usePsalm';
import { useSettings } from '../hooks/useSettings';
import { useFavorites } from '../hooks/useFavorites';
import { useStreaks } from '../hooks/useStreaks';
import { useAchievements } from '../hooks/useAchievements';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { toHebrewNumeral, stripNikud } from '../lib/constants';
import { ChapterViewSkeleton } from '../components/LoadingSkeleton';
import AnalysisPanel from '../components/AnalysisPanel';
import ShareCard from '../components/ShareCard';

export default function ChapterView() {
  const { id } = useParams<{ id: string }>();
  const chapter = parseInt(id || '1', 10);
  const { data: psalm, isLoading, error } = usePsalm(chapter);
  const { settings } = useSettings();
  const { isChapterFav, toggleChapter, isVerseFav, toggleVerse } = useFavorites();
  const { recordChapterRead } = useStreaks();
  const { checkAchievements, recordDarkModeRead } = useAchievements();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [shareVerse, setShareVerse] = useState<{ text: string } | null>(null);
  const [favBounce, setFavBounce] = useState(false);
  const recordedRef = useRef(false);
  const versesEndRef = useRef<HTMLDivElement>(null);
  const hasReachedBottomRef = useRef(false);

  useKeyboardNav(chapter);

  const isFav = isChapterFav(chapter);

  // Track scroll-to-bottom using IntersectionObserver
  useEffect(() => {
    hasReachedBottomRef.current = false;

    if (!versesEndRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasReachedBottomRef.current) {
          hasReachedBottomRef.current = true;
          // User reached the bottom of the chapter — record the read
          if (!recordedRef.current) {
            recordedRef.current = true;
            recordChapterRead(chapter);
            checkAchievements();
            if (settings.darkMode) {
              recordDarkModeRead();
            }
          }
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(versesEndRef.current);
    return () => observer.disconnect();
  }, [psalm, chapter, recordChapterRead, checkAchievements, recordDarkModeRead, settings.darkMode]);

  // Reset recorded flag when chapter changes
  useEffect(() => {
    recordedRef.current = false;
    hasReachedBottomRef.current = false;
  }, [chapter]);

  // Also record read when user clicks AI analysis or navigates to next chapter
  const recordReadIfNeeded = useCallback(() => {
    if (!recordedRef.current) {
      recordedRef.current = true;
      recordChapterRead(chapter);
      checkAchievements();
      if (settings.darkMode) {
        recordDarkModeRead();
      }
    }
  }, [chapter, recordChapterRead, checkAchievements, recordDarkModeRead, settings.darkMode]);

  const handleToggleFav = useCallback(() => {
    toggleChapter(chapter);
    setFavBounce(true);
    setTimeout(() => setFavBounce(false), 500);
    checkAchievements();
  }, [chapter, toggleChapter, checkAchievements]);

  const handleShowAnalysis = useCallback(() => {
    recordReadIfNeeded();
    setShowAnalysis(true);
  }, [recordReadIfNeeded]);

  if (isLoading) {
    return <ChapterViewSkeleton />;
  }

  if (error || !psalm) {
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
    <div className="fade-in">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {chapter > 1 && (
            <Link
              to={`/chapter/${chapter - 1}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl no-underline transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
              }}
            >
              <span>→</span>
              <span>הפרק הקודם</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {chapter < 150 && (
            <Link
              to={`/chapter/${chapter + 1}`}
              onClick={recordReadIfNeeded}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl no-underline transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
              }}
            >
              <span>הפרק הבא</span>
              <span>←</span>
            </Link>
          )}

          <button
            onClick={handleToggleFav}
            className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-0 transition-all hover:scale-110 ${favBounce ? 'heart-burst' : ''}`}
            style={{
              backgroundColor: isFav ? 'var(--color-accent)' : 'var(--bg-card)',
              color: isFav ? 'var(--color-primary)' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
            }}
          >
            {isFav ? '⭐' : '☆'}
          </button>
        </div>
      </div>

      {/* Chapter Header */}
      <div className="text-center mb-8">
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
            const verseFav = isVerseFav(chapter, v.verse);

            return (
              <div
                key={v.verse}
                className="group flex gap-3 items-start verse-highlight rounded-lg p-1 -m-1"
              >
                {/* Verse number */}
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

                {/* Verse text */}
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

                {/* Actions (visible on hover) */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-2">
                  <button
                    onClick={() => {
                      toggleVerse({ chapter, verse: v.verse, text: v.text });
                      checkAchievements();
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs cursor-pointer border-0 transition-all hover:scale-110"
                    style={{
                      backgroundColor: verseFav ? 'var(--color-accent)' : 'var(--bg-primary)',
                      color: verseFav ? 'var(--color-primary)' : 'var(--text-muted)',
                    }}
                    title={verseFav ? 'הסר ממועדפים' : 'הוסף למועדפים'}
                  >
                    {verseFav ? '⭐' : '☆'}
                  </button>
                  <button
                    onClick={() => setShareVerse({ text: v.text })}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs cursor-pointer border-0 transition-all hover:scale-110"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-muted)',
                    }}
                    title="שתף"
                  >
                    📤
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Invisible marker at the end of verses for scroll tracking */}
        <div ref={versesEndRef} className="h-1" />
      </div>

      {/* AI Analysis Button */}
      <div className="text-center mb-8">
        <button
          onClick={handleShowAnalysis}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold cursor-pointer border-0 transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5280 100%)',
            color: 'white',
            fontFamily: 'var(--font-heading)',
            boxShadow: '0 4px 16px rgba(30,58,95,0.3)',
          }}
        >
          🔍 ניתוח AI
        </button>
      </div>

      {/* Navigation bottom */}
      <div className="flex justify-between items-center">
        {chapter > 1 ? (
          <Link
            to={`/chapter/${chapter - 1}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl no-underline transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              fontFamily: 'var(--font-heading)',
              fontSize: '14px',
            }}
          >
            <span>→</span>
            <span>פרק {toHebrewNumeral(chapter - 1)}</span>
          </Link>
        ) : <div />}

        <Link
          to="/"
          className="px-4 py-2 rounded-xl no-underline transition-all hover:scale-105"
          style={{
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          כל הפרקים
        </Link>

        {chapter < 150 ? (
          <Link
            to={`/chapter/${chapter + 1}`}
            onClick={recordReadIfNeeded}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl no-underline transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-primary)',
              fontFamily: 'var(--font-heading)',
              fontSize: '14px',
            }}
          >
            <span>הפרק הבא</span>
            <span>←</span>
          </Link>
        ) : <div />}
      </div>

      {/* Analysis Panel */}
      {showAnalysis && (
        <AnalysisPanel chapter={chapter} onClose={() => setShowAnalysis(false)} />
      )}

      {/* Share Card */}
      {shareVerse && (
        <ShareCard
          chapter={chapter}
          verseText={shareVerse.text}
          onClose={() => setShareVerse(null)}
        />
      )}
    </div>
  );
}
