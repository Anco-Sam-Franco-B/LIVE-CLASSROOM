import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = searchParams.get('token');
      await authAPI.resetPassword({ token, password });
      navigate('/login', { state: { message: 'Password reset successful. Please login.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Reset Password</h2>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Enter your new password</p>
        </div>
        <form onSubmit={handleSubmit} className="neon-card space-y-6">
          {error && <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4444' }}>{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>New Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="neon-input" placeholder="Min 8 characters" />
          </div>
          <button type="submit" disabled={loading} className="neon-btn w-full" style={{ background: 'var(--neon)', color: '#fff' }}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
      </div>
    </div>
  );
}
