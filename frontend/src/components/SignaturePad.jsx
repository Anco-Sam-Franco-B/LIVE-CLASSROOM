import { useRef, useState, useEffect, useCallback } from 'react';
import { Pen, RotateCcw, Undo2, Check, Trash2 } from 'lucide-react';

export default function SignaturePad({ onSave, onCancel, width = 500, height = 180 }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState('#00ff41');
  const [saving, setSaving] = useState(false);
  const undoStack = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.fillStyle = '#1a1a25';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
  }, [strokeColor, strokeWidth]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    undoStack.current.push(canvas.toDataURL());
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasSignature(true);
  }, []);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing]);

  const stopDraw = useCallback(() => { setIsDrawing(false); }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    undoStack.current.push(canvas.toDataURL());
    ctx.fillStyle = '#1a1a25';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const undo = () => {
    if (undoStack.current.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const prev = undoStack.current.pop();
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setHasSignature(true);
    };
    img.src = prev;
  };

  const handleSave = async () => {
    if (!hasSignature) return;
    setSaving(true);
    try {
      const canvas = canvasRef.current;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'signature.png', { type: 'image/png' });
      onSave(file);
    } catch (err) {
      console.error('Signature save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="neon-card overflow-hidden p-0">
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid var(--border-neon)', background: 'var(--bg-dark-secondary)' }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Pen size={16} style={{ color: 'var(--neon)' }} />
          <span className="font-medium">Draw Signature</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Size:</label>
            <input type="range" min="1" max="6" step="0.5" value={strokeWidth} onChange={e => setStrokeWidth(parseFloat(e.target.value))}
              className="w-16 h-1.5" style={{ accentColor: 'var(--neon)' }} />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Color:</label>
            <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)}
              className="h-6 w-8 rounded cursor-pointer p-0" style={{ border: '1px solid var(--border-neon)', background: 'var(--bg-dark-secondary)' }} />
          </div>
        </div>
      </div>

      <div className="relative" style={{ width, height, background: 'var(--bg-card)' }}>
        <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair touch-none"
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-sm italic font-light" style={{ color: 'var(--text-muted)' }}>Sign here</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: '1px solid var(--border-neon)', background: 'var(--bg-dark-secondary)' }}>
        <div className="flex items-center gap-1">
          <button type="button" onClick={undo} disabled={undoStack.current.length === 0}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { if (undoStack.current.length > 0) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Undo2 size={15} />
          </button>
          <button type="button" onClick={clearCanvas} disabled={!hasSignature}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { if (hasSignature) e.currentTarget.style.color = '#ff3232'; }}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <Trash2 size={15} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="neon-btn-ghost text-sm">Cancel</button>
          )}
          <button type="button" onClick={handleSave} disabled={!hasSignature || saving}
            className="neon-btn text-sm px-4 py-1.5 inline-flex items-center gap-1.5 disabled:opacity-50">
            <Check size={15} />
            {saving ? 'Saving...' : 'Use Signature'}
          </button>
        </div>
      </div>
    </div>
  );
}
