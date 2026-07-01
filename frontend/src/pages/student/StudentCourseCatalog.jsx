import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI, categoriesAPI } from '../../services/api';
import { Search, Star, Users, BookOpen, ExternalLink, CreditCard, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import Toast from '../../components/Toast';

export default function StudentCourseCatalog() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, catRes, myRes] = await Promise.all([
          coursesAPI.getAll({ limit: 50 }),
          categoriesAPI.getAll(),
          coursesAPI.getMyCourses(),
        ]);
        setCourses(coursesRes.data.data);
        setCategories(catRes.data.data);
        setEnrolledIds(new Set(myRes.data.data.map(e => e.course_id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEnroll = async (course) => {
    setEnrolling(course.id);
    try {
      const { data } = await coursesAPI.enroll(course.id);
      setEnrolledIds(prev => new Set([...prev, course.id]));
      setToast({ type: 'success', message: data.message || 'Enrolled successfully' });
      if (course.is_free || course.price === 0) {
        setTimeout(() => navigate(`/student/courses/${course.id}/learn`), 800);
      } else {
        setTimeout(() => navigate('/student/payment'), 800);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Enrollment failed' });
    } finally {
      setEnrolling(null);
    }
  };

  const filtered = courses.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.short_description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || c.category_id === parseInt(category);
    const matchLevel = !level || c.level === level;
    return matchSearch && matchCat && matchLevel;
  });

  return (
    <div>
      <PageHeader title="Course Catalog" description="Browse all available courses and enroll" />

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." className="neon-input pl-10" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="neon-input w-auto">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={level} onChange={e => setLevel(e.target.value)} className="neon-input w-auto">
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {loading ? (
        <CardSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>No courses found</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(course => {
            const isEnrolled = enrolledIds.has(course.id);
            return (
              <div key={course.id} className="neon-card overflow-hidden p-0 flex flex-col" onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,255,65,0.15)'} onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                <button onClick={() => navigate(`/student/courses/${course.id}`)} className="text-left">
                  <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=200&fit=crop'} alt={course.title} className="w-full h-44 object-cover" loading="lazy" />
                </button>
                <div className="p-5 flex-1 flex flex-col">
                  <button onClick={() => navigate(`/student/courses/${course.id}`)} className="text-left">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="neon-badge neon-badge-info">{course.level}</span>
                      {course.is_free && <span className="neon-badge neon-badge-success">Free</span>}
                      {isEnrolled && <span className="neon-badge" style={{ background: 'rgba(0,255,65,0.1)', color: 'var(--neon)', borderColor: 'var(--neon)' }}>Enrolled</span>}
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2" style={{ color: 'var(--text-primary)' }}>{course.title}</h3>
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{course.teacher_name}</p>
                    <div className="flex items-center justify-between text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center space-x-1"><Star size={16} style={{ color: '#ffc800' }} className="fill-current" /><span>{parseFloat(course.rating).toFixed(1)}</span></span>
                      <span className="flex items-center space-x-1"><Users size={16} /><span>{course.enrollment_count}</span></span>
                      <span className="flex items-center space-x-1"><BookOpen size={16} /><span>{course.total_lessons} lessons</span></span>
                    </div>
                  </button>
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-lg" style={{ color: 'var(--neon)' }}>
                        {course.is_free ? 'Free' : `UGX ${parseFloat(course.price || 0).toLocaleString()}`}
                      </span>
                    </div>
                    {isEnrolled ? (
                      <button onClick={() => navigate(`/student/courses/${course.id}/learn`)} className="neon-btn w-full flex items-center justify-center space-x-2">
                        <ExternalLink size={18} /><span>Continue Learning</span>
                      </button>
                    ) : (
                      <button onClick={() => handleEnroll(course)} disabled={enrolling === course.id} className="neon-btn w-full flex items-center justify-center space-x-2">
                        {enrolling === course.id ? (
                          <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /><span>Enrolling...</span></>
                        ) : course.is_free || course.price === 0 ? (
                          <><CheckCircle size={18} /><span>Enroll Free</span></>
                        ) : (
                          <><CreditCard size={18} /><span>Enroll & Pay</span></>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
