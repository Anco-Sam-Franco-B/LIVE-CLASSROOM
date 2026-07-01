import { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import PageHeader from '../../components/PageHeader';

export default function AdminReports() {
  const [revenue, setRevenue] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportsAPI.revenue({ groupBy: 'month' }),
      reportsAPI.enrollments({ groupBy: 'month' }),
    ])
      .then(([revRes, enrRes]) => {
        setRevenue(revRes.data.data);
        setEnrollments(enrRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><PageHeader title="Reports" /><CardSkeleton count={2} /></>;

  return (
    <div>
      <PageHeader title="Reports" description="Revenue and enrollment analytics" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="neon-card">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Revenue Report</h2>
          <div className="space-y-3">
            {revenue.map((item) => (
              <div key={item.date} className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>UGX {parseFloat(item.revenue).toLocaleString()}</span>
                <span style={{ color: 'var(--text-muted)' }}>{item.transactions} transactions</span>
              </div>
            ))}
          </div>
        </div>
        <div className="neon-card">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Enrollment Report</h2>
          <div className="space-y-3">
            {enrollments.map((item) => (
              <div key={item.date} className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.enrollments} enrollments</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
