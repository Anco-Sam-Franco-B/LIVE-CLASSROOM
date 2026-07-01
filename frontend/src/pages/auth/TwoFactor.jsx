import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function TwoFactor() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { login, loadPermissions } = useAuthStore();
  const userId = location.state?.userId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.verifyTwoFactor({ userId, code });
      login(data.data);
      await loadPermissions();
      const dashboards = { 'super-admin': '/admin/dashboard', admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' };
      navigate(dashboards[data.data.user.role_slug] || '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Two-Factor Auth</h2>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Enter the code from your authenticator app</p>
        </div>
        <form onSubmit={handleSubmit} className="neon-card space-y-6">
          {error && <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4444' }}>{error}</div>}
          <div>
            <input type="text" required value={code} onChange={e => setCode(e.target.value)} className="neon-input text-center text-2xl tracking-widest" placeholder="000000" maxLength={6} />
          </div>
          <button type="submit" disabled={loading} className="neon-btn w-full" style={{ background: 'var(--neon)', color: '#fff' }}>{loading ? 'Verifying...' : 'Verify Code'}</button>
        </form>
      </div>
    </div>
  );
}
