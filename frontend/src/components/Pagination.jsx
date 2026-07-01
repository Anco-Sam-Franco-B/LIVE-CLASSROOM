import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
        className="p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ border: '1px solid var(--border-neon)', color: 'var(--text-secondary)' }}
        onMouseEnter={e => !page <= 1 && (e.currentTarget.style.background = 'rgba(0,255,65,0.05)')}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <ChevronLeft size={16} />
      </button>
      {start > 1 && <span style={{ color: 'var(--text-muted)' }} className="px-1">...</span>}
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
          style={p === page ? { background: 'var(--neon)', color: '#000' } : { border: '1px solid var(--border-neon)', color: 'var(--text-secondary)' }}
          onMouseEnter={e => { if (p !== page) e.currentTarget.style.background = 'rgba(0,255,65,0.05)'; }}
          onMouseLeave={e => { if (p !== page) e.currentTarget.style.background = 'transparent'; }}>
          {p}
        </button>
      ))}
      {end < totalPages && <span style={{ color: 'var(--text-muted)' }} className="px-1">...</span>}
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}
        className="p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ border: '1px solid var(--border-neon)', color: 'var(--text-secondary)' }}
        onMouseEnter={e => !page >= totalPages && (e.currentTarget.style.background = 'rgba(0,255,65,0.05)')}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
