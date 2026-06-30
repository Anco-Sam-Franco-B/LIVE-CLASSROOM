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
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Report</h2>
          <div className="space-y-3">
            {revenue.map((item) => (
              <div key={item.date} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                <span className="font-medium text-gray-900">UGX {parseFloat(item.revenue).toLocaleString()}</span>
                <span className="text-gray-400">{item.transactions} transactions</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Report</h2>
          <div className="space-y-3">
            {enrollments.map((item) => (
              <div key={item.date} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                <span className="font-medium text-gray-900">{item.enrollments} enrollments</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
