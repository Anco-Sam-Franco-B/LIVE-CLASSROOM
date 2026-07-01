import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }) {
  const [local, setLocal] = useState(value || '');
  const debounced = useDebounce(local, 300);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    onChange(debounced);
  }, [debounced]);

  useEffect(() => { setLocal(value || ''); }, [value]);

  return (
    <div className={`relative ${className}`}>
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
      <input type="text" value={local} onChange={e => setLocal(e.target.value)} className="neon-input pl-10 pr-10" placeholder={placeholder} />
      {local && <button onClick={() => setLocal('')} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><X size={16} /></button>}
    </div>
  );
}
