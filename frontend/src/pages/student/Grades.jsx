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
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Course</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Item</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Score</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Percentage</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{g.course_title}</td>
                  <td className="py-3 px-4 text-gray-600">{g.assignment_title || g.quiz_title || '-'}</td>
                  <td className="py-3 px-4 text-center text-gray-900">{g.score}/{g.total_points}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`badge ${parseFloat(g.percentage) >= 70 ? 'badge-success' : parseFloat(g.percentage) >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                      {parseFloat(g.percentage).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-gray-900">{g.letter_grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
