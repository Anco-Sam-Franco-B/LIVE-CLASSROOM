import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI, categoriesAPI } from '../../services/api';
import { useToast } from '../../components/Toast';
import PageHeader from '../../components/PageHeader';
import { ImagePlus, Loader2 } from 'lucide-react';

export default function CreateCourse() {
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', categoryId: '', shortDescription: '', description: '',
    price: '', level: 'beginner', language: 'English', requirements: '',
    learningObjectives: '', targetAudience: '',
  });
  const [saving, setSaving] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  useEffect(() => {
    categoriesAPI.getAll().then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await coursesAPI.create(form);
      const courseId = data.data.id;
      if (coverFile) {
        const fd = new FormData();
        fd.append('thumbnail', coverFile);
        await coursesAPI.uploadThumbnail(courseId, fd);
      }
      toast('Course created!', 'success');
      navigate(`/teacher/courses/${courseId}/edit`);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create course', 'error');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Create New Course" description="Set up your course details and start building content" />
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Course Title</label>
                  <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="neon-input text-lg" placeholder="e.g., Introduction to Web Development" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Category</label>
                    <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="neon-input">
                      <option value="">Select category</option>
                      {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Level</label>
                    <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="neon-input">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="all-levels">All Levels</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Short Description</label>
                  <textarea rows={2} value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} className="neon-input" placeholder="Brief overview that appears in course cards" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Full Description</label>
                  <textarea rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="neon-input" placeholder="Detailed description of what students will learn" />
                </div>
              </div>
            </div>

            <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Pricing & Settings</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Price (UGX)</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="neon-input" placeholder="0 for free" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Language</label>
                  <input type="text" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className="neon-input" />
                </div>
              </div>
            </div>

            <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Curriculum Details</h2>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Requirements (one per line)</label>
                <textarea rows={3} value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} className="neon-input" placeholder="Basic computer skills..." />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Learning Objectives (one per line)</label>
                <textarea rows={3} value={form.learningObjectives} onChange={e => setForm({ ...form, learningObjectives: e.target.value })} className="neon-input" placeholder="Build responsive websites..." />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Course Cover Image</h2>
              <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors" style={{ borderColor: 'var(--border-neon)' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--neon)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-neon)'}>
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" className="w-full h-40 object-cover rounded-lg" />
                ) : (
                  <div className="py-8">
                    <ImagePlus className="mx-auto" size={40} style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Click to upload cover image</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Recommended: 1280x720px</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
            </div>

            <div className="neon-card" style={{ background: 'var(--bg-card)' }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Price</span><span className="font-medium">{form.price ? `UGX ${form.price}` : 'Free'}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Level</span><span className="capitalize">{form.level}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Language</span><span>{form.language}</span></div>
              </div>
            </div>

            <button type="submit" disabled={saving} className="neon-btn w-full flex items-center justify-center space-x-2">
              {saving ? <><Loader2 size={18} className="animate-spin" /><span>Creating...</span></> : <span>Create Course</span>}
            </button>
            <button type="button" onClick={() => navigate('/teacher/courses')} className="neon-btn-ghost w-full">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}