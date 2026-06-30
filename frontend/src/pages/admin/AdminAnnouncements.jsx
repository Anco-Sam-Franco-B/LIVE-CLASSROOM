import { useState, useEffect } from 'react';
import { announcementsAPI, coursesAPI } from '../../services/api';
import { Megaphone, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { ListSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Input, Select, Textarea } from '../../components/FormFields';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal', targetAudience: 'all', courseId: '' });

  const load = () => {
    setLoading(true);
    Promise.all([announcementsAPI.getAll(), coursesAPI.getAll()])
      .then(([annRes, courseRes]) => { setAnnouncements(annRes.data.data); setCourses(courseRes.data.data || []); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await announcementsAPI.update(editing, form);
        setToast({ type: 'success', message: 'Announcement updated' });
      } else {
        await announcementsAPI.create(form);
        setToast({ type: 'success', message: 'Announcement created' });
      }
      setShowForm(false); setEditing(null);
      setForm({ title: '', content: '', priority: 'normal', targetAudience: 'all', courseId: '' });
      load();
    } catch (err) { setToast({ type: 'error', message: err.response?.data?.message || 'Error' }); }
  };

  const handleEdit = (a) => {
    setEditing(a.id);
    setForm({ title: a.title, content: a.content, priority: a.priority, targetAudience: a.target_audience, courseId: a.course_id || '' });
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await announcementsAPI.delete(confirmDelete);
      setToast({ type: 'success', message: 'Announcement deleted' });
      setConfirmDelete(null); load();
    } catch (err) { setToast({ type: 'error', message: err.response?.data?.message || 'Error' }); }
  };

  const priorityBadge = (p) => {
    const map = { urgent: 'badge-danger', high: 'badge-warning', normal: 'badge-info', low: 'badge-secondary' };
    return <span className={`badge ${map[p] || 'badge-info'}`}>{p}</span>;
  };

  if (loading) return <><PageHeader title="Announcements" /><ListSkeleton count={5} /></>;

  return (
    <div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <PageHeader title="Announcements" description="Send announcements to students and teachers" actions={!showForm && <button onClick={() => { setEditing(null); setForm({ title: '', content: '', priority: 'normal', targetAudience: 'all', courseId: '' }); setShowForm(true); }} className="btn-primary flex items-center space-x-2"><Plus size={20} /><span>New Announcement</span></button>} />

      {showForm && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit Announcement' : 'Create Announcement'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Textarea label="Content" required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={5} />
            <div className="grid md:grid-cols-3 gap-4">
              <Select label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option><option value="low">Low</option>
              </Select>
              <Select label="Target Audience" value={form.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value })}>
                <option value="all">All Users</option><option value="students">Students Only</option><option value="teachers">Teachers Only</option><option value="course">Specific Course</option>
              </Select>
              <Select label="Course (optional)" value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}>
                <option value="">All Courses</option>{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </Select>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" description="Create your first announcement." />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    {priorityBadge(a.priority)}
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{a.content}</p>
                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-400">
                    <span>By {a.author_name}</span>
                    <span>{new Date(a.published_at).toLocaleDateString()}</span>
                    <span>{a.read_count || 0} reads</span>
                    {a.course_id && <span>Course: {a.course_title}</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-4">
                  <button onClick={() => handleEdit(a)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                  <button onClick={() => setConfirmDelete(a.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog title="Delete Announcement?" message="Are you sure? This cannot be undone." onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  );
}
