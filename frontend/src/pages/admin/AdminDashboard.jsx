import { useState, useEffect, useCallback } from 'react';
import { reportsAPI, paymentsAPI } from '../../services/api';
import { Users, BookOpen, CreditCard, TrendingUp, DollarSign, Calendar, Target, Zap } from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import PageHeader from '../../components/PageHeader';
import CurrencySelector from '../../components/CurrencySelector';
import { StatsSkeleton } from '../../components/LoadingSkeleton';
import { formatCurrency, formatAmount, getPreferredCurrency } from '../../utils/currency';
import { listenDashboardEvents } from '../../services/socket';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartOptions = (currency) => ({
  responsive: true,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => formatCurrency(ctx.raw, currency) } } },
  scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,255,65,0.05)' }, ticks: { callback: (v) => formatAmount(v, currency) } }, x: { grid: { display: false } } },
});

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState(getPreferredCurrency());
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [dashRes, payRes] = await Promise.all([
        reportsAPI.dashboard(),
        paymentsAPI.getStats().catch(() => ({ data: { data: null } })),
      ]);
      setStats(dashRes.data.data);
      setPaymentStats(payRes.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    const cleanup = listenDashboardEvents({
      'dashboard:update': loadData,
      'payment:success': loadData,
      'enrollment:new': loadData,
    });
    return cleanup;
  }, [loadData]);

  if (loading) return <><PageHeader title="Admin Dashboard" /><StatsSkeleton /></>;

  const today = stats?.today || {};
  const month = stats?.month || {};

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats?.totalUsers || 0, sub: `+${today.newUsers || 0} today`, color: '#0096ff', trend: today.newUsers },
    { icon: BookOpen, label: 'Courses', value: stats?.totalCourses || 0, sub: `${stats?.courseStats?.length || 0} with enrollments`, color: 'var(--neon)' },
    { icon: TrendingUp, label: 'Enrollments', value: stats?.totalEnrollments || 0, sub: `+${today.enrollments || 0} today`, color: '#ffc800', trend: today.enrollments },
    { icon: DollarSign, label: 'Revenue', value: formatCurrency(stats?.totalRevenue || 0, currency), sub: `${formatCurrency(today.revenue || 0, currency)} today`, color: '#7fff00', trend: today.revenue },
  ];

  const revenueChartData = {
    labels: (stats?.revenueTrend || []).slice(-6).map(i => new Date(i.month).toLocaleDateString('en-US', { month: 'short' })),
    datasets: [{ label: 'Revenue', data: (stats?.revenueTrend || []).slice(-6).map(i => parseFloat(i.revenue)), backgroundColor: '#00ff41', borderRadius: 6 }],
  };

  const enrollmentChartData = {
    labels: (stats?.enrollmentTrend || []).slice(-6).map(i => new Date(i.date).toLocaleDateString('en-US', { month: 'short' })),
    datasets: [{ label: 'Enrollments', data: (stats?.enrollmentTrend || []).slice(-6).map(i => i.count), borderColor: '#059669', backgroundColor: 'rgba(0,255,65,0.1)', fill: true, tension: 0.4 }],
  };

  const userDistribution = {
    labels: ['Students', 'Teachers', 'Admins'],
    datasets: [{ data: [stats?.studentCount || 0, stats?.teacherCount || 0, stats?.adminCount || 0], backgroundColor: ['#00ff41', '#7fff00', '#ffc800'], borderWidth: 0 }],
  };

  const paymentMethodData = paymentStats?.methodBreakdown ? {
    labels: paymentStats.methodBreakdown.map(m => m.payment_method === 'mtn_momo' ? 'MTN MoMo' : m.payment_method === 'airtel_money' ? 'Airtel Money' : m.payment_method),
    datasets: [{ data: paymentStats.methodBreakdown.map(m => parseFloat(m.total)), backgroundColor: ['#00ff41', '#7fff00', '#ffc800', '#0096ff'], borderWidth: 0 }],
  } : null;

  return (
    <div>
      <PageHeader title="Admin Dashboard"
        actions={
          <div className="flex items-center space-x-3">
            {lastUpdated && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Updated {lastUpdated.toLocaleTimeString()}</span>}
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
              <div className="text-2xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>{card.value}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{card.label}</div>
              {card.sub && <div className="text-xs mt-0.5" style={{ color: card.trend > 0 ? 'var(--neon)' : 'var(--text-muted)' }}>{card.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="neon-card p-3 flex items-center space-x-3">
          <Calendar size={20} className="shrink-0" style={{ color: 'var(--neon)' }} />
          <div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Today Revenue</p><p className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(today.revenue || 0, currency)}</p></div>
        </div>
        <div className="neon-card p-3 flex items-center space-x-3">
          <Target size={20} className="shrink-0" style={{ color: 'var(--neon)' }} />
          <div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Month Revenue</p><p className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(month.revenue || 0, currency)}</p></div>
        </div>
        <div className="neon-card p-3 flex items-center space-x-3">
          <Zap size={20} className="shrink-0" style={{ color: '#ffc800' }} />
          <div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Today Enrollments</p><p className="font-bold" style={{ color: 'var(--text-primary)' }}>{today.enrollments || 0}</p></div>
        </div>
        <div className="neon-card p-3 flex items-center space-x-3">
          <Users size={20} className="shrink-0" style={{ color: '#0096ff' }} />
          <div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Month New Users</p><p className="font-bold" style={{ color: 'var(--text-primary)' }}>{month.newUsers || 0}</p></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="neon-card">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Revenue Trend ({currency})</h2>
          <Bar data={revenueChartData} options={chartOptions(currency)} height={80} />
        </div>
        <div className="neon-card">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Enrollment Trend</h2>
          <Line data={enrollmentChartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,255,65,0.05)' } }, x: { grid: { display: false } } } }} height={80} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="neon-card">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>User Distribution</h2>
          <div className="flex items-center justify-center h-48"><Doughnut data={userDistribution} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} /></div>
        </div>
        {paymentMethodData && (
          <div className="neon-card">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Revenue by Method</h2>
            <div className="flex items-center justify-center h-48"><Doughnut data={paymentMethodData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} /></div>
          </div>
        )}
        <div className="neon-card">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Top Courses</h2>
          <div className="space-y-3">
            {stats?.topCourses?.map((c, i) => (
              <div key={c.id} className="flex items-center space-x-3 text-sm">
                <span className="w-5 text-center font-medium" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.enrolled} enrolled | {c.avg_rating ? `${c.avg_rating.toFixed(1)} ★` : 'No ratings'}</p>
                </div>
              </div>
            ))}
            {(!stats?.topCourses || stats.topCourses.length === 0) && <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No courses yet</p>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="neon-card">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Enrollments</h2>
          <div className="space-y-3">
            {stats?.recentEnrollments?.slice(0, 6).map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }} className="truncate mr-2">{e.student_name}</span>
                <span className="font-medium truncate mr-2" style={{ color: 'var(--text-primary)' }}>{e.course_title}</span>
                <span className="shrink-0" style={{ color: 'var(--text-muted)' }}>{new Date(e.enrolled_at).toLocaleDateString()}</span>
              </div>
            ))}
            {(!stats?.recentEnrollments || stats.recentEnrollments.length === 0) && <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No recent enrollments</p>}
          </div>
        </div>
        <div className="neon-card">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Payment Summary</h2>
          {paymentStats ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-secondary)' }}>Completed</span><span className="font-medium" style={{ color: 'var(--text-primary)' }}>{paymentStats.completed_payments || 0}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-secondary)' }}>Pending</span><span className="font-medium" style={{ color: '#ffc800' }}>{paymentStats.pending_payments || 0}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-secondary)' }}>Failed</span><span className="font-medium" style={{ color: '#ff3232' }}>{paymentStats.failed_payments || 0}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-secondary)' }}>Refunded</span><span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{paymentStats.refunded_payments || 0}</span></div>
              <div className="border-t pt-2 mt-2 flex justify-between text-sm font-bold" style={{ borderColor: 'var(--border-neon)' }}><span>Total Revenue</span><span style={{ color: 'var(--neon)' }}>{formatCurrency(paymentStats.total_revenue || 0, currency)}</span></div>
              <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}><span>Avg Payment</span><span>{formatCurrency(paymentStats.average_payment || 0, currency)}</span></div>
            </div>
          ) : (
            <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Loading payment data...</p>
          )}
        </div>
      </div>
    </div>
  );
}
