import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { RefreshCw } from 'lucide-react';

export default function VerifyEmail() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  useEffect(() => {
    if (cooldown > 0) {
      timer.current = setInterval(() => {
        setCooldown(prev => { if (prev <= 1) { clearInterval(timer.current); return 0; } return prev - 1; });
      }, 1000);
      return () => clearInterval(timer.current);
    }
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await authAPI.verifyEmail({ email, code });
      navigate('/login', { state: { message: 'Email verified successfully! Please login.' } });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resending || cooldown > 0) return;
    setResending(true);
    setMessage('');
    try {
      await authAPI.resendVerification(email);
      setMessage('New verification code sent!');
      setCooldown(60);
      setCode('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Verify Email</h2>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Enter the verification code sent to {email}</p>
        </div>
        <form onSubmit={handleSubmit} className="neon-card space-y-6">
          {message && <div className="px-4 py-3 rounded-lg text-sm" style={{ background: message.includes('Failed') ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,65,0.1)', color: message.includes('Failed') ? '#ff4444' : 'var(--neon)' }}>{message}</div>}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Verification Code</label>
            <input type="text" required value={code} onChange={e => setCode(e.target.value)} className="neon-input text-center text-2xl tracking-widest" placeholder="000000" maxLength={6} />
          </div>
          <button type="submit" disabled={loading} className="neon-btn w-full" style={{ background: 'var(--neon)', color: '#fff' }}>{loading ? 'Verifying...' : 'Verify Email'}</button>
          <div className="text-center">
            {cooldown > 0 ? (
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Resend code in {cooldown}s</span>
            ) : (
              <button type="button" onClick={handleResend} disabled={resending || !email} className="text-sm font-medium inline-flex items-center space-x-1" style={{ color: 'var(--neon)' }}>
                <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
                <span>{resending ? 'Sending...' : 'Resend code'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
