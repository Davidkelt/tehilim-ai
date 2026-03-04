export function ChapterGridSkeleton() {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
      {Array.from({ length: 30 }, (_, i) => (
        <div key={i} className="skeleton h-12 rounded-xl" />
      ))}
    </div>
  );
}

export function ChapterViewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-10 w-48 mx-auto" />
      <div className="space-y-3 mt-8">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton h-8" style={{ width: `${70 + Math.random() * 30}%` }} />
        ))}
      </div>
    </div>
  );
}

export function AnalysisSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div className="skeleton h-6 w-32" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
      </div>
      <div className="skeleton h-6 w-32" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </div>
  );
}

export function DailyPsalmSkeleton() {
  return (
    <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: 'var(--bg-card)' }}>
      <div className="skeleton h-8 w-48" />
      <div className="skeleton h-6 w-full" />
      <div className="skeleton h-6 w-3/4" />
      <div className="skeleton h-10 w-32 mt-4" />
    </div>
  );
}
