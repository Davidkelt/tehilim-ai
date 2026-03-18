import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDedication, useDedicationProgress, useClaimChapter } from '../hooks/useDedication';
import { getParticipantId, getParticipantName, setParticipantName } from '../lib/participant';
import DedicationHeader from '../components/DedicationHeader';
import DedicationProgress from '../components/DedicationProgress';
import DedicationChapterGrid from '../components/DedicationChapterGrid';
import DedicationShareCard from '../components/DedicationShareCard';
import confetti from 'canvas-confetti';

export default function DedicationEvent() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get('new') === '1';

  const { data, isLoading, error } = useDedication(eventId);
  const { data: progress } = useDedicationProgress(eventId);
  const claimMutation = useClaimChapter(eventId || '');

  const [showShare, setShowShare] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [celebrationShown, setCelebrationShown] = useState(false);

  // Show share modal on first visit (creator)
  useEffect(() => {
    if (isNew && data) {
      setShowShare(true);
    }
  }, [isNew, data]);

  // Celebration when all 150 completed
  useEffect(() => {
    if (progress?.is_completed && !celebrationShown) {
      setCelebrationShown(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#d4a843', '#1e3a5f', '#e8c36b', '#ffffff'],
      });
    }
  }, [progress?.is_completed, celebrationShown]);

  const handleClaimChapter = async () => {
    const existingName = getParticipantName();
    if (!existingName) {
      setShowNamePrompt(true);
      return;
    }
    try {
      const result = await claimMutation.mutateAsync();
      navigate(`/dedicate/${eventId}/read/${result.chapter}`);
    } catch {
      // error handled by mutation state
    }
  };

  const handleNameSubmit = async () => {
    if (nameInput.trim()) {
      setParticipantName(nameInput.trim());
    }
    setShowNamePrompt(false);
    try {
      const result = await claimMutation.mutateAsync();
      navigate(`/dedicate/${eventId}/read/${result.chapter}`);
    } catch {
      // error handled by mutation state
    }
  };

  // Find my claimed (not completed) chapters
  const myId = getParticipantId();
  const myClaimedChapters = data
    ? Object.entries(data.chapters)
        .filter(([, c]) => c.participant_id === myId && c.status === 'claimed')
        .map(([ch]) => parseInt(ch, 10))
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 fade-in">
        <p className="text-4xl mb-4">😔</p>
        <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-muted)' }}>
          ההקדשה לא נמצאה
        </p>
      </div>
    );
  }

  const { event, chapters } = data;
  const completedCount = progress?.completed_chapters ?? event.completed_chapters;
  const participantCount = progress?.participant_count ?? event.participant_count;
  const isCompleted = progress?.is_completed ?? !!event.is_completed;

  return (
    <div className="fade-in max-w-lg mx-auto">
      {/* Dedication header */}
      <DedicationHeader
        dedicationText={event.dedication_text}
        occasionIcon={event.occasion_type}
      />

      {/* Completion celebration overlay */}
      {isCompleted && (
        <div
          className="rounded-2xl p-6 mb-6 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(212,168,67,0.15), rgba(30,58,95,0.1))',
            border: '2px solid var(--color-accent)',
          }}
        >
          <span className="text-5xl block mb-3">🎉</span>
          <h2
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}
          >
            כל 150 הפרקים הושלמו!
          </h2>
          <p
            className="text-sm"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-muted)' }}
          >
            תזכו למצוות רבות
          </p>
        </div>
      )}

      {/* Progress */}
      <DedicationProgress
        completed={completedCount}
        participants={participantCount}
      />

      {/* My active chapters */}
      {myClaimedChapters.length > 0 && (
        <div
          className="rounded-2xl p-4 mb-6"
          style={{
            backgroundColor: 'rgba(212,168,67,0.08)',
            border: '1px solid rgba(212,168,67,0.2)',
          }}
        >
          <h3
            className="text-sm font-bold mb-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}
          >
            הפרקים שלך
          </h3>
          <div className="flex gap-2 flex-wrap">
            {myClaimedChapters.map(ch => (
              <button
                key={ch}
                onClick={() => navigate(`/dedicate/${eventId}/read/${ch}`)}
                className="px-4 py-2 rounded-xl cursor-pointer border-0 font-medium transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                פרק {ch}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {!isCompleted && (
        <button
          onClick={handleClaimChapter}
          disabled={claimMutation.isPending}
          className="w-full py-4 rounded-xl font-bold cursor-pointer border-0 transition-all hover:scale-[1.02] active:scale-95 mb-4 disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2a5280 100%)',
            color: '#d4a843',
            fontFamily: 'var(--font-heading)',
            fontSize: '17px',
            boxShadow: '0 4px 16px rgba(30,58,95,0.3)',
          }}
        >
          {claimMutation.isPending ? 'מקצה פרק...' : '📖 קח פרק לקריאה'}
        </button>
      )}

      {claimMutation.isError && (
        <div
          className="rounded-xl p-3 mb-4 text-center text-sm"
          style={{
            backgroundColor: 'rgba(220,38,38,0.1)',
            color: '#dc2626',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {(claimMutation.error as Error)?.message || 'שגיאה בלקיחת פרק'}
        </div>
      )}

      {/* Share button */}
      <button
        onClick={() => setShowShare(true)}
        className="w-full py-3 rounded-xl font-medium cursor-pointer border-0 transition-all hover:scale-[1.02] active:scale-95 mb-6"
        style={{
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-heading)',
          border: '1px solid var(--border-color)',
        }}
      >
        📤 שתף את ההקדשה
      </button>

      {/* Chapter grid */}
      <DedicationChapterGrid chapters={chapters} />

      {/* Share modal */}
      {showShare && (
        <DedicationShareCard
          eventId={eventId!}
          dedicationText={event.dedication_text}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Name prompt modal */}
      {showNamePrompt && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setShowNamePrompt(false)} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div
              className="w-full max-w-sm rounded-2xl p-6 fade-in"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <h3
                className="text-lg font-bold mb-2 text-center"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                מה שמך?
              </h3>
              <p
                className="text-sm mb-4 text-center"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-muted)' }}
              >
                השם יופיע ליד הפרקים שתקרא (לא חובה)
              </p>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="השם שלך"
                className="w-full px-4 py-3 rounded-xl text-base border-0 outline-none mb-4"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                  border: '1px solid var(--border-color)',
                }}
                dir="rtl"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleNameSubmit}
                  className="flex-1 py-3 rounded-xl font-bold cursor-pointer border-0 transition-all hover:scale-[1.02] active:scale-95"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-primary)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  המשך
                </button>
                <button
                  onClick={() => { setNameInput(''); handleNameSubmit(); }}
                  className="py-3 px-4 rounded-xl cursor-pointer border-0 transition-all"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  דלג
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
