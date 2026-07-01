export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="neon-card overflow-hidden animate-pulse p-0" style={{ background: 'var(--bg-card)' }}>
      <div className="p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="h-4 neon-skeleton w-1/4" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((__, j) => (
              <div key={j} className="h-4 neon-skeleton flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="neon-card animate-pulse p-0 overflow-hidden">
          <div className="h-40 neon-skeleton rounded-t-lg mb-4" />
          <div className="space-y-3 p-4">
            <div className="h-5 neon-skeleton w-3/4" />
            <div className="h-4 neon-skeleton w-1/2" />
            <div className="h-4 neon-skeleton w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="neon-card flex items-center gap-4 p-4">
          <div className="w-10 h-10 rounded-full neon-skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-4 neon-skeleton w-1/3" />
            <div className="h-3 neon-skeleton w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="neon-stat-card p-4">
          <div className="h-3 neon-skeleton w-1/2 mb-2" />
          <div className="h-8 neon-skeleton w-1/3" />
        </div>
      ))}
    </div>
  );
}
