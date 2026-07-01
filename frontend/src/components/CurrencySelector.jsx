import { useState } from 'react';
import { DollarSign, Check } from 'lucide-react';
import { getPreferredCurrency, setPreferredCurrency, CURRENCIES } from '../utils/currency';

export default function CurrencySelector({ onCurrencyChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState(getPreferredCurrency());

  const handleSelect = (cur) => {
    setCurrency(cur);
    setPreferredCurrency(cur);
    setOpen(false);
    if (onCurrencyChange) onCurrencyChange(cur);
  };

  return (
    <div className={`relative ${className}`}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
        style={{ border: '1px solid var(--border-neon)', color: 'var(--text-secondary)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,65,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <DollarSign size={14} />
        <span className="font-medium">{currency}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 rounded-lg shadow-lg z-20 py-1 min-w-[100px]"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-neon)' }}>
            {CURRENCIES.map((cur) => (
              <button key={cur} onClick={() => handleSelect(cur)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors"
                style={{ color: currency === cur ? 'var(--neon)' : 'var(--text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,65,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span>{cur === 'UGX' ? 'UGX (Shilling)' : cur === 'USD' ? 'USD (Dollar)' : 'EUR (Euro)'}</span>
                {currency === cur && <Check size={14} style={{ color: 'var(--neon)' }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
