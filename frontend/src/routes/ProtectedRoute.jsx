import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role_slug)) {
    const dashboardMap = {
      'super-admin': '/admin/dashboard',
      'admin': '/admin/dashboard',
      'teacher': '/teacher/dashboard',
      'student': '/student/dashboard',
    };
    return <Navigate to={dashboardMap[user.role_slug] || '/'} replace />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    const dashboardMap = {
      'super-admin': '/admin/dashboard',
      'admin': '/admin/dashboard',
      'teacher': '/teacher/dashboard',
      'student': '/student/dashboard',
    };
    return <Navigate to={dashboardMap[user.role_slug] || '/student/dashboard'} replace />;
  }
  return children;
}
