import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../../services/api';
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const toast = useToast();

  useEffect(() => {
    coursesAPI.getTeacherCourses()
      .then(({ data }) => setCourses(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const togglePublish = async (id) => {
    try {
      await coursesAPI.publish(id);
      setCourses(prev => prev.map(c => c.id === id ? { ...c, is_published: !c.is_published } : c));
      toast('Course status updated', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const deleteCourse = async (id) => {
    try {
      await coursesAPI.delete(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast('Course deleted', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to delete', 'error'); }
  };

  if (loading) return <><PageHeader title="My Courses" /><TableSkeleton rows={6} cols={5} /></>;

  return (
    <div>
      <PageHeader title="My Courses" description={`${courses.length} courses`} actions={<Link to="/teacher/courses/create" className="neon-btn flex items-center space-x-2"><Plus size={20} /><span>New Course</span></Link>} />
      {courses.length === 0 ? (
        <EmptyState icon={Edit} title="No courses yet" description="Create your first course to get started." action={<Link to="/teacher/courses/create" className="neon-btn">Create Course</Link>} />
      ) : (
        <div className="neon-card overflow-hidden" style={{ background: 'var(--bg-card)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderColor: 'var(--border-neon)' }}>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Course</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Students</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Rating</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} style={{ borderColor: 'var(--border-neon)' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(0,255,65,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td className="py-3 px-4">
                    <p className="font-medium truncate max-w-xs" style={{ color: 'var(--text-primary)' }}>{course.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{course.category_name}</p>
                  </td>
                  <td className="py-3 px-4 text-center" style={{ color: 'var(--text-secondary)' }}>{course.student_count}</td>
                  <td className="py-3 px-4 text-center" style={{ color: 'var(--text-secondary)' }}>{parseFloat(course.rating).toFixed(1)}</td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => togglePublish(course.id)} className={`neon-badge ${course.is_published ? 'neon-badge-success' : 'neon-badge-warning'}`}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/courses/${course.slug}`} className="neon-btn-outline p-2"><Eye size={16} /></Link>
                      <Link to={`/teacher/courses/${course.id}/edit`} className="neon-btn-outline p-2"><Edit size={16} /></Link>
                      <button onClick={() => setConfirm({ action: () => deleteCourse(course.id), title: 'Delete Course', message: `Delete "${course.title}"?` })} className="neon-btn-ghost p-2" style={{ background: '#ff3232' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={confirm?.action} title={confirm?.title} message={confirm?.message} />
    </div>
  );
}
