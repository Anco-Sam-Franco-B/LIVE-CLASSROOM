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
      <div className="card mb-6">
        <div className="flex space-x-3">
          <DebouncedInput value={courseId} onChange={setCourseId} placeholder="Enter Course ID" className="flex-1" />
          <button onClick={loadStudents} className="btn-primary"><Search size={18} /></button>
        </div>
      </div>
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : students.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Progress</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.enrollment_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{s.first_name} {s.last_name}</td>
                  <td className="py-3 px-4 text-gray-600">{s.email}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-600 rounded-full h-2" style={{ width: `${s.progress}%` }} />
                      </div>
                      <span className="text-gray-600">{Number(s.progress ?? 0).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{s.status}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">{new Date(s.enrolled_at).toLocaleDateString()}</td>
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
