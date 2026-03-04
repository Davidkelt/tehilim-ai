import { useState, useEffect, useRef } from 'react';
import { useAnalysis } from '../hooks/useAnalysis';
import { useAchievements } from '../hooks/useAchievements';
import { AnalysisSkeleton } from './LoadingSkeleton';
import { EMOTIONAL_TONES, toHebrewNumeral } from '../lib/constants';
import ShareCard from './ShareCard';

interface Props {
  chapter: number;
  onClose: () => void;
}

type Tab = 'summary' | 'verses' | 'lessons' | 'context';

export default function AnalysisPanel({ chapter, onClose }: Props) {
  const { data, isLoading, error } = useAnalysis(chapter, true);
  const { recordAnalysisUse } = useAchievements();
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [shareVerse, setShareVerse] = useState<{ text: string; lesson?: string } | null>(null);
  const trackedRef = useRef(false);

  const analysis = data?.analysis;

  // Track analysis usage for achievements
  useEffect(() => {
    if (analysis && !trackedRef.current) {
      trackedRef.current = true;
      recordAnalysisUse();
    }
  }, [analysis, recordAnalysisUse]);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'summary', label: 'סיכום', icon: '📋' },
    { id: 'verses', label: 'פסוקים', icon: '✨' },
    { id: 'lessons', label: 'לקחים', icon: '💡' },
    { id: 'context', label: 'הקשר', icon: '📜' },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Centered floating modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl fade-in pointer-events-auto"
          style={{
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 16px 64px rgba(0,0,0,0.3)',
            border: '1px solid var(--border-color)',
          }}
        >

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <h3
              className="text-xl font-bold m-0"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              ניתוח AI — פרק {toHebrewNumeral(chapter)}
            </h3>
            {analysis?.emotional_tone && (
              <span
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-accent)',
                }}
              >
                {EMOTIONAL_TONES[analysis.emotional_tone] || '📖'} {analysis.emotional_tone}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg cursor-pointer border-0 transition-colors"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex gap-2 mb-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer border-0 transition-all duration-200"
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--color-primary)' : 'var(--bg-primary)',
                color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          {isLoading && <AnalysisSkeleton />}

          {error && (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <p className="text-4xl mb-3">😔</p>
              <p style={{ fontFamily: 'var(--font-heading)' }}>
                שגיאה בטעינת הניתוח
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {(error as Error).message}
              </p>
            </div>
          )}

          {analysis && activeTab === 'summary' && (
            <div className="fade-in space-y-4">
              <p
                className="text-lg leading-relaxed"
                style={{ fontFamily: 'var(--font-body)', fontSize: '18px' }}
              >
                {analysis.summary}
              </p>
            </div>
          )}

          {analysis && activeTab === 'verses' && (
            <div className="fade-in space-y-4">
              {analysis.key_verses.map((kv, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0"
                      style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
                    >
                      {toHebrewNumeral(kv.verse_number)}
                    </span>
                    <p
                      className="hebrew-text text-lg font-medium m-0"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {kv.text}
                    </p>
                  </div>
                  <p className="text-sm mt-2 m-0" style={{ color: 'var(--text-secondary)' }}>
                    {kv.explanation}
                  </p>
                  <button
                    className="mt-2 text-xs px-3 py-1 rounded-lg cursor-pointer border-0 transition-colors"
                    style={{ backgroundColor: 'var(--bg-card)', color: 'var(--color-accent)' }}
                    onClick={() => setShareVerse({ text: kv.text, lesson: kv.explanation })}
                  >
                    📤 שתף
                  </button>
                </div>
              ))}
            </div>
          )}

          {analysis && activeTab === 'lessons' && (
            <div className="fade-in space-y-4">
              {analysis.life_lessons.map((lesson, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
                    >
                      {i + 1}
                    </span>
                    <h4
                      className="font-bold m-0"
                      style={{ fontFamily: 'var(--font-heading)', fontSize: '16px' }}
                    >
                      {lesson.title}
                    </h4>
                  </div>
                  <p className="text-sm m-0" style={{ color: 'var(--text-secondary)' }}>
                    {lesson.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {analysis && activeTab === 'context' && (
            <div className="fade-in">
              <p
                className="text-lg leading-relaxed"
                style={{ fontFamily: 'var(--font-body)', fontSize: '18px' }}
              >
                {analysis.historical_context}
              </p>
            </div>
          )}
        </div>
        </div>
      </div>

      {shareVerse && (
        <ShareCard
          chapter={chapter}
          verseText={shareVerse.text}
          lesson={shareVerse.lesson}
          onClose={() => setShareVerse(null)}
        />
      )}
    </>
  );
}
