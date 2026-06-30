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
    const map = { present: 'badge-success', absent: 'badge-danger', late: 'badge-warning', excused: 'badge-info' };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
  };

  if (loading) return <><PageHeader title="Attendance" /><TableSkeleton rows={8} cols={4} /></>;

  return (
    <div>
      <PageHeader title="Attendance" description={`${records.length} records`} />
      {records.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No attendance records" description="Attend live classes to see your attendance." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Course</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Meeting</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{r.course_title}</td>
                  <td className="py-3 px-4 text-gray-600">{r.meeting_title}</td>
                  <td className="py-3 px-4 text-gray-600">{new Date(r.scheduled_at).toLocaleDateString()}</td>
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
