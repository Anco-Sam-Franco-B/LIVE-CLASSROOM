import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };
const colors = {
  success: { bg: 'rgba(0,255,65,0.1)', border: 'rgba(0,255,65,0.3)', text: 'var(--neon)' },
  error: { bg: 'rgba(255,50,50,0.1)', border: 'rgba(255,50,50,0.3)', text: '#ff3232' },
  warning: { bg: 'rgba(255,200,0,0.1)', border: 'rgba(255,200,0,0.3)', text: '#ffc800' },
  info: { bg: 'rgba(0,150,255,0.1)', border: 'rgba(0,150,255,0.3)', text: '#0096ff' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map(t => {
          const Icon = icons[t.type];
          const c = colors[t.type];
          return (
            <div key={t.id} className="flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-in backdrop-blur-xl"
              style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
              <Icon size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="shrink-0 hover:opacity-70" style={{ color: c.text }}><X size={16} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default function Toast({ type = 'info', message, onClose }) {
  const Icon = icons[type] || Info;
  const c = colors[type];
  return (
    <div className="fixed top-4 right-4 z-50 flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-in backdrop-blur-xl"
      style={{ background: c.bg, borderColor: c.border, color: c.text }}>
      <Icon size={20} className="shrink-0 mt-0.5" />
      <p className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{message}</p>
      {onClose && <button onClick={onClose} className="shrink-0 hover:opacity-70"><X size={16} /></button>}
    </div>
  );
}
