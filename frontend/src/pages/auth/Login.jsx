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
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-6">
          {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="Enter your password" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input type="checkbox" checked={form.rememberMe} onChange={e => setForm({ ...form, rememberMe: e.target.checked })} className="rounded border-gray-300 text-indigo-600" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in...' : 'Sign In'}</button>
          <p className="text-center text-sm text-gray-600">
            Don't have an account? <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
