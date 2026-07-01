import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI, modulesAPI, lessonsAPI, quizzesAPI, meetingsAPI, categoriesAPI, enrollmentsAPI, gradesAPI, certificatesAPI } from '../../services/api';
import {
  Save, Plus, Trash2, GripVertical, ChevronDown, ChevronRight, ImagePlus, Video, FileText,
  HelpCircle, Calendar, Users, Award, BookOpen, Pencil, ExternalLink, X, Copy, Check,
  ListOrdered, Search, Download, Share2, Clock, Play, AlertCircle, Loader2
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import PageHeader from '../../components/PageHeader';
import { CardSkeleton, TableSkeleton } from '../../components/LoadingSkeleton';

const TABS = [
  { id: 'details', label: 'Details', icon: BookOpen },
  { id: 'modules', label: 'Modules', icon: ListOrdered },
  { id: 'lessons', label: 'Lessons', icon: Video },
  { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
  { id: 'meetings', label: 'Meetings', icon: Calendar },
  { id: 'grades', label: 'Grades', icon: Award },
  { id: 'certificates', label: 'Certificates', icon: Award },
];

export default function EditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);
  const [course, setCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [saving, setSaving] = useState(false);

  // Form state for course details
  const [editForm, setEditForm] = useState({
    title: '', shortDescription: '', description: '', price: '', level: 'beginner',
    language: 'English', categoryId: '', requirements: '', learningObjectives: '', targetAudience: '',
  });
  const [coverPreview, setCoverPreview] = useState(null);

  // Modules state
  const [newModule, setNewModule] = useState({ title: '', description: '' });
  const [expandedModules, setExpandedModules] = useState({});
  const [editingModule, setEditingModule] = useState(null);

  // Lessons state
  const [newLesson, setNewLesson] = useState({ moduleId: '', title: '', contentType: 'video', videoUrl: '', articleContent: '', durationMinutes: '' });
  const [editingLesson, setEditingLesson] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  // Quizzes state
  const [quizzes, setQuizzes] = useState([]);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({ title: '', description: '', passingScore: 60, timeLimitMinutes: 30, maxAttempts: 1, lessonId: '' });
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [questionForm, setQuestionForm] = useState({ questionText: '', questionType: 'multiple_choice', points: 1, options: ['', ''], correctAnswer: '' });
  const [questions, setQuestions] = useState({});

  // Meetings state
  const [meetings, setMeetings] = useState([]);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [meetingForm, setMeetingForm] = useState({ title: '', description: '', scheduledAt: '', durationMinutes: 60, recordingUrl: '' });

  // Grades/Students state
  const [students, setStudents] = useState([]);
  const [gradeForm, setGradeForm] = useState({ studentId: '', score: '', totalPoints: 100, remarks: '' });

  // Certificate state
const [certificateTemplates, setCertificateTemplates] = useState([]);
const [selectedTemplateId, setSelectedTemplateId] = useState('');
const [issuingCert, setIssuingCert] = useState(false);
const [issuingAll, setIssuingAll] = useState(false);
const [draggingModule, setDraggingModule] = useState(null);
const [draggingLesson, setDraggingLesson] = useState(null);

  const reorderModules = useCallback(async (fromIdx, toIdx) => {
    if (!course) return;
    const updated = [...(course.modules || [])];
    const [removed] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, removed);
    setCourse(prev => ({ ...prev, modules: updated }));
    try {
      await modulesAPI.reorder(updated.map(m => m.id));
    } catch { toast('Failed to reorder modules', 'error'); }
  }, [course]);

  const reorderLessons = useCallback(async (moduleId, fromIdx, toIdx) => {
    if (!course) return;
    const mod = course.modules?.find(m => m.id === moduleId);
    if (!mod) return;
    const updated = [...(mod.lessons || [])];
    const [removed] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, removed);
    setCourse(prev => ({
      ...prev,
      modules: prev.modules?.map(m => m.id === moduleId ? { ...m, lessons: updated } : m)
    }));
    try {
      await lessonsAPI.reorder(updated.map(l => l.id));
    } catch { toast('Failed to reorder lessons', 'error'); }
  }, [course]);

  const loadCourse = async () => {
    try {
      const [courseRes, catRes, quizRes, meetRes] = await Promise.all([
        coursesAPI.getById(courseId),
        categoriesAPI.getAll(),
        quizzesAPI.getAll({ course_id: courseId }),
        meetingsAPI.getAll({ courseId }),
      ]);
      const c = courseRes.data.data;
      setCourse(c);
      setEditForm({
        title: c.title || '', shortDescription: c.short_description || '', description: c.description || '',
        price: c.price || '', level: c.level || 'beginner', language: c.language || 'English',
        categoryId: c.category_id || '', requirements: c.requirements || '',
        learningObjectives: c.learning_objectives || '', targetAudience: c.target_audience || '',
      });
      setCategories(catRes.data.data || []);
      setQuizzes(quizRes.data.data || []);
      setMeetings(meetRes.data.data || []);
      if (c.thumbnail_url) setCoverPreview(c.thumbnail_url);
      const expanded = {};
      c.modules?.forEach(m => { expanded[m.id] = true; });
      setExpandedModules(expanded);

      // Load questions for each quiz
      for (const q of (quizRes.data.data || [])) {
        try {
      const qRes = await quizzesAPI.getQuestions({ quizId: q.id });
      setQuestions(prev => ({ ...prev, [q.id]: qRes.data.data || [] }));
        } catch { }
      }
    } catch (err) {
      toast('Failed to load course', 'error');
      navigate('/teacher/courses');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadCourse(); }, [courseId]);

  const updateCourse = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await coursesAPI.update(courseId, editForm);
      setCourse(prev => ({ ...prev, ...editForm }));
      toast('Course saved', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target.result);
    reader.readAsDataURL(file);
    try {
      const fd = new FormData();
      fd.append('thumbnail', file);
      const { data } = await coursesAPI.uploadThumbnail(courseId, fd);
      setCourse(prev => ({ ...prev, thumbnail_url: data.data.thumbnail_url }));
      setCoverPreview(data.data.thumbnail_url);
      toast('Cover image updated', 'success');
    } catch (err) { toast('Failed to upload cover', 'error'); }
  };

  // ===== MODULES =====
  const addModule = async () => {
    if (!newModule.title) return toast('Enter a module title', 'error');
    try {
      const { data } = await modulesAPI.create({ courseId, ...newModule });
      setCourse(prev => ({ ...prev, modules: [...(prev.modules || []), data.data] }));
      setExpandedModules(prev => ({ ...prev, [data.data.id]: true }));
      setNewModule({ title: '', description: '' });
      toast('Module added', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const updateModule = async () => {
    if (!editingModule) return;
    try {
      await modulesAPI.update(editingModule.id, { title: editingModule.title, description: editingModule.description });
      setCourse(prev => ({
        ...prev,
        modules: prev.modules?.map(m => m.id === editingModule.id ? { ...m, title: editingModule.title, description: editingModule.description } : m),
      }));
      setEditingModule(null);
      toast('Module updated', 'success');
    } catch (err) { toast('Failed', 'error'); }
  };

  const deleteModule = async (id) => {
    try {
      await modulesAPI.delete(id);
      setCourse(prev => ({ ...prev, modules: prev.modules?.filter(m => m.id !== id) }));
      toast('Module deleted', 'success');
    } catch (err) { toast('Failed', 'error'); }
  };

  // ===== LESSONS =====
  const addLesson = async () => {
    if (!newLesson.moduleId) return toast('Select a module', 'error');
    if (!newLesson.title) return toast('Enter a lesson title', 'error');
    try {
      const { data } = await lessonsAPI.create(newLesson);
      setCourse(prev => ({
        ...prev,
        modules: prev.modules?.map(m => m.id === newLesson.moduleId ? { ...m, lessons: [...(m.lessons || []), data.data] } : m),
      }));
      setNewLesson({ moduleId: '', title: '', contentType: 'video', videoUrl: '', articleContent: '', durationMinutes: '' });
      toast('Lesson added', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const saveLesson = async () => {
    if (!editingLesson) return;
    try {
      await lessonsAPI.update(editingLesson.id, editingLesson);
      setCourse(prev => ({
        ...prev,
        modules: prev.modules?.map(m => ({
          ...m,
          lessons: m.lessons?.map(l => l.id === editingLesson.id ? editingLesson : l),
        })),
      }));
      toast('Lesson saved', 'success');
    } catch (err) { toast('Failed', 'error'); }
  };

  const deleteLesson = async (id) => {
    try {
      await lessonsAPI.delete(id);
      setCourse(prev => ({
        ...prev,
        modules: prev.modules?.map(m => ({ ...m, lessons: m.lessons?.filter(l => l.id !== id) })),
      }));
      if (activeLesson?.id === id) setActiveLesson(null);
      toast('Lesson deleted', 'success');
    } catch (err) { toast('Failed', 'error'); }
  };

  const openLessonEditor = (lesson) => {
    setEditingLesson({ ...lesson });
    setActiveLesson(lesson);
  };

  // ===== QUIZZES =====
  const loadQuizQuestions = async (quizId) => {
    try {
      const { data } = await quizzesAPI.getQuestions({ quizId });
      setQuestions(prev => ({ ...prev, [quizId]: data.data || [] }));
    } catch { }
  };

  const saveQuiz = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        courseId,
        title: quizForm.title, description: quizForm.description,
        passingScore: Number(quizForm.passingScore), timeLimitMinutes: Number(quizForm.timeLimitMinutes),
        maxAttempts: Number(quizForm.maxAttempts), lessonId: quizForm.lessonId || null,
      };
      if (editingQuiz) {
        await quizzesAPI.update(editingQuiz.id, payload);
        toast('Quiz updated', 'success');
      } else {
        const { data } = await quizzesAPI.create(payload);
        setQuizzes(prev => [...prev, data.data]);
        toast('Quiz created', 'success');
      }
      setShowQuizModal(false); setEditingQuiz(null);
      const qRes = await quizzesAPI.getAll({ course_id: courseId });
      setQuizzes(qRes.data.data || []);
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const deleteQuiz = async (id) => {
    try {
      await quizzesAPI.delete(id);
      setQuizzes(prev => prev.filter(q => q.id !== id));
      toast('Quiz deleted', 'success');
    } catch (err) { toast('Failed', 'error'); }
  };

  const saveQuestion = async (e) => {
    e.preventDefault(); if (!activeQuizId) return;
    setSaving(true);
    try {
      const payload = {
        quizId: activeQuizId, questionText: questionForm.questionText,
        questionType: questionForm.questionType, points: Number(questionForm.points),
        options: JSON.parse(JSON.stringify(questionForm.options.filter(o => o))),
        correctAnswer: questionForm.correctAnswer,
      };
      await quizzesAPI.addQuestion(payload);
      await loadQuizQuestions(activeQuizId);
      setShowQuestionModal(false);
      setQuestionForm({ questionText: '', questionType: 'multiple_choice', points: 1, options: ['', ''], correctAnswer: '' });
      toast('Question added', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const deleteQuestion = async (quizId, questionId) => {
    try {
      await quizzesAPI.deleteQuestion(questionId);
      setQuestions(prev => ({ ...prev, [quizId]: (prev[quizId] || []).filter(q => q.id !== questionId) }));
      toast('Question deleted', 'success');
    } catch (err) { toast('Failed', 'error'); }
  };

  const addOption = () => setQuestionForm(prev => ({ ...prev, options: [...prev.options, ''] }));
  const updateOption = (i, v) => {
    const opts = [...questionForm.options]; opts[i] = v;
    setQuestionForm(prev => ({ ...prev, options: opts }));
  };
  const removeOption = (i) => {
    if (questionForm.options.length <= 2) return;
    setQuestionForm(prev => ({ ...prev, options: prev.options.filter((_, idx) => idx !== i) }));
  };

  // ===== MEETINGS =====
  const saveMeeting = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        courseId, title: meetingForm.title, description: meetingForm.description,
        scheduledAt: meetingForm.scheduledAt, durationMinutes: Number(meetingForm.durationMinutes),
        recordingUrl: meetingForm.recordingUrl,
      };
      if (editingMeeting) {
        await meetingsAPI.update(editingMeeting.id, payload);
        toast('Meeting updated', 'success');
      } else {
        const { data } = await meetingsAPI.create(payload);
        setMeetings(prev => [...prev, data.data]);
        toast('Meeting scheduled', 'success');
      }
      setShowMeetingModal(false); setEditingMeeting(null);
      setMeetingForm({ title: '', description: '', scheduledAt: '', durationMinutes: 60, recordingUrl: '' });
      const { data } = await meetingsAPI.getAll({ courseId });
      setMeetings(data.data || []);
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  // ===== GRADES =====
  const loadStudents = async () => {
    try {
      const { data } = await coursesAPI.getCourseStudents(courseId);
      setStudents(data.data || []);
    } catch { }
  };

  const submitGrade = async (e) => {
    e.preventDefault();
    if (!gradeForm.studentId) return toast('Select a student', 'error');
    try {
      await gradesAPI.create({
        enrollmentId: gradeForm.studentId,
        score: Number(gradeForm.score),
        totalPoints: Number(gradeForm.totalPoints),
        remarks: gradeForm.remarks,
      });
      toast('Grade saved', 'success');
      setGradeForm({ studentId: '', score: '', totalPoints: 100, remarks: '' });
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  // ===== CERTIFICATES =====
  const loadCertificateTemplates = async () => {
    try {
      const { data } = await (await import('../../services/api')).certificateTemplatesAPI.getAll();
      setCertificateTemplates(data.data || []);
    } catch { }
  };

  const issueCertificate = async (enrollmentId) => {
    setIssuingCert(true);
    try {
      const payload = { enrollmentId, grade: 'A' };
      if (selectedTemplateId) payload.templateId = selectedTemplateId;
      await certificatesAPI.issue(payload);
      toast('Certificate issued successfully!', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to issue certificate', 'error');
    } finally { setIssuingCert(false); }
  };

  const issueAllCertificates = async () => {
    const completed = students.filter(s => s.is_completed);
    if (completed.length === 0) return toast('No students to issue to', 'info');
    setIssuingAll(true);
    let count = 0;
    for (const s of completed) {
      try {
        const payload = { enrollmentId: s.enrollment_id, grade: 'A' };
        if (selectedTemplateId) payload.templateId = selectedTemplateId;
        await certificatesAPI.issue(payload);
        count++;
      } catch { /* skip failed */ }
    }
    toast(`Issued ${count} of ${completed.length} certificates`, 'success');
    setIssuingAll(false);
  };

  useEffect(() => { if (activeTab === 'grades' || activeTab === 'certificates') loadStudents(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'certificates') loadCertificateTemplates(); }, [activeTab]);

  if (loading) return <><PageHeader title="Course Builder" /><CardSkeleton count={5} /></>;
  if (!course) return <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>Course not found</div>;

  const TabButton = ({ tab, icon: Icon }) => (
    <button onClick={() => setActiveTab(tab.id)}
      className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'text-white' : ''}`}
      style={activeTab === tab.id ? { background: 'var(--neon)' } : { color: 'var(--text-secondary)' }}
      onMouseEnter={e => { if (activeTab !== tab.id) { e.currentTarget.style.background = 'var(--bg-card)'; } }}
      onMouseLeave={e => { if (activeTab !== tab.id) { e.currentTarget.style.background = 'transparent'; } }}>
      <Icon size={16} /><span>{tab.label}</span>
    </button>
  );

  return (
    <div>
      <PageHeader title={course.title || 'Course Builder'} description="Manage your course content, structure, and assessments"
        actions={
          <div className="flex items-center space-x-2">
            <span className={`neon-badge ${course.is_published ? 'neon-badge-success' : 'neon-badge-warning'}`}>{course.is_published ? 'Published' : 'Draft'}</span>
            <button onClick={async () => { try { await coursesAPI.publish(courseId); loadCourse(); toast('Status updated', 'success'); } catch { toast('Failed', 'error'); } }} className="neon-btn-outline text-sm">
              {course.is_published ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {TABS.map(tab => <TabButton key={tab.id} tab={tab} icon={tab.icon} />)}
      </div>

      {/* ===== TAB: DETAILS ===== */}
      {activeTab === 'details' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Course Information</h2>
              <form onSubmit={updateCourse} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Title</label>
                    <input type="text" required value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="neon-input text-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Category</label>
                    <select value={editForm.categoryId} onChange={e => setEditForm({ ...editForm, categoryId: e.target.value })} className="neon-input">
                      <option value="">Select</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Level</label>
                    <select value={editForm.level} onChange={e => setEditForm({ ...editForm, level: e.target.value })} className="neon-input">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="all-levels">All Levels</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Short Description</label>
                    <textarea rows={2} value={editForm.shortDescription} onChange={e => setEditForm({ ...editForm, shortDescription: e.target.value })} className="neon-input" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Full Description</label>
                    <textarea rows={5} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="neon-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Price (UGX)</label>
                    <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="neon-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Language</label>
                    <input type="text" value={editForm.language} onChange={e => setEditForm({ ...editForm, language: e.target.value })} className="neon-input" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Requirements (one per line)</label>
                    <textarea rows={3} value={editForm.requirements} onChange={e => setEditForm({ ...editForm, requirements: e.target.value })} className="neon-input" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Learning Objectives (one per line)</label>
                    <textarea rows={3} value={editForm.learningObjectives} onChange={e => setEditForm({ ...editForm, learningObjectives: e.target.value })} className="neon-input" />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="neon-btn flex items-center space-x-2">
                  <Save size={18} /><span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Cover Image</h2>
              <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed rounded-lg overflow-hidden cursor-pointer transition-colors" style={{ borderColor: 'var(--border-neon)' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--neon)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-neon)'}>
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="w-full h-36 object-cover" />
                ) : (
                  <div className="py-8 text-center">
                    <ImagePlus className="mx-auto" size={36} style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Upload cover</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </div>
            <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Course Stats</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Modules</span><span>{course.modules?.length || 0}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Lessons</span><span>{course.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0)}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Quizzes</span><span>{quizzes.length}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Meetings</span><span>{meetings.length}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Students</span><span>{course.enrollment_count || 0}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: MODULES ===== */}
      {activeTab === 'modules' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Course Modules ({course.modules?.length || 0})</h2>
              </div>
              {(!course.modules || course.modules.length === 0) ? (
                <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  <BookOpen size={40} className="mx-auto mb-2" />
                  <p>No modules yet. Add your first module to start building your course.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {course.modules?.map((mod, modIdx) => (
                    <div key={mod.id}
                      draggable
                      onDragStart={() => setDraggingModule(modIdx)}
                      onDragOver={e => { e.preventDefault(); }}
                      onDrop={() => { if (draggingModule !== null && draggingModule !== modIdx) { reorderModules(draggingModule, modIdx); setDraggingModule(null); } }}
                      className="rounded-lg overflow-hidden transition-shadow"
                      style={{ borderColor: 'var(--border-neon)', borderWidth: '1px', borderStyle: 'solid', boxShadow: draggingModule === modIdx ? '0 0 15px rgba(0,255,65,0.3)' : 'none' }}>
                      <div className="flex items-center justify-between px-4 py-3 transition-colors" style={{ background: 'var(--bg-dark)' }}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--bg-card)'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-dark)'}>
                        <div className="flex items-center space-x-3 flex-1" onClick={() => setExpandedModules(prev => ({ ...prev, [mod.id]: !prev[mod.id] }))}>
                          <GripVertical className="shrink-0 cursor-grab" size={16} style={{ color: 'var(--text-muted)' }} />
                          <div className="min-w-0 flex-1">
                            {editingModule?.id === mod.id ? (
                              <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                                <input type="text" value={editingModule.title} onChange={e => setEditingModule({ ...editingModule, title: e.target.value })} className="neon-input text-sm py-1" autoFocus />
                                <button type="button" onClick={updateModule} style={{ color: 'var(--neon)' }}><Check size={16} /></button>
                                <button type="button" onClick={() => setEditingModule(null)} style={{ color: 'var(--text-muted)' }} onMouseEnter={e=>e.currentTarget.style.color='var(--text-secondary)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}><X size={16} /></button>
                              </div>
                            ) : (
                              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{mod.title}</span>
                            )}
                            <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{mod.lessons?.length || 0} lessons</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); setEditingModule({ ...mod }); }} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-card)';e.currentTarget.style.color='var(--neon)'}}
                            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-muted)'}}><Pencil size={14} /></button>
                          <button onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this module and all its lessons?')) deleteModule(mod.id); }} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-card)';e.currentTarget.style.color='#ff3232'}}
                            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-muted)'}}><Trash2 size={14} /></button>
                          {expandedModules[mod.id] ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
                        </div>
                      </div>
                      {expandedModules[mod.id] && (
                        <div className="px-4 py-2 space-y-1" style={{ background: 'var(--bg-dark)' }}>
                          {mod.lessons?.length > 0 ? mod.lessons.map((lesson, lIdx) => (
                            <div key={lesson.id}
                              draggable
                              onDragStart={() => setDraggingLesson({ moduleId: mod.id, idx: lIdx })}
                              onDragOver={e => { e.preventDefault(); }}
                              onDrop={() => { if (draggingLesson && draggingLesson.moduleId === mod.id && draggingLesson.idx !== lIdx) { reorderLessons(mod.id, draggingLesson.idx, lIdx); setDraggingLesson(null); } }}
                              className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer group"
                              style={{ boxShadow: draggingLesson?.moduleId === mod.id && draggingLesson?.idx === lIdx ? '0 0 10px rgba(0,255,65,0.2)' : 'none' }}
                              onMouseEnter={e=>e.currentTarget.style.background='rgba(0,255,65,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                              onClick={() => { setActiveTab('lessons'); openLessonEditor(lesson); }}>
                              <div className="flex items-center space-x-2 min-w-0">
                                <GripVertical size={12} className="shrink-0 cursor-grab" style={{ color: 'var(--text-muted)' }} />
                                {lesson.content_type === 'video' ? <Video size={14} style={{ color: 'var(--neon)' }} className="shrink-0" /> :
                                  lesson.content_type === 'article' ? <FileText size={14} style={{ color: 'var(--neon)' }} className="shrink-0" /> :
                                    <HelpCircle size={14} style={{ color: '#ffc800' }} className="shrink-0" />}
                                <span className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{lesson.title}</span>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{lesson.duration_minutes || '?'}min</span>
                              </div>
                            </div>
                          )) : (
                            <p className="text-sm py-2 text-center" style={{ color: 'var(--text-muted)' }}>No lessons in this module</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Add Module</h2>
              <div className="space-y-3">
                <input type="text" value={newModule.title} onChange={e => setNewModule({ ...newModule, title: e.target.value })} className="neon-input" placeholder="Module title" />
                <textarea rows={2} value={newModule.description} onChange={e => setNewModule({ ...newModule, description: e.target.value })} className="neon-input" placeholder="Module description (optional)" />
                <button onClick={addModule} className="neon-btn w-full flex items-center justify-center space-x-2">
                  <Plus size={18} /><span>Add Module</span>
                </button>
              </div>
            </div>
            <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Quick Add Lesson</h2>
              <div className="space-y-3">
                <select value={newLesson.moduleId} onChange={e => setNewLesson({ ...newLesson, moduleId: e.target.value })} className="neon-input">
                  <option value="">Select module</option>
                  {course.modules?.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
                <input type="text" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} className="neon-input" placeholder="Lesson title" />
                <select value={newLesson.contentType} onChange={e => setNewLesson({ ...newLesson, contentType: e.target.value })} className="neon-input">
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                  <option value="quiz">Quiz</option>
                </select>
                <button onClick={addLesson} className="neon-btn w-full flex items-center justify-center space-x-2">
                  <Plus size={18} /><span>Add Lesson</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: LESSONS ===== */}
      {activeTab === 'lessons' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            {course.modules?.map(mod => {
              const moduleLessons = mod.lessons || [];
              return (
                <div key={mod.id} className="neon-card" style={{ background: 'var(--bg-card)' }}>
                  <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{mod.title}</h3>
                  <div className="space-y-1">
                    {moduleLessons.map((lesson, lIdx) => (
                      <div key={lesson.id}
                        draggable
                        onDragStart={(e) => { e.stopPropagation(); setDraggingLesson({ moduleId: mod.id, idx: lIdx }); }}
                        onDragOver={e => { e.preventDefault(); }}
                        onDrop={() => { if (draggingLesson && draggingLesson.moduleId === mod.id && draggingLesson.idx !== lIdx) { reorderLessons(mod.id, draggingLesson.idx, lIdx); setDraggingLesson(null); } }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer"
                        style={{
                          color: activeLesson?.id === lesson.id ? 'var(--neon)' : 'var(--text-secondary)',
                          background: activeLesson?.id === lesson.id ? 'rgba(0,255,65,0.1)' : 'transparent',
                          fontWeight: activeLesson?.id === lesson.id ? '500' : '400',
                          boxShadow: draggingLesson?.moduleId === mod.id && draggingLesson?.idx === lIdx ? '0 0 10px rgba(0,255,65,0.2)' : 'none'
                        }}
                        onMouseEnter={e => { if (activeLesson?.id !== lesson.id) e.currentTarget.style.background = 'rgba(0,255,65,0.05)'; }}
                        onMouseLeave={e => { if (activeLesson?.id !== lesson.id) e.currentTarget.style.background = 'transparent'; }}
                        onClick={() => openLessonEditor(lesson)}>
                        <div className="flex items-center space-x-2">
                          <GripVertical size={12} className="shrink-0 cursor-grab" style={{ color: 'var(--text-muted)' }} />
                          {lesson.content_type === 'video' ? <Video size={14} className="shrink-0" style={{ color: 'var(--neon)' }} /> :
                            lesson.content_type === 'article' ? <FileText size={14} className="shrink-0" style={{ color: 'var(--neon)' }} /> : <HelpCircle size={14} className="shrink-0" style={{ color: '#ffc800' }} />}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                      </div>
                    ))}
                    {moduleLessons.length === 0 && (
                      <p className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>No lessons</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-2">
            {activeLesson && editingLesson ? (
              <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Edit Lesson</h2>
                  <button onClick={() => { setActiveLesson(null); setEditingLesson(null); }} style={{ color: 'var(--text-muted)' }} onMouseEnter={e=>e.currentTarget.style.color='var(--text-secondary)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}><X size={20} /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Lesson Title</label>
                    <input type="text" value={editingLesson.title} onChange={e => setEditingLesson({ ...editingLesson, title: e.target.value })} className="neon-input" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Content Type</label>
                      <select value={editingLesson.content_type} onChange={e => setEditingLesson({ ...editingLesson, content_type: e.target.value })} className="neon-input">
                        <option value="video">Video</option>
                        <option value="article">Article / Text</option>
                        <option value="quiz">Quiz</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Duration (minutes)</label>
                      <input type="number" value={editingLesson.duration_minutes || ''} onChange={e => setEditingLesson({ ...editingLesson, duration_minutes: parseInt(e.target.value) || 0 })} className="neon-input" />
                    </div>
                  </div>
                  {editingLesson.content_type === 'video' && (
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Video URL</label>
                      <input type="url" value={editingLesson.video_url || ''} onChange={e => setEditingLesson({ ...editingLesson, video_url: e.target.value })} className="neon-input" placeholder="https://..." />
                      {editingLesson.video_url && (
                        <div className="mt-2 aspect-video rounded-lg overflow-hidden" style={{ background: '#0a0a0a' }}>
                          <video src={editingLesson.video_url} controls className="w-full h-full" />
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                    <textarea rows={3} value={editingLesson.description || ''} onChange={e => setEditingLesson({ ...editingLesson, description: e.target.value })} className="neon-input" />
                  </div>
                  {editingLesson.content_type === 'article' && (
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Article Content</label>
                      <textarea rows={10} value={editingLesson.article_content || ''} onChange={e => setEditingLesson({ ...editingLesson, article_content: e.target.value })} className="neon-input font-mono text-sm" placeholder="Write your lesson content here..." />
                    </div>
                  )}
                  <div className="flex space-x-3 pt-2">
                    <button onClick={saveLesson} className="neon-btn flex items-center space-x-2"><Save size={16} /><span>Save Lesson</span></button>
                    <button onClick={() => { if (window.confirm('Delete this lesson?')) deleteLesson(editingLesson.id); }} className="neon-btn-ghost flex items-center space-x-2" style={{ background: '#ff3232' }}><Trash2 size={16} /><span>Delete</span></button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
                <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                  <Video size={48} className="mx-auto mb-3" />
                  <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Select a lesson to edit</p>
                  <p className="text-sm mt-1">Choose a lesson from the sidebar or go to the Modules tab to add new ones</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB: QUIZZES ===== */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Course Quizzes ({quizzes.length})</h2>
            <button onClick={() => { setEditingQuiz(null); setQuizForm({ title: '', description: '', passingScore: 60, timeLimitMinutes: 30, maxAttempts: 1, lessonId: '' }); setShowQuizModal(true); }}
              className="neon-btn flex items-center space-x-2"><Plus size={18} /><span>Add Quiz</span></button>
          </div>

          {quizzes.length === 0 ? (
            <div className="neon-card text-center py-8" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
              <HelpCircle size={40} className="mx-auto mb-2" />
              <p>No quizzes yet. Create quizzes to assess your students.</p>
            </div>
          ) : quizzes.map((quiz) => (
            <div key={quiz.id} className="neon-card" style={{ background: 'var(--bg-card)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{quiz.title}</h3>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Pass: {quiz.passing_score}% | Time: {quiz.time_limit_minutes}min | Max: {quiz.max_attempts}</span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{quiz.description}</p>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <button onClick={() => { setEditingQuiz(quiz); setQuizForm({ title: quiz.title, description: quiz.description || '', passingScore: quiz.passing_score, timeLimitMinutes: quiz.time_limit_minutes, maxAttempts: quiz.max_attempts, lessonId: quiz.lesson_id || '' }); setShowQuizModal(true); }}
                    className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,255,65,0.1)';e.currentTarget.style.color='var(--neon)'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-muted)'}}><Pencil size={15} /></button>
                  <button onClick={() => { if (window.confirm('Delete this quiz?')) deleteQuiz(quiz.id); }}
                    className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,255,65,0.1)';e.currentTarget.style.color='#ff3232'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-muted)'}}><Trash2 size={15} /></button>
                </div>
              </div>

              {/* Questions */}
              <div className="pt-3" style={{ borderColor: 'var(--border-neon)', borderTopWidth: '1px' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Questions ({(questions[quiz.id] || []).length})</span>
                  <button onClick={() => { setActiveQuizId(quiz.id); setShowQuestionModal(true); }}
                    className="text-xs font-medium flex items-center space-x-1" style={{ color: 'var(--neon)' }}>
                    <Plus size={14} /><span>Add Question</span>
                  </button>
                </div>
                {(questions[quiz.id] || []).length > 0 ? (
                  <div className="space-y-2">
                    {(questions[quiz.id] || []).map((q, idx) => (
                      <div key={q.id} className="flex items-start justify-between p-2 rounded-lg" style={{ background: 'var(--bg-dark)' }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}><span className="font-medium" style={{ color: 'var(--text-muted)' }}>{idx + 1}.</span> {q.question_text}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Type: {q.question_type} | Points: {q.points}</p>
                        </div>
                        <button onClick={() => deleteQuestion(quiz.id, q.id)} className="p-1 shrink-0" style={{ color: 'var(--text-muted)' }} onMouseEnter={e=>e.currentTarget.style.color='#ff3232'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-center py-2" style={{ color: 'var(--text-muted)' }}>No questions yet</p>
                )}
              </div>
            </div>
          ))}

          {/* Quiz Modal */}
          {showQuizModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowQuizModal(false)}>
              <div className="rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6" style={{ background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{editingQuiz ? 'Edit Quiz' : 'Create Quiz'}</h2>
                <form onSubmit={saveQuiz} className="space-y-4">
                  <input type="text" required value={quizForm.title} onChange={e => setQuizForm({ ...quizForm, title: e.target.value })} className="neon-input" placeholder="Quiz title" />
                  <textarea rows={2} value={quizForm.description} onChange={e => setQuizForm({ ...quizForm, description: e.target.value })} className="neon-input" placeholder="Description" />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Passing Score (%)</label>
                      <input type="number" value={quizForm.passingScore} onChange={e => setQuizForm({ ...quizForm, passingScore: e.target.value })} className="neon-input" min={0} max={100} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Time Limit (min)</label>
                      <input type="number" value={quizForm.timeLimitMinutes} onChange={e => setQuizForm({ ...quizForm, timeLimitMinutes: e.target.value })} className="neon-input" min={1} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Max Attempts</label>
                      <input type="number" value={quizForm.maxAttempts} onChange={e => setQuizForm({ ...quizForm, maxAttempts: e.target.value })} className="neon-input" min={1} />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={() => setShowQuizModal(false)} className="neon-btn-ghost">Cancel</button>
                    <button type="submit" disabled={saving} className="neon-btn">{saving ? 'Saving...' : editingQuiz ? 'Update' : 'Create'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Question Modal */}
          {showQuestionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowQuestionModal(false)}>
              <div className="rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Add Question</h2>
                <form onSubmit={saveQuestion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Question</label>
                    <textarea rows={3} required value={questionForm.questionText} onChange={e => setQuestionForm({ ...questionForm, questionText: e.target.value })} className="neon-input" placeholder="Enter your question" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Type</label>
                      <select value={questionForm.questionType} onChange={e => setQuestionForm({ ...questionForm, questionType: e.target.value, correctAnswer: '' })} className="neon-input">
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="single_choice">Single Choice</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Points</label>
                      <input type="number" value={questionForm.points} onChange={e => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })} className="neon-input" min={1} />
                    </div>
                  </div>

                  {questionForm.questionType === 'true_false' ? (
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Correct Answer</label>
                      <select value={questionForm.correctAnswer} onChange={e => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })} required className="neon-input">
                        <option value="">Select</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Options</label>
                          <button type="button" onClick={addOption} className="text-xs" style={{ color: 'var(--neon)' }}>+ Add option</button>
                        </div>
                        <div className="space-y-2">
                          {questionForm.options.map((opt, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <input type="text" value={opt} onChange={e => updateOption(i, e.target.value)} className="neon-input flex-1 text-sm" placeholder={`Option ${i + 1}`} />
                              <button type="button" onClick={() => removeOption(i)} style={{ color: 'var(--text-muted)' }} onMouseEnter={e=>e.currentTarget.style.color='#ff3232'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}><X size={16} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Correct Answer</label>
                        <select value={questionForm.correctAnswer} onChange={e => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })} required className="neon-input">
                          <option value="">Select correct answer</option>
                          {questionForm.options.filter(o => o).map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={() => setShowQuestionModal(false)} className="neon-btn-ghost">Cancel</button>
                    <button type="submit" disabled={saving} className="neon-btn">{saving ? 'Adding...' : 'Add Question'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: MEETINGS ===== */}
      {activeTab === 'meetings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Live Classes & Meetings ({meetings.length})</h2>
            <button onClick={() => { setEditingMeeting(null); setMeetingForm({ title: '', description: '', scheduledAt: '', durationMinutes: 60, recordingUrl: '' }); setShowMeetingModal(true); }}
              className="neon-btn flex items-center space-x-2"><Plus size={18} /><span>Schedule Meeting</span></button>
          </div>

          {meetings.length === 0 ? (
            <div className="neon-card text-center py-8" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
              <Calendar size={40} className="mx-auto mb-2" />
              <p>No meetings scheduled. Schedule a live class for your students.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="neon-card" style={{ background: 'var(--bg-card)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg" style={{
                        background: meeting.status === 'live' ? 'rgba(0,255,65,0.1)' : meeting.status === 'ended' ? 'var(--bg-dark)' : 'rgba(0,255,65,0.1)'
                      }}>
                        <Calendar size={20} style={{
                          color: meeting.status === 'live' ? 'var(--neon)' : meeting.status === 'ended' ? 'var(--text-muted)' : 'var(--neon)'
                        }} />
                      </div>
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{meeting.title}</h3>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{meeting.description}</p>
                        <div className="flex items-center space-x-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span className="flex items-center"><Clock size={12} className="mr-1" />{new Date(meeting.scheduled_at).toLocaleString()}</span>
                          <span>{meeting.duration_minutes}min</span>
                          <span className={`neon-badge ${meeting.status === 'live' ? 'neon-badge-success' : meeting.status === 'ended' ? 'neon-badge-danger' : 'neon-badge-info'}`}>{meeting.status}</span>
                        </div>
                        {meeting.recording_url && (
                          <a href={meeting.recording_url} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center space-x-1 mt-1" style={{ color: 'var(--neon)' }}>
                            <Play size={12} /><span>View Recording</span>
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button onClick={() => { setEditingMeeting(meeting); setMeetingForm({ title: meeting.title, description: meeting.description || '', scheduledAt: meeting.scheduled_at ? new Date(meeting.scheduled_at).toISOString().slice(0, 16) : '', durationMinutes: meeting.duration_minutes || 60, recordingUrl: meeting.recording_url || '' }); setShowMeetingModal(true); }}
                        className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,255,65,0.1)';e.currentTarget.style.color='var(--neon)'}}
                        onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-muted)'}}><Pencil size={15} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showMeetingModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowMeetingModal(false)}>
              <div className="rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6" style={{ background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}</h2>
                <form onSubmit={saveMeeting} className="space-y-4">
                  <input type="text" required value={meetingForm.title} onChange={e => setMeetingForm({ ...meetingForm, title: e.target.value })} className="neon-input" placeholder="Meeting title" />
                  <textarea rows={2} value={meetingForm.description} onChange={e => setMeetingForm({ ...meetingForm, description: e.target.value })} className="neon-input" placeholder="Description" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Scheduled Date & Time</label>
                      <input type="datetime-local" required value={meetingForm.scheduledAt} onChange={e => setMeetingForm({ ...meetingForm, scheduledAt: e.target.value })} className="neon-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Duration (min)</label>
                      <input type="number" value={meetingForm.durationMinutes} onChange={e => setMeetingForm({ ...meetingForm, durationMinutes: parseInt(e.target.value) || 60 })} className="neon-input" min={5} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Recording URL (after meeting ends)</label>
                    <input type="url" value={meetingForm.recordingUrl} onChange={e => setMeetingForm({ ...meetingForm, recordingUrl: e.target.value })} className="neon-input" placeholder="https://..." />
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={() => setShowMeetingModal(false)} className="neon-btn-ghost">Cancel</button>
                    <button type="submit" disabled={saving} className="neon-btn">{saving ? 'Saving...' : editingMeeting ? 'Update' : 'Schedule'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: GRADES ===== */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Student Grades</h2>
            {students.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                <Users size={40} className="mx-auto mb-2" />
                <p>No students enrolled in this course yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderColor: 'var(--border-neon)' }}>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Student</th>
                      <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Progress</th>
                      <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
                      <th className="text-right py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.enrollment_id} style={{ borderColor: 'var(--border-neon)' }}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(0,255,65,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td className="py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>{s.first_name} {s.last_name}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-20 rounded-full h-2" style={{ background: 'var(--bg-card)' }}><div style={{ background: 'var(--neon)', borderRadius: '9999px', height: '0.5rem', width: `${s.progress || 0}%` }} /></div>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{Number(s.progress ?? 0).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`neon-badge ${s.is_completed ? 'neon-badge-success' : 'neon-badge-warning'}`}>{s.is_completed ? 'Completed' : 'In Progress'}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <form onSubmit={submitGrade} className="flex items-center justify-end space-x-2" onClick={e => e.stopPropagation()}>
                            <input type="hidden" value={s.enrollment_id} />
                            <input type="number" placeholder="Score" className="neon-input w-20 text-sm py-1" value={gradeForm.studentId === s.enrollment_id ? gradeForm.score : ''}
                              onChange={e => setGradeForm({ ...gradeForm, studentId: s.enrollment_id, score: e.target.value })} />
                            <button type="submit" className="neon-btn text-xs py-1.5 px-3">Save</button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB: CERTIFICATES ===== */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Issue Certificates</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Only students who have completed the course can receive certificates.</p>
              </div>
              {certificateTemplates.length > 0 && (
                <select value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)}
                  className="neon-input text-sm max-w-xs">
                  <option value="">Default Template</option>
                  {certificateTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>
            {students.filter(s => s.is_completed).length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                <Award size={40} className="mx-auto mb-2" />
                <p>No students have completed this course yet.</p>
                <p className="text-sm mt-1">Students must finish all lessons to become eligible for a certificate.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 pb-3" style={{ borderColor: 'var(--border-neon)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{students.filter(s => s.is_completed).length} eligible student(s)</span>
                  <button onClick={issueAllCertificates} disabled={issuingAll}
                    className="neon-btn-ghost text-xs py-1.5 px-3 flex items-center space-x-1">
                    <Award size={14} /><span>{issuingAll ? 'Issuing...' : 'Issue to All Completed'}</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderColor: 'var(--border-neon)' }}>
                        <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Student</th>
                        <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Progress</th>
                        <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Completed</th>
                        <th className="text-right py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(s => s.is_completed).map((s) => (
                        <tr key={s.enrollment_id} style={{ borderColor: 'var(--border-neon)' }}
                          onMouseEnter={e=>e.currentTarget.style.background='rgba(0,255,65,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td className="py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>{s.first_name} {s.last_name}</td>
                          <td className="py-3 px-4 text-center" style={{ color: 'var(--text-secondary)' }}>{Number(s.progress ?? 0).toFixed(0)}%</td>
                          <td className="py-3 px-4 text-center">
                            <span className="neon-badge neon-badge-success">Completed</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button onClick={() => issueCertificate(s.enrollment_id)} disabled={issuingCert}
                              className="neon-btn text-xs py-1.5 px-3 flex items-center space-x-1 ml-auto">
                              <Award size={14} /><span>{issuingCert ? 'Issuing...' : 'Issue'}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}