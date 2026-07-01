import { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import { BarChart } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { StatsSkeleton } from '../../components/LoadingSkeleton';

export default function TeacherReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsAPI.teacher()
      .then(({ data }) => setReport(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><PageHeader title="Reports" /><StatsSkeleton /></>;

  return (
    <div>
      <PageHeader title="Reports" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="neon-card">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Course Performance</h2>
          {report?.courses?.length > 0 ? (
            <div className="space-y-3">
              {report.courses.map(c => (
                <div key={c.id} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.title}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.student_count} students</span>
                    <span className={`neon-badge ${c.is_published ? 'neon-badge-success' : 'neon-badge-warning'}`}>{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No course data</p>}
        </div>
        <div className="neon-card">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Enrollment Trend</h2>
          {report?.enrollmentTrend?.length > 0 ? report.enrollmentTrend.map((item) => (
            <div key={item.date} className="flex items-center justify-between text-sm py-1">
              <span style={{ color: 'var(--text-secondary)' }}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              <span className="font-medium">{item.count}</span>
            </div>
          )) : <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No enrollment data</p>}
        </div>
      </div>
    </div>
  );
}
