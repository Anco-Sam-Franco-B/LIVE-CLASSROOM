import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirm', message = 'Are you sure?', confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger' }) {
  if (!isOpen) return null;

  const ConfirmBtn = variant === 'danger' ? 'neon-btn-danger' : 'neon-btn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="glass rounded-xl shadow-2xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-neon)' }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,50,50,0.1)' }}>
              <AlertTriangle size={20} style={{ color: '#ff3232' }} />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }} className="hover:text-white"><X size={20} /></button>
        </div>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="neon-btn-ghost">{cancelText}</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={ConfirmBtn}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
