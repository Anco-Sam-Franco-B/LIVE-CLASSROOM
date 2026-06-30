import { useState, useEffect } from 'react';
import { meetingsAPI, coursesAPI } from '../../services/api';
import { Video, Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { ListSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';
import LiveKitMeeting from '../../components/LiveKitMeeting';
import { Input, Select } from '../../components/FormFields';

export default function TeacherMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({ courseId: '', title: '', description: '', scheduledAt: '', durationMinutes: 60 });

  const loadData = () => {
    Promise.all([meetingsAPI.getAll(), coursesAPI.getTeacherCourses()])
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
        const { data } = await meetingsAPI.create(form);
        setMeetings(prev => [data.data, ...prev]);
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

  const handleJoin = (meeting) => {
    setActiveMeeting(meeting);
  };

  if (activeMeeting) {
    return <LiveKitMeeting meetingId={activeMeeting.id} onLeave={() => setActiveMeeting(null)} />;
  }

  if (loading) return <><PageHeader title="Meetings" /><ListSkeleton count={5} /></>;

  return (
    <div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <PageHeader title="Meetings" description={`${meetings.length} meeting${meetings.length !== 1 ? 's' : ''}`} actions={<button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center space-x-2"><Plus size={20} /><span>Schedule</span></button>} />

      {showForm && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input label="Title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <Select label="Course" value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} placeholder="Select Course">
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </Select>
              <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <Input label="Scheduled" type="datetime-local" required value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} />
              <Input label="Duration (min)" type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) })} />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">{editingMeeting ? 'Update' : 'Schedule'} Meeting</button>
              <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {meetings.length === 0 && !showForm ? (
        <EmptyState icon={Video} title="No meetings scheduled" description="Schedule a live class to get started." action={<button onClick={() => setShowForm(true)} className="btn-primary">Schedule Meeting</button>} />
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="card flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <Video className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                  <p className="text-sm text-gray-500">{meeting.description} {meeting.course_title && `- ${meeting.course_title}`}</p>
                  <p className="text-sm text-gray-500 mt-1">{new Date(meeting.scheduled_at).toLocaleString()} - {meeting.duration_minutes}min</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {meeting.status === 'scheduled' && (
                  <>
                    <button onClick={() => openEdit(meeting)} className="btn-outline p-2"><Pencil size={16} /></button>
                    <button onClick={() => setConfirm({ action: () => deleteMeeting(meeting.id), title: 'Delete Meeting', message: `Delete "${meeting.title}"?` })} className="btn-danger p-2"><Trash2 size={16} /></button>
                  </>
                )}
                <button onClick={() => handleJoin(meeting)} className="btn-primary text-sm">Join</button>
                <span className={`badge ${meeting.status === 'live' ? 'badge-success' : meeting.status === 'ended' ? 'badge-danger' : 'badge-info'}`}>{meeting.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={confirm?.action} title={confirm?.title} message={confirm?.message} />
    </div>
  );
}
