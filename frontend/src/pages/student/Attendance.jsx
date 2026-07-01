import { useState, useEffect } from 'react';
import { attendanceAPI } from '../../services/api';
import { CalendarCheck } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceAPI.getMy()
      .then(({ data }) => setRecords(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const map = { present: 'neon-badge-success', absent: 'neon-badge-danger', late: 'neon-badge-warning', excused: 'neon-badge-info' };
    return     <span className={`neon-badge ${map[status] || 'neon-badge-info'}`}>{status}</span>;
  };

  if (loading) return <><PageHeader title="Attendance" /><TableSkeleton rows={8} cols={4} /></>;

  return (
    <div>
      <PageHeader title="Attendance" description={`${records.length} records`} />
      {records.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No attendance records" description="Attend live classes to see your attendance." />
      ) : (
        <div className="neon-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-neon)' }}>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Course</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Meeting</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Date</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-neon)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,65,0.05)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{r.course_title}</td>
                  <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{r.meeting_title}</td>
                  <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{new Date(r.scheduled_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-center">{statusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
