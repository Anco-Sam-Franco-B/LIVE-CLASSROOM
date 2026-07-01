import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword(email);
      setMessage(data.message || 'Reset link sent to your email');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Forgot Password</h2>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Enter your email to receive reset instructions</p>
        </div>
        <form onSubmit={handleSubmit} className="neon-card space-y-6">
          {message && <div className="px-4 py-3 rounded-lg text-sm" style={{ background: message.includes('Failed') ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,65,0.1)', color: message.includes('Failed') ? '#ff4444' : 'var(--neon)' }}>{message}</div>}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="neon-input" placeholder="you@example.com" />
          </div>
          <button type="submit" disabled={loading} className="neon-btn w-full" style={{ background: 'var(--neon)', color: '#fff' }}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
          <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Link to="/login" style={{ color: 'var(--neon)' }}>Back to login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
