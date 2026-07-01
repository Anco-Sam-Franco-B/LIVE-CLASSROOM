import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../services/api';
import { Eye, Trash2, BookOpen, Plus } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import SearchInput from '../../components/DebouncedInput';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';

export default function CourseManagement() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirm, setConfirm] = useState(null);
  const toast = useToast();
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    coursesAPI.getAll({ all: true, limit, page, search: search || undefined })
      .then(({ data }) => {
        setCourses(data.data);
        setTotal(data.pagination?.total || data.data.length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search]);

  const deleteCourse = async (id) => {
    try {
      await coursesAPI.delete(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast('Course deleted', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to delete', 'error'); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PageHeader title="Course Management" description={`${total} courses found`} actions={<button onClick={() => navigate('/admin/courses/create')} className="neon-btn flex items-center space-x-2"><Plus size={20} /><span>Add Course</span></button>} />
      <div className="flex gap-4 mb-6">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search courses..." className="flex-1" />
      </div>
      {loading ? <TableSkeleton rows={8} cols={6} /> : courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses found" description="Try adjusting your search." />
      ) : (
        <>
          <div className="neon-card overflow-hidden">
            <table className="w-full text-sm neon-table">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-neon)' }}>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Course</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Teacher</th>
                  <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Price</th>
                  <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Students</th>
                  <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Status</th>
                  <th className="text-right py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-b" style={{ borderColor: 'var(--border-neon)' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(0,255,65,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td className="py-3 px-4 font-medium max-w-xs truncate" style={{ color: 'var(--text-primary)' }}>{c.title}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{c.teacher_name}</td>
                    <td className="py-3 px-4 text-center" style={{ color: 'var(--text-secondary)' }}>{c.is_free ? 'Free' : `UGX ${parseFloat(c.price).toLocaleString()}`}</td>
                    <td className="py-3 px-4 text-center" style={{ color: 'var(--text-secondary)' }}>{c.enrollment_count}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`neon-badge ${c.status === 'published' ? 'neon-badge-success' : 'neon-badge-warning'}`}>{c.status}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => navigate(`/admin/courses/${c.id}/edit`)} className="neon-btn-outline p-2"><Eye size={16} /></button>
                        <button onClick={() => setConfirm({ action: () => deleteCourse(c.id), title: 'Delete Course', message: `Delete "${c.title}"? This cannot be undone.` })} className="neon-btn-danger p-2"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
      <ConfirmDialog isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={confirm?.action} title={confirm?.title} message={confirm?.message} />
    </div>
  );
}
