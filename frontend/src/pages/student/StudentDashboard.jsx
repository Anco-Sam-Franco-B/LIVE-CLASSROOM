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
    { icon: BookOpen, label: 'Enrolled', value: stats?.enrolledCourses || 0, sub: `${stats?.activeCourses || 0} active`, color: '#0096ff' },
    { icon: Award, label: 'Completed', value: stats?.completedCourses || 0, sub: `${stats?.averageGrade || 0}% avg grade`, color: 'var(--neon)' },
    { icon: Clock, label: 'Assignments', value: stats?.pendingAssignments || 0, sub: `${stats?.overdueAssignments || 0} overdue`, color: stats?.overdueAssignments > 0 ? '#ff3232' : '#ffc800' },
    { icon: TrendingUp, label: 'Attendance', value: `${stats?.attendanceRate || 0}%`, sub: `${formatCurrency(stats?.totalSpent || 0, currency)} spent`, color: 'var(--neon)' },
  ];

  if (loading) return <><PageHeader title="Student Dashboard" /><StatsSkeleton /><CardSkeleton count={2} /></>;

  return (
    <div>
      <PageHeader title="Student Dashboard"
        actions={
          <div className="flex items-center space-x-3">
            {lastUpdated && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{lastUpdated.toLocaleTimeString()}</span>}
            <CurrencySelector onCurrencyChange={setCurrency} />
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="neon-card flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: card.color }}>
              <card.icon className="text-white" size={24} />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{card.value}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{card.label}</div>
              {card.sub && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {stats?.overdueAssignments > 0 && (
        <div className="mb-6 p-4 rounded-lg flex items-center space-x-3" style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)' }}>
          <AlertCircle className="shrink-0" size={20} style={{ color: '#ff3232' }} />
          <div>
            <p className="font-medium" style={{ color: '#ff3232' }}>{stats.overdueAssignments} overdue assignment{stats.overdueAssignments !== 1 ? 's' : ''}</p>
            <p className="text-sm" style={{ color: '#ff3232' }}>Please submit them as soon as possible.</p>
          </div>
          <Link to="/student/assignments" className="neon-btn-outline text-sm py-1 px-3 ml-auto shrink-0" style={{ color: '#ff3232', borderColor: 'rgba(255,50,50,0.3)' }}>View</Link>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 neon-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>My Courses</h2>
            <Link to="/student/courses" className="text-sm" style={{ color: 'var(--neon)' }} onMouseEnter={e => e.currentTarget.style.color = '#00cc52'} onMouseLeave={e => e.currentTarget.style.color = 'var(--neon)'}>View All</Link>
          </div>
          <div className="space-y-3">
            {courses.map((course) => (
              <Link key={course.id} to={`/student/courses/${course.course_id}/learn`} className="flex items-center space-x-3 p-3 rounded-lg transition" onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,65,0.05)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(0,255,65,0.1)' }}>
                  <BookOpen size={20} style={{ color: 'var(--neon)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{course.title}</h3>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{Number(course.progress ?? 0).toFixed(0)}% complete</span>
                </div>
                <div className="w-24 rounded-full h-2" style={{ background: 'var(--bg-card)' }}>
                  <div className="rounded-full h-2" style={{ width: `${course.progress || 0}%`, background: 'var(--neon)' }} />
                </div>
              </Link>
            ))}
            {courses.length === 0 && <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>No active courses. <Link to="/courses" style={{ color: 'var(--neon)' }}>Browse courses</Link></p>}
          </div>
        </div>
        <div className="neon-card">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,255,65,0.1)' }}><Award size={18} style={{ color: 'var(--neon)' }} /></div>
              <div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Completed Courses</p><p className="font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.completedCourses || 0}/{stats?.enrolledCourses || 0}</p></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,150,255,0.1)' }}><FileText size={18} style={{ color: '#0096ff' }} /></div>
              <div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Pending Assignments</p><p className="font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.pendingAssignments || 0}</p></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,255,65,0.1)' }}><DollarSign size={18} style={{ color: 'var(--neon)' }} /></div>
              <div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Spent</p><p className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(stats?.totalSpent || 0, currency)}</p></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,200,0,0.1)' }}><Calendar size={18} style={{ color: '#ffc800' }} /></div>
              <div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Attendance Rate</p><p className="font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.attendanceRate || 0}%</p></div>
            </div>
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-neon)' }}>
            <Link to="/student/grades" className="text-sm flex items-center justify-center" style={{ color: 'var(--neon)' }} onMouseEnter={e => e.currentTarget.style.color = '#00cc52'} onMouseLeave={e => e.currentTarget.style.color = 'var(--neon)'}>View Full Report</Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="neon-card">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Grades</h2>
          <div className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Grade details available in the Grades section.</p>
            <Link to="/student/grades" className="font-medium mt-2 inline-block" style={{ color: 'var(--neon)' }}>View Grades</Link>
          </div>
        </div>
        <div className="neon-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Upcoming Events</h2>
            <Link to="/student/live-classes" className="text-sm" style={{ color: 'var(--neon)' }} onMouseEnter={e => e.currentTarget.style.color = '#00cc52'} onMouseLeave={e => e.currentTarget.style.color = 'var(--neon)'}>View All</Link>
          </div>
          <div className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>No upcoming events</p>
          </div>
        </div>
      </div>
    </div>
  );
}
