import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
        <ChevronLeft size={16} />
      </button>
      {start > 1 && <span className="text-gray-400 px-1">...</span>}
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)} className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-indigo-600 text-white' : 'border border-gray-300 hover:bg-gray-50 text-gray-700'}`}>
          {p}
        </button>
      ))}
      {end < totalPages && <span className="text-gray-400 px-1">...</span>}
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
