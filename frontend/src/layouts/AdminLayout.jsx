import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Users, BookOpen, CreditCard, Video, Shield, Settings, FileText, BarChart3, Megaphone, Award, ScrollText, LogOut, Bell, Menu, X, Tags, Globe } from 'lucide-react';
import useAuthStore from '../store/authStore';

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/certificates', icon: ScrollText, label: 'Certificates' },
  { to: '/admin/categories', icon: Tags, label: 'Categories' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/meetings', icon: Video, label: 'Meetings' },
  { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/admin/certificate-templates', icon: Award, label: 'Cert. Templates' },
  { to: '/admin/cms', icon: Globe, label: 'CMS Content' },
  { to: '/admin/roles', icon: Shield, label: 'Roles & Permissions' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
  { to: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (to) => location.pathname === to;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-dark)' }}>
      <div className="neon-grid-bg" />
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}
        style={{ background: 'var(--bg-dark-secondary)', borderRight: '1px solid rgba(0,255,65,0.15)' }}>
        <div className="flex items-center justify-between h-16 px-6" style={{ borderBottom: '1px solid rgba(0,255,65,0.1)' }}>
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--neon)' }}>
              <span className="font-bold text-sm" style={{ color: '#000' }}>LC</span>
            </div>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Live Class</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <nav className="mt-4 px-3 space-y-1 flex-1 overflow-y-auto">
          {adminNav.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={`neon-sidebar-link ${isActive(item.to) ? 'active' : ''}`}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 shrink-0" style={{ borderTop: '1px solid rgba(0,255,65,0.1)' }}>
          <button onClick={logout} className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ color: '#ff3232' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,50,50,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-16 flex items-center px-4 lg:px-8 sticky top-0 z-40 glass border-b" style={{ borderColor: 'var(--border-neon)' }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white mr-3">
            <Menu size={24} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 relative">
              <Bell size={20} />
            </button>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,255,65,0.15)', color: 'var(--neon)' }}>
                <span className="font-medium text-sm">A</span>
              </div>
              <span className="hidden sm:block font-medium" style={{ color: 'var(--text-secondary)' }}>{user?.first_name} {user?.last_name}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
