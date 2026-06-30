import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Users, BookOpen, CreditCard, Video, Shield, Settings, FileText, BarChart3, Megaphone, Award, ScrollText, LogOut, Bell, Menu, X, Tags } from 'lucide-react';
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
  { to: '/admin/roles', icon: Shield, label: 'Roles & Permissions' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
  { to: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LC</span>
            </div>
            <span className="font-bold">Live Class</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <nav className="mt-4 px-3 space-y-1">
          {adminNav.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.to ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button onClick={logout} className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-gray-800 transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:px-8 sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 mr-3">
            <Menu size={24} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative">
              <Bell size={20} />
            </button>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-700 font-medium text-sm">A</span>
              </div>
              <span className="hidden sm:block font-medium text-gray-700">{user?.first_name} {user?.last_name}</span>
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
