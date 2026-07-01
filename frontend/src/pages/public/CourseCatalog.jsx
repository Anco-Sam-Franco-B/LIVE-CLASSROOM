import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI, categoriesAPI, cmsAPI } from '../../services/api';
import { Search, Star, Users, BookOpen, GraduationCap, Compass } from 'lucide-react';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [cms, setCms] = useState({});

  useEffect(() => {
    cmsAPI.getPublic('courses')
      .then(({ data }) => { if (data.data) setCms(data.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, catRes] = await Promise.all([
          coursesAPI.getAll({ limit: 50 }),
          categoriesAPI.getAll(),
        ]);
        setCourses(coursesRes.data.data);
        setCategories(catRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || c.category_id === parseInt(category);
    const matchLevel = !level || c.level === level;
    return matchSearch && matchCat && matchLevel;
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{
        position: 'relative',
        padding: '80px 0 100px',
        overflow: 'hidden',
        background: 'var(--bg-dark)',
      }}>
        <div style={{
          position: 'absolute',
          top: '-30%', left: '-10%',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,65,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'pulse 4s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%', right: '-5%',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,65,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'pulse 6s ease-in-out infinite reverse',
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 1 }}>
          <div className="text-center mb-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <GraduationCap size={28} style={{ color: 'var(--neon)' }} />
              <span style={{ color: 'var(--neon)', fontSize: '0.875rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Knowledge Hub</span>
            </div>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--neon) 50%, var(--text-primary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{cms.hero?.title || "Explore Courses"}</h1>
            <p style={{
              fontSize: '1.125rem',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto',
              animation: 'fadeInUp 0.8s ease-out',
            }}>
              {cms.hero?.subtitle || "Discover courses from world-class teachers and unlock your potential"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ marginTop: '-50px', position: 'relative', zIndex: 2 }}>
        <div className="neon-card p-4 sm:p-6 mb-10" style={{
          backdropFilter: 'blur(20px)',
          background: 'rgba(10, 10, 26, 0.85)',
        }}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[220px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--neon)' }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." className="neon-input pl-10" style={{ paddingLeft: '2.5rem' }} />
            </div>
            <div className="relative" style={{ minWidth: '180px' }}>
              <BookOpen size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neon)', zIndex: 1, pointerEvents: 'none' }} />
              <select value={category} onChange={e => setCategory(e.target.value)} className="neon-input" style={{ paddingLeft: '2.25rem', minWidth: '180px' }}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="relative" style={{ minWidth: '160px' }}>
              <Compass size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neon)', zIndex: 1, pointerEvents: 'none' }} />
              <select value={level} onChange={e => setLevel(e.target.value)} className="neon-input" style={{ paddingLeft: '2.25rem', minWidth: '160px' }}>
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="neon-card overflow-hidden p-0" style={{ background: 'var(--bg-card)' }}>
                <div style={{ height: '176px', background: 'linear-gradient(90deg, var(--bg-dark) 25%, var(--bg-dark-secondary) 50%, var(--bg-dark) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                <div className="p-5 space-y-3">
                  <div style={{ height: '20px', width: '60%', borderRadius: '4px', background: 'linear-gradient(90deg, var(--bg-dark) 25%, var(--bg-dark-secondary) 50%, var(--bg-dark) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                  <div style={{ height: '16px', width: '80%', borderRadius: '4px', background: 'linear-gradient(90deg, var(--bg-dark) 25%, var(--bg-dark-secondary) 50%, var(--bg-dark) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                  <div style={{ height: '14px', width: '40%', borderRadius: '4px', background: 'linear-gradient(90deg, var(--bg-dark) 25%, var(--bg-dark-secondary) 50%, var(--bg-dark) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="neon-card text-center py-16" style={{ maxWidth: '520px', margin: '0 auto' }}>
            <Compass size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 1.5rem', display: 'block', opacity: 0.5 }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No courses found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters to discover more courses</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(course => (
              <Link key={course.id} to={`/courses/${course.slug}`} className="neon-card overflow-hidden p-0 group" style={{ display: 'block', position: 'relative', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}>
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, var(--neon), #00b8ff, var(--neon))',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite',
                  zIndex: 1,
                  opacity: 0.6,
                  transition: 'opacity 0.3s ease',
                  boxShadow: '0 0 20px rgba(0,255,65,0.4)',
                }} />
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={course.thumbnail_url ? `http://localhost:5000${course.thumbnail_url}` : 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=200&fit=crop'}
                    alt={course.title}
                    className="w-full h-44 object-cover"
                    style={{ transition: 'transform 0.5s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(10,10,26,0.6) 0%, transparent 50%)',
                    pointerEvents: 'none',
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '14px',
                    display: 'flex',
                    gap: '8px',
                  }}>
                    <span className="neon-badge neon-badge-info" style={{ fontSize: '0.7rem', padding: '2px 10px' }}>{course.level}</span>
                    {course.is_free && <span className="neon-badge neon-badge-success" style={{ fontSize: '0.7rem', padding: '2px 10px' }}>Free</span>}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:underline" style={{ color: 'var(--text-primary)', transition: 'color 0.2s' }}>{course.title}</h3>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{course.teacher_name}</p>
                  <div className="flex items-center justify-between text-sm pt-3" style={{ borderTop: '1px solid var(--border-neon)', color: 'var(--text-muted)' }}>
                    <span className="flex items-center space-x-1"><Star size={15} style={{ color: '#ffc800' }} /><span style={{ color: 'var(--text-secondary)' }}>{parseFloat(course.rating).toFixed(1)}</span></span>
                    <span className="flex items-center space-x-1"><Users size={15} /><span style={{ color: 'var(--text-secondary)' }}>{course.enrollment_count}</span></span>
                    <span className="font-semibold" style={{ color: 'var(--neon)', fontSize: '0.9rem' }}>{course.is_free ? 'Free' : `UGX ${course.price?.toLocaleString()}`}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
