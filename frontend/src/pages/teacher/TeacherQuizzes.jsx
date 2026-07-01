import { useState, useEffect } from 'react';
import { quizzesAPI, coursesAPI } from '../../services/api';
import { Plus, ClipboardList, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { ListSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';

const emptyForm = {
  title: '',
  description: '',
  passing_score: '',
  time_limit_minutes: '',
  max_attempts: '',
  course_id: '',
};

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const toast = useToast();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      quizzesAPI.getAll(),
      coursesAPI.getTeacherCourses(),
    ])
      .then(([quizRes, courseRes]) => {
        setQuizzes(quizRes.data.data);
        setCourses(courseRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setEditingQuiz(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (quiz) => {
    setEditingQuiz(quiz);
    setForm({
      title: quiz.title || '',
      description: quiz.description || '',
      passing_score: quiz.passing_score ?? '',
      time_limit_minutes: quiz.time_limit_minutes ?? '',
      max_attempts: quiz.max_attempts ?? '',
      course_id: quiz.course_id ?? '',
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      passing_score: Number(form.passing_score),
      time_limit_minutes: Number(form.time_limit_minutes),
      max_attempts: Number(form.max_attempts),
    };
    setSaving(true);
    try {
      if (editingQuiz) {
        await quizzesAPI.update(editingQuiz.id, payload);
        toast('Quiz updated', 'success');
      } else {
        await quizzesAPI.create(payload);
        toast('Quiz created', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteQuiz = async (id) => {
    try {
      await quizzesAPI.delete(id);
      setQuizzes(prev => prev.filter(q => q.id !== id));
      toast('Quiz deleted', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  if (loading) return <><PageHeader title="Quizzes" /><ListSkeleton count={6} /></>;

  return (
    <div>
      <PageHeader
        title="Quizzes"
        description={`${quizzes.length} quiz${quizzes.length !== 1 ? 'zes' : ''}`}
        actions={
          <button onClick={openCreate} className="neon-btn flex items-center space-x-2">
            <Plus size={20} /><span>Create Quiz</span>
          </button>
        }
      />

      {quizzes.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No quizzes yet" description="Create quizzes to assess your students." />
      ) : (
        <div className="space-y-4">
          {quizzes.map((q) => (
            <div key={q.id} className="neon-card" style={{ background: 'var(--bg-card)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3 min-w-0">
                  <ClipboardList style={{ color: 'var(--neon)' }} size={20} className="mt-1 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{q.title}</h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{q.course_title}</p>
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{q.description}</p>
                    <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      Pass: {q.passing_score}% | Time: {q.time_limit_minutes}min | Max Attempts: {q.max_attempts}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(q)} className="neon-btn-outline p-2" title="Edit quiz">
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setConfirm({
                      action: () => deleteQuiz(q.id),
                      title: 'Delete Quiz',
                      message: `Delete "${q.title}"? This action cannot be undone.`,
                    })}
                    className="neon-btn-ghost p-2"
                    style={{ background: '#ff3232' }}
                    title="Delete quiz"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={confirm?.action}
        title={confirm?.title}
        message={confirm?.message}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModalOpen(false)}>
          <div className="rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderColor: 'var(--border-neon)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{editingQuiz ? 'Edit Quiz' : 'Create Quiz'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-muted)' }} onMouseEnter={e=>e.currentTarget.style.color='var(--text-secondary)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="neon-input"
                  placeholder="Quiz title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="neon-input"
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Passing Score (%)</label>
                  <input
                    type="number"
                    name="passing_score"
                    value={form.passing_score}
                    onChange={handleChange}
                    required
                    min={0}
                    max={100}
                    className="neon-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Time Limit (min)</label>
                  <input
                    type="number"
                    name="time_limit_minutes"
                    value={form.time_limit_minutes}
                    onChange={handleChange}
                    required
                    min={1}
                    className="neon-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Max Attempts</label>
                  <input
                    type="number"
                    name="max_attempts"
                    value={form.max_attempts}
                    onChange={handleChange}
                    required
                    min={1}
                    className="neon-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Course</label>
                  <select
                    name="course_id"
                    value={form.course_id}
                    onChange={handleChange}
                    required
                    className="neon-input"
                  >
                    <option value="">Select course</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4" style={{ borderColor: 'var(--border-neon)' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="neon-btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="neon-btn">
                  {saving ? 'Saving...' : editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
