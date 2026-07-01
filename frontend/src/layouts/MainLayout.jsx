import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import useAuthStore from '../store/authStore';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/courses', label: 'Courses' },
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/teachers', label: 'Teachers' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  const getDashboardLink = () => {
    if (!user) return '/login';
    const map = { 'super-admin': '/admin/dashboard', admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' };
    return map[user.role_slug] || '/student/dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-dark)' }}>
      <div className="neon-grid-bg" />
      <nav className="glass sticky top-0 z-50 border-b" style={{ borderColor: 'var(--border-neon)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--neon)' }}>
                  <span className="font-bold text-sm" style={{ color: '#000' }}>LC</span>
                </div>
                <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Live Class Code</span>
              </Link>
              <div className="hidden md:flex ml-10 space-x-1">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === link.to ? 'neon-sidebar-link active' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <Link to={getDashboardLink()} className="neon-btn text-sm">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white px-4 py-2">Log In</Link>
                  <Link to="/register" className="neon-btn text-sm">Get Started</Link>
                </>
              )}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-md text-gray-400 hover:text-white">
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t" style={{ borderColor: 'var(--border-neon)' }}>
            <div className="px-4 py-3 space-y-1" style={{ background: 'var(--bg-dark-secondary)' }}>
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5">{link.label}</Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      <footer style={{ background: 'var(--bg-dark-secondary)', borderTop: '1px solid var(--border-neon)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--neon)' }}>
                  <span className="font-bold text-sm" style={{ color: '#000' }}>LC</span>
                </div>
                <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Live Class Code</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Empowering education through technology. Learn anytime, anywhere.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Links</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li><Link to="/about" className="hover:text-white hover:text-[var(--neon)]">About Us</Link></li>
                <li><Link to="/courses" className="hover:text-white hover:text-[var(--neon)]">Courses</Link></li>
                <li><Link to="/pricing" className="hover:text-white hover:text-[var(--neon)]">Pricing</Link></li>
                <li><Link to="/contact" className="hover:text-white hover:text-[var(--neon)]">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Support</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li><Link to="/faq" className="hover:text-white hover:text-[var(--neon)]">FAQ</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-white hover:text-[var(--neon)]">Privacy Policy</Link></li>
                <li><Link to="/terms-conditions" className="hover:text-white hover:text-[var(--neon)]">Terms & Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Contact</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li>info@liveclasscode.com</li>
                <li>+256 700 000 000</li>
                <li>Kampala, Uganda</li>
              </ul>
            </div>
          </div>
          <div className="neon-divider mt-8 mb-8" />
          <div className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            <p>&copy; {new Date().getFullYear()} Live Class Code. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
