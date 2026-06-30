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
          <h2 className="text-3xl font-bold text-gray-900">Verify Email</h2>
          <p className="mt-2 text-gray-600">Enter the verification code sent to {email}</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-6">
          {message && <div className={`px-4 py-3 rounded-lg text-sm ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
            <input type="text" required value={code} onChange={e => setCode(e.target.value)} className="input-field text-center text-2xl tracking-widest" placeholder="000000" maxLength={6} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Verifying...' : 'Verify Email'}</button>
          <div className="text-center">
            {cooldown > 0 ? (
              <span className="text-sm text-gray-400">Resend code in {cooldown}s</span>
            ) : (
              <button type="button" onClick={handleResend} disabled={resending || !email} className="text-sm text-indigo-600 hover:text-indigo-500 font-medium inline-flex items-center space-x-1">
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
