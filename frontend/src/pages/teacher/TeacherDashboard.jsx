import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI } from '../../services/api';
import { BookOpen, Users, Video, TrendingUp, Plus, DollarSign, Calendar, Award } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import PageHeader from '../../components/PageHeader';
import CurrencySelector from '../../components/CurrencySelector';
import { StatsSkeleton } from '../../components/LoadingSkeleton';
import { formatCurrency, formatAmount, getPreferredCurrency } from '../../utils/currency';
import { listenDashboardEvents } from '../../services/socket';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartOptions = (currency) => ({
  responsive: true, plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: (v) => formatAmount(v, currency) } }, x: { grid: { display: false } } },
});

export default function TeacherDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState(getPreferredCurrency());
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const { data } = await reportsAPI.teacher();
      setStats(data.data);
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
    return listenDashboardEvents({ 'enrollment:new': loadData });
  }, [loadData]);

  const statCards = [
    { icon: BookOpen, label: 'Courses', value: stats?.totalCourses || 0, sub: `${stats?.publishedCourses || 0} published`, color: '#0096ff' },
    { icon: Users, label: 'Students', value: stats?.totalStudents || 0, sub: `${stats?.activeStudents || 0} active`, color: 'var(--neon)' },
    { icon: Video, label: 'Meetings', value: stats?.meetings?.total || 0, sub: `${stats?.meetings?.scheduled || 0} upcoming`, color: '#ffc800' },
    { icon: DollarSign, label: 'Revenue', value: formatCurrency(stats?.revenue || 0, currency), sub: `${formatCurrency(stats?.todayRevenue || 0, currency)} today`, color: '#7fff00', trend: stats?.todayRevenue },
  ];

  if (loading) return <><PageHeader title="Teacher Dashboard" /><StatsSkeleton /></>;

  const enrollmentData = {
    labels: (stats?.enrollmentTrend || []).slice(-6).map(i => new Date(i.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{ label: 'Enrollments', data: (stats?.enrollmentTrend || []).slice(-6).map(i => i.count), backgroundColor: 'var(--neon)', borderRadius: 6 }],
  };

  const gradeData = {
    labels: ['A', 'B', 'C', 'D', 'F'],
    datasets: [{ label: 'Students', data: [stats?.gradeA || 0, stats?.gradeB || 0, stats?.gradeC || 0, stats?.gradeD || 0, stats?.gradeF || 0], backgroundColor: ['#059669', '#4f46e5', '#f59e0b', '#f97316', '#ef4444'], borderRadius: 6 }],
  };

  const revenue = stats?.revenue || 0;
  const todayRevenue = stats?.todayRevenue || 0;
  const transactions = stats?.totalTransactions || 0;

  return (
    <div>
      <PageHeader title="Teacher Dashboard"
        actions={
          <div className="flex items-center space-x-3">
            {lastUpdated && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{lastUpdated.toLocaleTimeString()}</span>}
            <CurrencySelector onCurrencyChange={setCurrency} />
            <Link to="/teacher/courses/create" className="neon-btn flex items-center space-x-2 text-sm"><Plus size={18} /><span>Create Course</span></Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="neon-card flex items-center space-x-4" style={{ background: 'var(--bg-card)' }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: card.color }}>
              <card.icon className="text-white" size={24} />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>{card.value}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{card.label}</div>
              {card.sub && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="neon-card p-3 flex items-center space-x-3" style={{ background: 'var(--bg-card)' }}>
          <TrendingUp size={18} style={{ color: 'var(--neon)' }} className="shrink-0" />
          <div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Today Revenue</p><p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{formatCurrency(todayRevenue, currency)}</p></div>
        </div>
        <div className="neon-card p-3 flex items-center space-x-3" style={{ background: 'var(--bg-card)' }}>
          <Award size={18} style={{ color: 'var(--neon)' }} className="shrink-0" />
          <div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Revenue</p><p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{formatCurrency(revenue, currency)}</p></div>
        </div>
        <div className="neon-card p-3 flex items-center space-x-3" style={{ background: 'var(--bg-card)' }}>
          <Calendar size={18} style={{ color: '#ffc800' }} className="shrink-0" />
          <div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Transactions</p><p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{transactions}</p></div>
        </div>
        <div className="neon-card p-3 flex items-center space-x-3" style={{ background: 'var(--bg-card)' }}>
          <Users size={18} style={{ color: '#0096ff' }} className="shrink-0" />
          <div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Active Students</p><p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{stats?.activeStudents || 0}</p></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="neon-card" style={{ background: 'var(--bg-card)' }}><h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Enrollment Trend</h2><Bar data={enrollmentData} options={chartOptions(currency)} height={80} /></div>
        <div className="neon-card" style={{ background: 'var(--bg-card)' }}><h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Grade Distribution</h2><Bar data={gradeData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }} height={80} /></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Courses</h2>
          <div className="space-y-3">
            {stats?.courses?.slice(0, 5).map(course => (
              <Link key={course.id} to={`/teacher/courses/${course.id}/edit`} className="flex items-center justify-between p-3 rounded-lg"
                onMouseEnter={e=>e.currentTarget.style.background='rgba(0,255,65,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{course.title}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{course.active_students || 0} active students</p>
                </div>
                <span className={`neon-badge shrink-0 ml-2 ${course.is_published ? 'neon-badge-success' : 'neon-badge-warning'}`}>{course.status}</span>
              </Link>
            ))}
            {(!stats?.courses || stats.courses.length === 0) && <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No courses yet. <Link to="/teacher/courses/create" style={{ color: 'var(--neon)' }}>Create one</Link></p>}
          </div>
        </div>
        <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Enrollments</h2>
          <div className="space-y-3">
            {stats?.recentEnrollments?.slice(0, 5).map(e => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span className="truncate mr-2" style={{ color: 'var(--text-secondary)' }}>{e.student_name}</span>
                <span className="shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(e.enrolled_at).toLocaleDateString()}</span>
              </div>
            ))}
            {(!stats?.recentEnrollments || stats.recentEnrollments.length === 0) && <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No recent enrollments</p>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Upcoming Meetings</h2>
          <div className="space-y-3">
            {stats?.meetings?.upcoming?.slice(0, 5).map(m => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="truncate mr-2" style={{ color: 'var(--text-secondary)' }}>{m.title}</span>
                <span className="shrink-0" style={{ color: 'var(--text-muted)' }}>{new Date(m.scheduled_at).toLocaleDateString()}</span>
              </div>
            ))}
            {(!stats?.meetings?.upcoming || stats.meetings.upcoming.length === 0) && <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No upcoming meetings</p>}
          </div>
        </div>
        <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Performance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(0,150,255,0.1)' }}>
              <p className="text-2xl font-bold" style={{ color: '#0096ff' }}>{stats?.publishedCourses || 0}/{stats?.totalCourses || 0}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Courses Published</p>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(0,255,65,0.1)' }}>
              <p className="text-2xl font-bold" style={{ color: 'var(--neon)' }}>{stats?.totalStudents || 0}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Students</p>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(127,255,0,0.1)' }}>
              <p className="text-2xl font-bold" style={{ color: '#7fff00' }}>{formatCurrency(revenue, currency)}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Revenue</p>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(255,200,0,0.1)' }}>
              <p className="text-2xl font-bold" style={{ color: '#ffc800' }}>{stats?.meetings?.completed || 0}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Meetings Done</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
