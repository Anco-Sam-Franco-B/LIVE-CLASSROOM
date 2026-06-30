import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LC</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Live Class Code</span>
              </Link>
              <div className="hidden md:flex ml-10 space-x-1">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === link.to ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <Link to={getDashboardLink()} className="btn-primary text-sm">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2">Log In</Link>
                  <Link to="/register" className="btn-primary text-sm">Get Started</Link>
                </>
              )}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900">
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">{link.label}</Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LC</span>
                </div>
                <span className="text-xl font-bold text-white">Live Class Code</span>
              </div>
              <p className="text-sm">Empowering education through technology. Learn anytime, anywhere.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/courses" className="hover:text-white">Courses</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms-conditions" className="hover:text-white">Terms & Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>info@liveclasscode.com</li>
                <li>+256 700 000 000</li>
                <li>Kampala, Uganda</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Live Class Code. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
