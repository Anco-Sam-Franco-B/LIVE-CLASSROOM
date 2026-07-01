import { useState, useEffect } from 'react';
import { meetingsAPI, coursesAPI } from '../../services/api';
import { Video, Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { ListSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';

export default function AdminMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({ courseId: '', title: '', description: '', scheduledAt: '', durationMinutes: 60 });

  const loadData = () => {
    Promise.all([meetingsAPI.getAll(), coursesAPI.getAll({ all: true })])
      .then(([meetRes, courseRes]) => { setMeetings(meetRes.data.data); setCourses(courseRes.data.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setForm({ courseId: '', title: '', description: '', scheduledAt: '', durationMinutes: 60 });
    setEditingMeeting(null);
    setShowForm(false);
  };

  const openEdit = (meeting) => {
    setEditingMeeting(meeting);
    setForm({
      courseId: meeting.course_id || '',
      title: meeting.title,
      description: meeting.description || '',
      scheduledAt: meeting.scheduled_at ? new Date(meeting.scheduled_at).toISOString().slice(0, 16) : '',
      durationMinutes: meeting.duration_minutes || 60,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMeeting) {
        await meetingsAPI.update(editingMeeting.id, form);
        setToast({ type: 'success', message: 'Meeting updated!' });
      } else {
        await meetingsAPI.create(form);
        setToast({ type: 'success', message: 'Meeting scheduled!' });
      }
      resetForm();
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed' });
    }
  };

  const deleteMeeting = async (id) => {
    try {
      await meetingsAPI.delete(id);
      setMeetings(prev => prev.filter(m => m.id !== id));
      setToast({ type: 'success', message: 'Meeting deleted' });
    } catch (err) { setToast({ type: 'error', message: err.response?.data?.message || 'Failed' }); }
  };

  if (loading) return <><PageHeader title="Meetings" /><ListSkeleton count={5} /></>;

  return (
    <div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <PageHeader title="Meetings" description={`${meetings.length} meeting${meetings.length !== 1 ? 's' : ''}`} actions={<button onClick={() => { resetForm(); setShowForm(true); }} className="neon-btn flex items-center space-x-2"><Plus size={20} /><span>Schedule</span></button>} />

      {showForm && (
        <div className="neon-card mb-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Title</label>
                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="neon-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Course</label>
                <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} className="neon-input">
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="neon-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Scheduled</label>
                <input type="datetime-local" required value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} className="neon-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Duration (min)</label>
                <input type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 60 })} className="neon-input" />
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="neon-btn">{editingMeeting ? 'Update' : 'Schedule'} Meeting</button>
              <button type="button" onClick={resetForm} className="neon-btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {meetings.length === 0 && !showForm ? (
        <EmptyState icon={Video} title="No meetings scheduled" description="Schedule a live class to get started." action={<button onClick={() => setShowForm(true)} className="neon-btn">Schedule Meeting</button>} />
      ) : (
        <div className="neon-card overflow-hidden">
          <table className="w-full text-sm neon-table">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-neon)' }}>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Title</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Course</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Teacher</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Scheduled</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Status</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((m) => (
                <tr key={m.id} className="border-b" style={{ borderColor: 'var(--border-neon)' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(0,255,65,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>{m.title}</td>
                  <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{m.course_title}</td>
                  <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{m.teacher_name}</td>
                  <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{new Date(m.scheduled_at).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`neon-badge ${m.status === 'live' ? 'neon-badge-success' : m.status === 'ended' ? 'neon-badge-danger' : 'neon-badge-info'}`}>{m.status}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {m.status === 'scheduled' && (
                        <>
                          <button onClick={() => openEdit(m)} className="neon-btn-outline p-2"><Pencil size={16} /></button>
                          <button onClick={() => setConfirm({ action: () => deleteMeeting(m.id), title: 'Delete Meeting', message: `Delete "${m.title}"?` })} className="neon-btn-danger p-2"><Trash2 size={16} /></button>
                        </>
                      )}
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
