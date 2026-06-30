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
          <h2 className="text-3xl font-bold text-gray-900">Forgot Password</h2>
          <p className="mt-2 text-gray-600">Enter your email to receive reset instructions</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-6">
          {message && <div className={`px-4 py-3 rounded-lg text-sm ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send Reset Link'}</button>
          <p className="text-center text-sm text-gray-600">
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500">Back to login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
