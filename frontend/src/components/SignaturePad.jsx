import { useRef, useState, useEffect, useCallback } from 'react';
import { Pen, RotateCcw, Undo2, Check, Trash2 } from 'lucide-react';

export default function SignaturePad({ onSave, onCancel, width = 500, height = 180 }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState('#1a1a2e');
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
    ctx.fillStyle = '#ffffff';
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

  const stopDraw = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    undoStack.current.push(canvas.toDataURL());
    ctx.fillStyle = '#ffffff';
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Pen size={16} className="text-indigo-500" />
          <span className="font-medium">Draw Signature</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500">Size:</label>
            <input type="range" min="1" max="6" step="0.5" value={strokeWidth} onChange={e => setStrokeWidth(parseFloat(e.target.value))} className="w-16 h-1.5 accent-indigo-600" />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500">Color:</label>
            <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="h-6 w-8 rounded border border-gray-300 cursor-pointer p-0" />
          </div>
        </div>
      </div>

      <div className="relative bg-white" style={{ width, height }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-gray-300 text-sm italic font-light">Sign here</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-1">
          <button type="button" onClick={undo} disabled={undoStack.current.length === 0} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Undo">
            <Undo2 size={15} />
          </button>
          <button type="button" onClick={clearCanvas} disabled={!hasSignature} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Clear">
            <Trash2 size={15} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-sm px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          )}
          <button type="button" onClick={handleSave} disabled={!hasSignature || saving} className="btn-indigo text-sm px-4 py-1.5 rounded-lg inline-flex items-center gap-1.5 disabled:opacity-50">
            <Check size={15} />
            {saving ? 'Saving...' : 'Use Signature'}
          </button>
        </div>
      </div>
    </div>
  );
}
