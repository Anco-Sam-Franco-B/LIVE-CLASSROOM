import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';
import Pricing from '../pages/public/Pricing';
import Features from '../pages/public/Features';
import FAQ from '../pages/public/FAQ';
import Blog from '../pages/public/Blog';
import CourseCatalog from '../pages/public/CourseCatalog';
import CourseDetail from '../pages/public/CourseDetail';
import TeacherProfiles from '../pages/public/TeacherProfiles';
import PrivacyPolicy from '../pages/public/PrivacyPolicy';
import TermsConditions from '../pages/public/TermsConditions';
import NotFound from '../pages/public/NotFound';
import CertificateVerify from '../pages/public/CertificateVerify';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import VerifyEmail from '../pages/auth/VerifyEmail';
import TwoFactor from '../pages/auth/TwoFactor';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import MyCourses from '../pages/student/MyCourses';
import CourseLearning from '../pages/student/CourseLearning';
import LiveClasses from '../pages/student/LiveClasses';
import Assignments from '../pages/student/Assignments';
import Quizzes from '../pages/student/Quizzes';
import QuizAttempt from '../pages/student/QuizAttempt';
import QuizResults from '../pages/student/QuizResults';
import Grades from '../pages/student/Grades';
import Attendance from '../pages/student/Attendance';
import Certificates from '../pages/student/Certificates';
import Messages from '../pages/student/Messages';
import Payment from '../pages/student/Payment';
import PaymentHistory from '../pages/student/PaymentHistory';
import StudentSettings from '../pages/student/StudentSettings';
import StudentAnnouncements from '../pages/student/StudentAnnouncements';
import StudentCourseCatalog from '../pages/student/StudentCourseCatalog';
import StudentCourseDetail from '../pages/student/StudentCourseDetail';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeacherCourses from '../pages/teacher/TeacherCourses';
import CreateCourse from '../pages/teacher/CreateCourse';
import EditCourse from '../pages/teacher/EditCourse';
import TeacherMeetings from '../pages/teacher/TeacherMeetings';
import TeacherAssignments from '../pages/teacher/TeacherAssignments';
import TeacherQuizzes from '../pages/teacher/TeacherQuizzes';
import TeacherStudents from '../pages/teacher/TeacherStudents';
import TeacherReports from '../pages/teacher/TeacherReports';
import TeacherSettings from '../pages/teacher/TeacherSettings';
import TeacherAnnouncements from '../pages/teacher/TeacherAnnouncements';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import CourseManagement from '../pages/admin/CourseManagement';
import CertificateManagement from '../pages/admin/CertificateManagement';
import PaymentManagement from '../pages/admin/PaymentManagement';
import SystemSettings from '../pages/admin/SystemSettings';
import RoleManagement from '../pages/admin/RoleManagement';
import AuditLogs from '../pages/admin/AuditLogs';
import AdminReports from '../pages/admin/AdminReports';
import AdminMeetings from '../pages/admin/AdminMeetings';
import CertificateTemplates from '../pages/admin/CertificateTemplates';
import AdminAnnouncements from '../pages/admin/AdminAnnouncements';
import CategoriesManagement from '../pages/admin/CategoriesManagement';
import CmsContent from '../pages/admin/CmsContent';

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'pricing', element: <Pricing /> },
      { path: 'features', element: <Features /> },
      { path: 'faq', element: <FAQ /> },
      { path: 'blog', element: <Blog /> },
      { path: 'courses', element: <CourseCatalog /> },
      { path: 'courses/:slug', element: <CourseDetail /> },
      { path: 'teachers', element: <TeacherProfiles /> },
      { path: 'privacy-policy', element: <PrivacyPolicy /> },
      { path: 'terms-conditions', element: <TermsConditions /> },
      { path: 'login', element: <PublicRoute><Login /></PublicRoute> },
      { path: 'register', element: <PublicRoute><Register /></PublicRoute> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password', element: <ResetPassword /> },
      { path: 'verify-email', element: <VerifyEmail /> },
      { path: 'two-factor', element: <TwoFactor /> },
      { path: 'certificates/verify/:number', element: <CertificateVerify /> },
      { path: '*', element: <NotFound /> },
    ],
  },

  // Student Routes
  {
    path: '/student',
    element: <ProtectedRoute roles={['student']}><DashboardLayout role="student" /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <StudentDashboard /> },
      { path: 'courses', element: <MyCourses /> },
      { path: 'courses/browse', element: <StudentCourseCatalog /> },
      { path: 'courses/:courseId', element: <StudentCourseDetail /> },
      { path: 'courses/:courseId/learn', element: <CourseLearning /> },
      { path: 'live-classes', element: <LiveClasses /> },
      { path: 'assignments', element: <Assignments /> },
      { path: 'quizzes', element: <Quizzes /> },
      { path: 'quizzes/:quizId/attempt', element: <QuizAttempt /> },
      { path: 'quizzes/results/:attemptId', element: <QuizResults /> },
      { path: 'grades', element: <Grades /> },
      { path: 'attendance', element: <Attendance /> },
      { path: 'certificates', element: <Certificates /> },
      { path: 'messages', element: <Messages /> },
      { path: 'payments', element: <PaymentHistory /> },
      { path: 'payment', element: <Payment /> },
      { path: 'announcements', element: <StudentAnnouncements /> },
      { path: 'settings', element: <StudentSettings /> },
      { path: '*', element: <NotFound /> },
    ],
  },

  // Teacher Routes
  {
    path: '/teacher',
    element: <ProtectedRoute roles={['teacher']}><DashboardLayout role="teacher" /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <TeacherDashboard /> },
      { path: 'courses', element: <TeacherCourses /> },
      { path: 'courses/create', element: <CreateCourse /> },
      { path: 'courses/:courseId/edit', element: <EditCourse /> },
      { path: 'meetings', element: <TeacherMeetings /> },
      { path: 'assignments', element: <TeacherAssignments /> },
      { path: 'quizzes', element: <TeacherQuizzes /> },
      { path: 'categories', element: <CategoriesManagement /> },
      { path: 'announcements', element: <TeacherAnnouncements /> },
      { path: 'students', element: <TeacherStudents /> },
      { path: 'reports', element: <TeacherReports /> },
      { path: 'settings', element: <TeacherSettings /> },
      { path: '*', element: <NotFound /> },
    ],
  },

  // Admin Routes
  {
    path: '/admin',
    element: <ProtectedRoute roles={['super-admin', 'admin']}><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'courses', element: <CourseManagement /> },
      { path: 'certificates', element: <CertificateManagement /> },
      { path: 'payments', element: <PaymentManagement /> },
      { path: 'meetings', element: <AdminMeetings /> },
      { path: 'certificate-templates', element: <CertificateTemplates /> },
      { path: 'categories', element: <CategoriesManagement /> },
      { path: 'announcements', element: <AdminAnnouncements /> },
      { path: 'roles', element: <RoleManagement /> },
      { path: 'settings', element: <SystemSettings /> },
      { path: 'cms', element: <CmsContent /> },
      { path: 'audit-logs', element: <AuditLogs /> },
      { path: 'reports', element: <AdminReports /> },
      { path: '*', element: <NotFound /> },
    ],
  },

]);
