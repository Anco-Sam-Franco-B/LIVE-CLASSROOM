import { useState, useEffect } from 'react';
import { assignmentsAPI, coursesAPI } from '../../services/api';
import { Plus, FileText, Pencil, Trash2 } from 'lucide-react';
import Toast from '../../components/Toast';
import PageHeader from '../../components/PageHeader';
import { ListSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';

const emptyForm = { title: '', description: '', due_date: '', total_points: '', passing_points: '', course_id: '', file_types: '' };

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const load = () => {
    setLoading(true);
    Promise.all([assignmentsAPI.getAll(), coursesAPI.getTeacherCourses()])
      .then(([assRes, courseRes]) => {
        setAssignments(assRes.data.data || []);
        setCourses(courseRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreateModal = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const handleEdit = (a) => {
    setEditing(a.id);
    setForm({
      title: a.title || '',
      description: a.description || '',
      due_date: a.due_date ? a.due_date.slice(0, 10) : '',
      total_points: a.total_points ?? '',
      passing_points: a.passing_points ?? '',
      course_id: a.course_id || '',
      file_types: a.file_types || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        total_points: Number(form.total_points),
        passing_points: Number(form.passing_points),
      };
      if (editing) {
        await assignmentsAPI.update(editing, payload);
        setToast({ type: 'success', message: 'Assignment updated' });
      } else {
        await assignmentsAPI.create(payload);
        setToast({ type: 'success', message: 'Assignment created' });
      }
      setShowModal(false);
      setEditing(null);
      load();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Something went wrong' });
    }
  };

  const handleDelete = async () => {
    try {
      await assignmentsAPI.delete(confirmDelete);
      setToast({ type: 'success', message: 'Assignment deleted' });
      setConfirmDelete(null);
      load();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Something went wrong' });
    }
  };

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  if (loading) return <><PageHeader title="Assignments" /><ListSkeleton count={6} /></>;

  return (
    <div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <PageHeader
        title="Assignments"
        description={`${assignments.length} assignment${assignments.length !== 1 ? 's' : ''}`}
        actions={
          <button onClick={openCreateModal} className="btn-primary flex items-center space-x-2">
            <Plus size={20} /><span>Create Assignment</span>
          </button>
        }
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit Assignment' : 'Create Assignment'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input className="input-field" required value={form.title} onChange={(e) => update('title', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" className="input-field" value={form.due_date} onChange={(e) => update('due_date', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select className="input-field" required value={form.course_id} onChange={(e) => update('course_id', e.target.value)}>
                    <option value="">Select course</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Points</label>
                  <input type="number" min="0" className="input-field" required value={form.total_points} onChange={(e) => update('total_points', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing Points</label>
                  <input type="number" min="0" className="input-field" required value={form.passing_points} onChange={(e) => update('passing_points', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allowed File Types</label>
                <input className="input-field" placeholder="e.g. pdf, doc, zip" value={form.file_types} onChange={(e) => update('file_types', e.target.value)} />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => { setShowModal(false); setEditing(null); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignments.length === 0 ? (
        <EmptyState icon={FileText} title="No assignments yet" description="Create your first assignment." />
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  <FileText className="text-indigo-600 mt-1 shrink-0" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    <p className="text-sm text-gray-500">{a.course_title}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                      <span>Points: {a.total_points} / Pass: {a.passing_points}</span>
                      <span>Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No deadline'}</span>
                      {a.file_types && <span>Files: {a.file_types}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-4 shrink-0">
                  <button onClick={() => handleEdit(a)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600"><Pencil size={16} /></button>
                  <button onClick={() => setConfirmDelete(a.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          isOpen={!!confirmDelete}
          title="Delete Assignment?"
          message="Are you sure? This cannot be undone."
          onConfirm={handleDelete}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
