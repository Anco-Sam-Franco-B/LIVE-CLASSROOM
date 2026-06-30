import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI, reportsAPI } from '../../services/api';
import { BookOpen, FileText, TrendingUp, Award, Clock, AlertCircle, DollarSign, Calendar } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { StatsSkeleton, CardSkeleton } from '../../components/LoadingSkeleton';
import { formatCurrency, getPreferredCurrency } from '../../utils/currency';
import CurrencySelector from '../../components/CurrencySelector';
import { listenDashboardEvents } from '../../services/socket';

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState(getPreferredCurrency());
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [coursesRes, reportRes] = await Promise.all([
        coursesAPI.getMyCourses({ status: 'active' }),
        reportsAPI.student(),
      ]);
      setCourses(coursesRes.data.data.slice(0, 4));
      const r = reportRes.data.data;
      setStats({
        enrolledCourses: r.totalCourses || coursesRes.data.data.length,
        completedCourses: r.completedCourses || 0,
        activeCourses: r.activeCourses || 0,
        pendingAssignments: r.pendingAssignments || 0,
        overdueAssignments: r.overdueAssignments || 0,
        averageGrade: Math.round(r.averageGrade) || 0,
        totalSpent: r.totalSpent || 0,
        attendanceRate: r.attendanceRate || 0,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { const i = setInterval(loadData, 30000); return () => clearInterval(i); }, [loadData]);
  useEffect(() => {
    return listenDashboardEvents({ 'enrollment:new': loadData, 'payment:success': loadData });
  }, [loadData]);

  const statCards = [
    { icon: BookOpen, label: 'Enrolled', value: stats?.enrolledCourses || 0, sub: `${stats?.activeCourses || 0} active`, color: 'bg-blue-500' },
    { icon: Award, label: 'Completed', value: stats?.completedCourses || 0, sub: `${stats?.averageGrade || 0}% avg grade`, color: 'bg-green-500' },
    { icon: Clock, label: 'Assignments', value: stats?.pendingAssignments || 0, sub: `${stats?.overdueAssignments || 0} overdue`, color: stats?.overdueAssignments > 0 ? 'bg-red-500' : 'bg-orange-500' },
    { icon: TrendingUp, label: 'Attendance', value: `${stats?.attendanceRate || 0}%`, sub: `${formatCurrency(stats?.totalSpent || 0, currency)} spent`, color: 'bg-purple-500' },
  ];

  if (loading) return <><PageHeader title="Student Dashboard" /><StatsSkeleton /><CardSkeleton count={2} /></>;

  return (
    <div>
      <PageHeader title="Student Dashboard"
        actions={
          <div className="flex items-center space-x-3">
            {lastUpdated && <span className="text-xs text-gray-400">{lastUpdated.toLocaleTimeString()}</span>}
            <CurrencySelector onCurrencyChange={setCurrency} />
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="card flex items-center space-x-4">
            <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center shrink-0`}>
              <card.icon className="text-white" size={24} />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <div className="text-sm text-gray-500">{card.label}</div>
              {card.sub && <div className="text-xs mt-0.5 text-gray-400">{card.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {stats?.overdueAssignments > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <div>
            <p className="font-medium text-red-800">{stats.overdueAssignments} overdue assignment{stats.overdueAssignments !== 1 ? 's' : ''}</p>
            <p className="text-sm text-red-600">Please submit them as soon as possible.</p>
          </div>
          <Link to="/student/assignments" className="btn-outline text-sm py-1 px-3 text-red-600 border-red-200 ml-auto shrink-0">View</Link>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
            <Link to="/student/courses" className="text-sm text-indigo-600 hover:text-indigo-500">View All</Link>
          </div>
          <div className="space-y-3">
            {courses.map((course) => (
              <Link key={course.id} to={`/student/courses/${course.course_id}/learn`} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="text-indigo-600" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{course.title}</h3>
                  <span className="text-xs text-gray-500">{Number(course.progress ?? 0).toFixed(0)}% complete</span>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 rounded-full h-2" style={{ width: `${course.progress || 0}%` }} />
                </div>
              </Link>
            ))}
            {courses.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No active courses. <Link to="/courses" className="text-indigo-600">Browse courses</Link></p>}
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><Award className="text-green-600" size={18} /></div>
              <div><p className="text-xs text-gray-500">Completed Courses</p><p className="font-bold text-gray-900">{stats?.completedCourses || 0}/{stats?.enrolledCourses || 0}</p></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><FileText className="text-blue-600" size={18} /></div>
              <div><p className="text-xs text-gray-500">Pending Assignments</p><p className="font-bold text-gray-900">{stats?.pendingAssignments || 0}</p></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><DollarSign className="text-purple-600" size={18} /></div>
              <div><p className="text-xs text-gray-500">Total Spent</p><p className="font-bold text-gray-900">{formatCurrency(stats?.totalSpent || 0, currency)}</p></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center"><Calendar className="text-orange-600" size={18} /></div>
              <div><p className="text-xs text-gray-500">Attendance Rate</p><p className="font-bold text-gray-900">{stats?.attendanceRate || 0}%</p></div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/student/grades" className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center justify-center">View Full Report</Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Grades</h2>
          <div className="text-center py-8 text-gray-500 text-sm">
            <p>Grade details available in the Grades section.</p>
            <Link to="/student/grades" className="text-indigo-600 font-medium mt-2 inline-block">View Grades</Link>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <Link to="/student/live-classes" className="text-sm text-indigo-600 hover:text-indigo-500">View All</Link>
          </div>
          <div className="text-center py-8 text-gray-500 text-sm">
            <p>No upcoming events</p>
          </div>
        </div>
      </div>
    </div>
  );
}
