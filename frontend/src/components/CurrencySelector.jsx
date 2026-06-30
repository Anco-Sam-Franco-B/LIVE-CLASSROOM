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
      <button onClick={() => setOpen(!open)} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
        <DollarSign size={14} />
        <span className="font-medium">{currency}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1 min-w-[100px]">
            {CURRENCIES.map((cur) => (
              <button key={cur} onClick={() => handleSelect(cur)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${currency === cur ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}>
                <span>{cur === 'UGX' ? 'UGX (Shilling)' : cur === 'USD' ? 'USD (Dollar)' : 'EUR (Euro)'}</span>
                {currency === cur && <Check size={14} className="text-indigo-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
