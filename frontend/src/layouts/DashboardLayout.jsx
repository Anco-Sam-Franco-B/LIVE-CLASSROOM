import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, BookOpen, Video, FileText, ClipboardList, GraduationCap, CalendarCheck, Award, MessageSquare, CreditCard, Settings, LogOut, Bell, Menu, X, Users, CheckSquare, BarChart3, UserCheck, Megaphone, Tags, Search } from 'lucide-react';
import useAuthStore from '../store/authStore';

const studentNav = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/courses', icon: BookOpen, label: 'My Courses' },
  { to: '/student/courses/browse', icon: Search, label: 'Course Catalog' },
  { to: '/student/live-classes', icon: Video, label: 'Live Classes' },
  { to: '/student/assignments', icon: FileText, label: 'Assignments' },
  { to: '/student/quizzes', icon: ClipboardList, label: 'Quizzes' },
  { to: '/student/grades', icon: GraduationCap, label: 'Grades' },
  { to: '/student/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/student/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/student/certificates', icon: Award, label: 'Certificates' },
  { to: '/student/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/student/payments', icon: CreditCard, label: 'Payments' },
  { to: '/student/settings', icon: Settings, label: 'Settings' },
];

const teacherNav = [
  { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teacher/courses', icon: BookOpen, label: 'My Courses' },
  { to: '/teacher/categories', icon: Tags, label: 'Categories' },
  { to: '/teacher/meetings', icon: Video, label: 'Meetings' },
  { to: '/teacher/assignments', icon: FileText, label: 'Assignments' },
  { to: '/teacher/quizzes', icon: ClipboardList, label: 'Quizzes' },
  { to: '/teacher/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/teacher/students', icon: Users, label: 'Students' },
  { to: '/teacher/reports', icon: BarChart3, label: 'Reports' },
  { to: '/teacher/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navItems = role === 'teacher' ? teacherNav : studentNav;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LC</span>
            </div>
            <span className="font-bold text-gray-900">Live Class</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.to || location.pathname.startsWith(item.to + '/') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
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
            <Link to={`/${role}/settings`} className="flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-700 font-medium text-sm">{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
              </div>
              <span className="hidden sm:block font-medium text-gray-700">{user?.first_name} {user?.last_name}</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
