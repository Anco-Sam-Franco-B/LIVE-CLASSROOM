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
  scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: (v) => formatAmount(v, currency) } }, x: { grid: { display: false } } },
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
    { icon: Users, label: 'Total Users', value: stats?.totalUsers || 0, sub: `+${today.newUsers || 0} today`, color: 'bg-blue-500', trend: today.newUsers },
    { icon: BookOpen, label: 'Courses', value: stats?.totalCourses || 0, sub: `${stats?.courseStats?.length || 0} with enrollments`, color: 'bg-green-500' },
    { icon: TrendingUp, label: 'Enrollments', value: stats?.totalEnrollments || 0, sub: `+${today.enrollments || 0} today`, color: 'bg-orange-500', trend: today.enrollments },
    { icon: DollarSign, label: 'Revenue', value: formatCurrency(stats?.totalRevenue || 0, currency), sub: `${formatCurrency(today.revenue || 0, currency)} today`, color: 'bg-purple-500', trend: today.revenue },
  ];

  const revenueChartData = {
    labels: (stats?.revenueTrend || []).slice(-6).map(i => new Date(i.month).toLocaleDateString('en-US', { month: 'short' })),
    datasets: [{ label: 'Revenue', data: (stats?.revenueTrend || []).slice(-6).map(i => parseFloat(i.revenue)), backgroundColor: '#4f46e5', borderRadius: 6 }],
  };

  const enrollmentChartData = {
    labels: (stats?.enrollmentTrend || []).slice(-6).map(i => new Date(i.date).toLocaleDateString('en-US', { month: 'short' })),
    datasets: [{ label: 'Enrollments', data: (stats?.enrollmentTrend || []).slice(-6).map(i => i.count), borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.1)', fill: true, tension: 0.4 }],
  };

  const userDistribution = {
    labels: ['Students', 'Teachers', 'Admins'],
    datasets: [{ data: [stats?.studentCount || 0, stats?.teacherCount || 0, stats?.adminCount || 0], backgroundColor: ['#4f46e5', '#059669', '#f59e0b'], borderWidth: 0 }],
  };

  const paymentMethodData = paymentStats?.methodBreakdown ? {
    labels: paymentStats.methodBreakdown.map(m => m.payment_method === 'mtn_momo' ? 'MTN MoMo' : m.payment_method === 'airtel_money' ? 'Airtel Money' : m.payment_method),
    datasets: [{ data: paymentStats.methodBreakdown.map(m => parseFloat(m.total)), backgroundColor: ['#4f46e5', '#059669', '#f59e0b', '#ef4444'], borderWidth: 0 }],
  } : null;

  return (
    <div>
      <PageHeader title="Admin Dashboard"
        actions={
          <div className="flex items-center space-x-3">
            {lastUpdated && <span className="text-xs text-gray-400">Updated {lastUpdated.toLocaleTimeString()}</span>}
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
              <div className="text-2xl font-bold text-gray-900 truncate">{card.value}</div>
              <div className="text-sm text-gray-500">{card.label}</div>
              {card.sub && <div className="text-xs mt-0.5" style={{ color: card.trend > 0 ? '#059669' : '#6b7280' }}>{card.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-3 flex items-center space-x-3">
          <Calendar size={20} className="text-indigo-500 shrink-0" />
          <div><p className="text-xs text-gray-500">Today Revenue</p><p className="font-bold text-gray-900">{formatCurrency(today.revenue || 0, currency)}</p></div>
        </div>
        <div className="card p-3 flex items-center space-x-3">
          <Target size={20} className="text-green-500 shrink-0" />
          <div><p className="text-xs text-gray-500">Month Revenue</p><p className="font-bold text-gray-900">{formatCurrency(month.revenue || 0, currency)}</p></div>
        </div>
        <div className="card p-3 flex items-center space-x-3">
          <Zap size={20} className="text-orange-500 shrink-0" />
          <div><p className="text-xs text-gray-500">Today Enrollments</p><p className="font-bold text-gray-900">{today.enrollments || 0}</p></div>
        </div>
        <div className="card p-3 flex items-center space-x-3">
          <Users size={20} className="text-blue-500 shrink-0" />
          <div><p className="text-xs text-gray-500">Month New Users</p><p className="font-bold text-gray-900">{month.newUsers || 0}</p></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend ({currency})</h2>
          <Bar data={revenueChartData} options={chartOptions(currency)} height={80} />
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Trend</h2>
          <Line data={enrollmentChartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }} height={80} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h2>
          <div className="flex items-center justify-center h-48"><Doughnut data={userDistribution} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} /></div>
        </div>
        {paymentMethodData && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Method</h2>
            <div className="flex items-center justify-center h-48"><Doughnut data={paymentMethodData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} /></div>
          </div>
        )}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Courses</h2>
          <div className="space-y-3">
            {stats?.topCourses?.map((c, i) => (
              <div key={c.id} className="flex items-center space-x-3 text-sm">
                <span className="w-5 text-center font-medium text-gray-400">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{c.title}</p>
                  <p className="text-xs text-gray-500">{c.enrolled} enrolled | {c.avg_rating ? `${c.avg_rating.toFixed(1)} ★` : 'No ratings'}</p>
                </div>
              </div>
            ))}
            {(!stats?.topCourses || stats.topCourses.length === 0) && <p className="text-gray-400 text-center py-4">No courses yet</p>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Enrollments</h2>
          <div className="space-y-3">
            {stats?.recentEnrollments?.slice(0, 6).map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 truncate mr-2">{e.student_name}</span>
                <span className="text-gray-900 font-medium truncate mr-2">{e.course_title}</span>
                <span className="text-gray-400 shrink-0">{new Date(e.enrolled_at).toLocaleDateString()}</span>
              </div>
            ))}
            {(!stats?.recentEnrollments || stats.recentEnrollments.length === 0) && <p className="text-gray-400 text-center py-4">No recent enrollments</p>}
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
          {paymentStats ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Completed</span><span className="font-medium text-gray-900">{paymentStats.completed_payments || 0}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Pending</span><span className="font-medium text-amber-600">{paymentStats.pending_payments || 0}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Failed</span><span className="font-medium text-red-600">{paymentStats.failed_payments || 0}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Refunded</span><span className="font-medium text-gray-600">{paymentStats.refunded_payments || 0}</span></div>
              <div className="border-t pt-2 mt-2 flex justify-between text-sm font-bold"><span>Total Revenue</span><span className="text-indigo-600">{formatCurrency(paymentStats.total_revenue || 0, currency)}</span></div>
              <div className="flex justify-between text-xs text-gray-500"><span>Avg Payment</span><span>{formatCurrency(paymentStats.average_payment || 0, currency)}</span></div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">Loading payment data...</p>
          )}
        </div>
      </div>
    </div>
  );
}
