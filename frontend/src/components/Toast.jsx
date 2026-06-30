import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };
const colors = { success: 'bg-green-50 border-green-200 text-green-800', error: 'bg-red-50 border-red-200 text-red-800', warning: 'bg-orange-50 border-orange-200 text-orange-800', info: 'bg-blue-50 border-blue-200 text-blue-800' };
const iconColors = { success: 'text-green-500', error: 'text-red-500', warning: 'text-orange-500', info: 'text-blue-500' };

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
          return (
            <div key={t.id} className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-in ${colors[t.type]}`}>
              <Icon size={20} className={`shrink-0 mt-0.5 ${iconColors[t.type]}`} />
              <p className="text-sm flex-1">{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="shrink-0 hover:opacity-70"><X size={16} /></button>
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
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-in ${colors[type]}`}>
      <Icon size={20} className={`shrink-0 mt-0.5 ${iconColors[type]}`} />
      <p className="text-sm flex-1">{message}</p>
      {onClose && <button onClick={onClose} className="shrink-0 hover:opacity-70"><X size={16} /></button>}
    </div>
  );
}
