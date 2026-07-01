import { useState } from 'react';
import { coursesAPI } from '../../services/api';
import { Search, Users } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import DebouncedInput from '../../components/DebouncedInput';

export default function TeacherStudents() {
  const [courseId, setCourseId] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const loadStudents = async () => {
    if (!courseId) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await coursesAPI.getCourseStudents(courseId);
      setStudents(data.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Students" />
      <div className="neon-card mb-6" style={{ background: 'var(--bg-card)' }}>
        <div className="flex space-x-3">
          <DebouncedInput value={courseId} onChange={setCourseId} placeholder="Enter Course ID" className="flex-1" />
          <button onClick={loadStudents} className="neon-btn"><Search size={18} /></button>
        </div>
      </div>
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : students.length > 0 ? (
        <div className="neon-card overflow-hidden" style={{ background: 'var(--bg-card)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderColor: 'var(--border-neon)' }}>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Name</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Email</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Progress</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.enrollment_id} style={{ borderColor: 'var(--border-neon)' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(0,255,65,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>{s.first_name} {s.last_name}</td>
                  <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-16 rounded-full h-2" style={{ background: 'var(--bg-card)' }}>
                        <div style={{ background: 'var(--neon)', borderRadius: '9999px', height: '0.5rem', width: `${s.progress}%` }} />
                      </div>
                      <span style={{ color: 'var(--text-secondary)' }}>{Number(s.progress ?? 0).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`neon-badge ${s.status === 'active' ? 'neon-badge-success' : 'neon-badge-danger'}`}>{s.status}</span>
                  </td>
                  <td className="py-3 px-4 text-right" style={{ color: 'var(--text-secondary)' }}>{new Date(s.enrolled_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : searched ? (
        <EmptyState icon={Users} title="No students found" description="No students enrolled in this course." />
      ) : null}
    </div>
  );
}
