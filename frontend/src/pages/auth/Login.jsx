import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loadPermissions } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      if (data.data?.requiresTwoFactor) {
        navigate('/two-factor', { state: { userId: data.data.userId } });
        return;
      }
      login(data.data);
      await loadPermissions();
      const dashboards = { 'super-admin': '/admin/dashboard', admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' };
      navigate(dashboards[data.data.user.role_slug] || '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="neon-card space-y-6">
          {error && <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4444' }}>{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="neon-input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="neon-input" placeholder="Enter your password" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={form.rememberMe} onChange={e => setForm({ ...form, rememberMe: e.target.checked })} className="rounded" style={{ borderColor: 'var(--border-neon)', color: 'var(--neon)' }} />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm" style={{ color: 'var(--neon)' }}>Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="neon-btn w-full" style={{ background: 'var(--neon)', color: '#fff' }}>{loading ? 'Signing in...' : 'Sign In'}</button>
          <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account? <Link to="/register" className="font-medium" style={{ color: 'var(--neon)' }}>Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
