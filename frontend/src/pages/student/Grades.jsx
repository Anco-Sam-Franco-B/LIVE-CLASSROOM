import { useState, useEffect } from 'react';
import { gradesAPI } from '../../services/api';
import { GraduationCap } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';

export default function Grades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gradesAPI.getAll()
      .then(({ data }) => setGrades(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><PageHeader title="Grades" /><TableSkeleton rows={8} cols={5} /></>;

  return (
    <div>
      <PageHeader title="Grades" description={`${grades.length} grade${grades.length !== 1 ? 's' : ''}`} />
      {grades.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No grades available yet" />
      ) : (
        <div className="neon-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-neon)' }}>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Course</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Item</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Score</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Percentage</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id} style={{ borderBottom: '1px solid var(--border-neon)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,65,0.05)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{g.course_title}</td>
                  <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{g.assignment_title || g.quiz_title || '-'}</td>
                  <td className="py-3 px-4 text-center" style={{ color: 'var(--text-primary)' }}>{g.score}/{g.total_points}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`neon-badge ${parseFloat(g.percentage) >= 70 ? 'neon-badge-success' : parseFloat(g.percentage) >= 50 ? 'neon-badge-warning' : 'neon-badge-danger'}`}>
                      {parseFloat(g.percentage).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold" style={{ color: 'var(--text-primary)' }}>{g.letter_grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
