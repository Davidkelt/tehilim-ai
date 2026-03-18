import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateDedication } from '../hooks/useDedication';
import { setParticipantName } from '../lib/participant';
import type { OccasionType } from '../lib/api';

const OCCASIONS: { type: OccasionType; label: string; icon: string; parentLabel: 'mother' | 'father' | null }[] = [
  { type: 'refua', label: 'רפואה שלמה', icon: '❤️‍🩹', parentLabel: 'mother' },
  { type: 'ilui_nishmat', label: 'עילוי נשמת', icon: '🕯️', parentLabel: 'father' },
  { type: 'hatzlacha', label: 'הצלחה', icon: '🌟', parentLabel: 'mother' },
  { type: 'zivug', label: 'זיווג הגון', icon: '💍', parentLabel: 'mother' },
  { type: 'shmira', label: 'שמירה', icon: '🛡️', parentLabel: 'mother' },
  { type: 'parnasa', label: 'פרנסה', icon: '🪙', parentLabel: 'mother' },
  { type: 'hodaya', label: 'הודיה', icon: '🙏', parentLabel: null },
];

const OCCASION_PREFIX: Record<OccasionType, string> = {
  refua: 'לרפואת',
  ilui_nishmat: 'לעילוי נשמת',
  hatzlacha: 'להצלחת',
  zivug: 'לזיווג',
  shmira: 'לשמירת',
  parnasa: 'לפרנסת',
  hodaya: 'הודיה על',
};

export default function CreateDedication() {
  const navigate = useNavigate();
  const createMutation = useCreateDedication();

  const [step, setStep] = useState(1);
  const [occasionType, setOccasionType] = useState<OccasionType | null>(null);
  const [name, setName] = useState('');
  const [parentName, setParentName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [creatorName, setCreatorName] = useState('');
  const [parentType, setParentType] = useState<'mother' | 'father'>('father');

  const occasion = OCCASIONS.find(o => o.type === occasionType);
  const needsParent = occasion?.parentLabel !== null;
  // For ilui_nishmat: user can choose mother/father. Others: always mother.
  const effectiveParentType = occasionType === 'ilui_nishmat' ? parentType : 'mother';

  const previewText = occasionType
    ? needsParent && parentName
      ? `${OCCASION_PREFIX[occasionType]} ${name} ${gender === 'female' ? 'בת' : 'בן'} ${parentName}`
      : `${OCCASION_PREFIX[occasionType]} ${name}`
    : '';

  const handleSubmit = async () => {
    if (!occasionType || !name) return;

    if (creatorName) {
      setParticipantName(creatorName);
    }

    try {
      const result = await createMutation.mutateAsync({
        occasion_type: occasionType,
        name,
        parent_name: parentName || undefined,
        gender,
        creator_name: creatorName || undefined,
      });
      navigate(`/dedicate/${result.id}?new=1`);
    } catch {
      // error handled by mutation state
    }
  };

  return (
    <div className="fade-in max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          הקדשה קבוצתית
        </h1>
        <p
          className="text-sm"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-muted)' }}
        >
          השלימו יחד את כל 150 פרקי תהילים
        </p>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className="w-8 h-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor: s <= step ? 'var(--color-accent)' : 'var(--border-color)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Occasion type */}
      {step === 1 && (
        <div className="fade-in">
          <h2
            className="text-lg font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            בחרו את סוג ההקדשה
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {OCCASIONS.map(o => (
              <button
                key={o.type}
                onClick={() => { setOccasionType(o.type); setStep(2); }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer border-0 transition-all duration-200 hover:scale-[1.03] active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 2px 8px var(--shadow-color)',
                }}
              >
                <span className="text-3xl">{o.icon}</span>
                <span
                  className="text-sm font-medium"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
                >
                  {o.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Name details */}
      {step === 2 && occasionType && (
        <div className="fade-in">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1 mb-4 px-3 py-1.5 rounded-lg cursor-pointer border-0 text-sm"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            ← חזרה
          </button>

          <div
            className="rounded-2xl p-5 mb-6"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 8px var(--shadow-color)',
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="text-2xl">{occasion?.icon}</span>
              <h3
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                {occasion?.label}
              </h3>
            </div>

            {/* Name input */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}
              >
                שם
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="הכניסו שם"
                className="w-full px-4 py-3 rounded-xl text-base border-0 outline-none"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                  border: '1px solid var(--border-color)',
                }}
                dir="rtl"
              />
            </div>

            {/* Gender toggle */}
            {needsParent && (
              <>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}
                  >
                    מגדר
                  </label>
                  <div className="flex gap-2">
                    {([['male', 'בן'], ['female', 'בת']] as const).map(([g, label]) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className="flex-1 py-2.5 rounded-xl cursor-pointer border-0 text-sm font-medium transition-all"
                        style={{
                          backgroundColor: gender === g ? 'var(--color-primary)' : 'var(--bg-primary)',
                          color: gender === g ? 'var(--color-accent)' : 'var(--text-muted)',
                          fontFamily: 'var(--font-heading)',
                          border: `1px solid ${gender === g ? 'var(--color-primary)' : 'var(--border-color)'}`,
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parent type toggle — only for ilui_nishmat */}
                {occasionType === 'ilui_nishmat' && (
                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}
                    >
                      שם ההורה
                    </label>
                    <div className="flex gap-2">
                      {([['father', 'שם האב'], ['mother', 'שם האם']] as const).map(([pt, label]) => (
                        <button
                          key={pt}
                          onClick={() => setParentType(pt)}
                          className="flex-1 py-2.5 rounded-xl cursor-pointer border-0 text-sm font-medium transition-all"
                          style={{
                            backgroundColor: parentType === pt ? 'var(--color-primary)' : 'var(--bg-primary)',
                            color: parentType === pt ? 'var(--color-accent)' : 'var(--text-muted)',
                            fontFamily: 'var(--font-heading)',
                            border: `1px solid ${parentType === pt ? 'var(--color-primary)' : 'var(--border-color)'}`,
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Parent name */}
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}
                  >
                    {effectiveParentType === 'father' ? 'שם האב' : 'שם האם'}
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    placeholder={effectiveParentType === 'father' ? 'שם האב' : 'שם האם'}
                    className="w-full px-4 py-3 rounded-xl text-base border-0 outline-none"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-heading)',
                      border: '1px solid var(--border-color)',
                    }}
                    dir="rtl"
                  />
                </div>
              </>
            )}

            {/* Creator name */}
            <div className="mb-2">
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}
              >
                השם שלך (לא חובה)
              </label>
              <input
                type="text"
                value={creatorName}
                onChange={e => setCreatorName(e.target.value)}
                placeholder="מי יוצר את ההקדשה?"
                className="w-full px-4 py-3 rounded-xl text-base border-0 outline-none"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                  border: '1px solid var(--border-color)',
                }}
                dir="rtl"
              />
            </div>
          </div>

          <button
            onClick={() => setStep(3)}
            disabled={!name}
            className="w-full py-3.5 rounded-xl font-bold cursor-pointer border-0 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-heading)',
              fontSize: '16px',
            }}
          >
            המשך
          </button>
        </div>
      )}

      {/* Step 3: Preview & Submit */}
      {step === 3 && (
        <div className="fade-in">
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-1 mb-4 px-3 py-1.5 rounded-lg cursor-pointer border-0 text-sm"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            ← חזרה
          </button>

          {/* Dedication preview card */}
          <div
            className="rounded-2xl overflow-hidden mb-6"
            style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #142842 100%)',
              boxShadow: '0 8px 32px rgba(30,58,95,0.3)',
            }}
          >
            <div className="p-8 text-center">
              <span className="text-4xl mb-4 block">{occasion?.icon}</span>
              <p
                className="text-2xl font-bold mb-2 leading-relaxed"
                style={{
                  color: '#d4a843',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.8,
                }}
              >
                {previewText}
              </p>
              <div className="flex justify-center mt-4">
                <div className="flex gap-1.5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: 'rgba(212,168,67,0.4)' }}
                    />
                  ))}
                </div>
              </div>
              <p
                className="text-sm mt-4"
                style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-heading)' }}
              >
                150 פרקי תהילים
              </p>
            </div>
          </div>

          {createMutation.isError && (
            <div
              className="rounded-xl p-3 mb-4 text-center text-sm"
              style={{
                backgroundColor: 'rgba(220,38,38,0.1)',
                color: '#dc2626',
                fontFamily: 'var(--font-heading)',
              }}
            >
              שגיאה ביצירת ההקדשה. נסו שוב.
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="w-full py-4 rounded-xl font-bold cursor-pointer border-0 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-heading)',
              fontSize: '17px',
              boxShadow: '0 4px 16px rgba(212,168,67,0.3)',
            }}
          >
            {createMutation.isPending ? 'יוצר...' : 'צור הקדשה'}
          </button>
        </div>
      )}
    </div>
  );
}
