import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesAPI, cmsAPI } from '../../services/api';
import { Star, Clock, Users, BookOpen, CheckCircle, Play, ChevronDown, Award, Shield, BarChart, Home } from 'lucide-react';

export default function CourseDetail() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState([]);
  const [cms, setCms] = useState({});

  useEffect(() => {
    cmsAPI.getPublic('courses')
      .then(({ data }) => { if (data.data) setCms(data.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await coursesAPI.getBySlug(slug);
        setCourse(data.data);
        if (data.data?.modules) {
          setExpandedModules([data.data.modules[0]?.id]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug]);

  const toggleModule = (id) => {
    setExpandedModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ height: '16px', width: '200px', borderRadius: '4px', marginBottom: '24px', background: 'linear-gradient(90deg, var(--bg-dark) 25%, var(--bg-dark-secondary) 50%, var(--bg-dark) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          <div style={{ height: '400px', borderRadius: '16px', marginBottom: '32px', background: 'linear-gradient(90deg, var(--bg-dark) 25%, var(--bg-dark-secondary) 50%, var(--bg-dark) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div style={{ height: '32px', width: '70%', borderRadius: '6px', background: 'linear-gradient(90deg, var(--bg-dark) 25%, var(--bg-dark-secondary) 50%, var(--bg-dark) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div style={{ height: '16px', width: '90%', borderRadius: '4px', background: 'linear-gradient(90deg, var(--bg-dark) 25%, var(--bg-dark-secondary) 50%, var(--bg-dark) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div style={{ height: '16px', width: '60%', borderRadius: '4px', background: 'linear-gradient(90deg, var(--bg-dark) 25%, var(--bg-dark-secondary) 50%, var(--bg-dark) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            </div>
            <div style={{ height: '400px', borderRadius: '16px', background: 'linear-gradient(90deg, var(--bg-dark) 25%, var(--bg-dark-secondary) 50%, var(--bg-dark) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <BookOpen size={64} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
        <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{cms.hero?.title || "Course not found"}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{cms.hero?.subtitle || "The course you're looking for doesn't exist or has been removed"}</p>
        <Link to="/courses" className="neon-btn" style={{ background: 'var(--neon)', color: '#fff', textDecoration: 'none' }}>{cms.hero?.cta_primary || "Browse Courses"}</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{
        position: 'relative',
        minHeight: '420px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `url(${course.thumbnail_url || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&h=600&fit=crop'}) center/cover no-repeat`,
          filter: 'blur(2px) brightness(0.3)',
          transform: 'scale(1.05)',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(10,10,26,0.92) 0%, rgba(10,10,26,0.7) 50%, rgba(10,10,26,0.92) 100%)',
        }} />
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, transparent, var(--neon), transparent)',
          animation: 'shimmer 2s infinite',
          backgroundSize: '200% 100%',
          opacity: 0.8,
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full" style={{ zIndex: 1, paddingTop: '60px', paddingBottom: '40px' }}>
          <nav className="flex items-center space-x-2 text-sm mb-6">
            <Link to="/" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--neon)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <Home size={15} />
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <Link to="/courses" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--neon)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              Courses
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{course.title}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8 items-end">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-3">
                <span className="neon-badge neon-badge-info" style={{ fontSize: '0.75rem' }}>{course.level}</span>
                {course.is_free && <span className="neon-badge neon-badge-success" style={{ fontSize: '0.75rem' }}>Free</span>}
                {course.has_certificate && <span className="flex items-center space-x-1" style={{ color: 'var(--neon)', fontSize: '0.75rem' }}><Award size={14} /><span>Certificate</span></span>}
              </div>
              <h1 style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
              }}>{course.title}</h1>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '650px', marginBottom: '1.25rem' }}>{course.short_description}</p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span className="flex items-center space-x-1.5" style={{ color: 'var(--text-muted)' }}>
                  <Star size={16} style={{ color: '#ffc800' }} />
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{parseFloat(course.rating).toFixed(1)}</span>
                  <span>({course.rating_count} reviews)</span>
                </span>
                <span className="flex items-center space-x-1.5" style={{ color: 'var(--text-muted)' }}>
                  <Users size={16} />
                  <span>{course.enrollment_count} enrolled</span>
                </span>
                <span className="flex items-center space-x-1.5" style={{ color: 'var(--text-muted)' }}>
                  <BookOpen size={16} />
                  <span>{course.total_lessons} lessons</span>
                </span>
                <span className="flex items-center space-x-1.5" style={{ color: 'var(--text-muted)' }}>
                  <Clock size={16} />
                  <span>{course.duration_hours || 'Self-paced'}</span>
                </span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--neon)', textShadow: '0 0 30px rgba(0,255,65,0.3)' }}>
                  {course.is_free ? 'Free' : `UGX ${course.price?.toLocaleString()}`}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Full course access</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ marginTop: '-20px', position: 'relative', zIndex: 2 }}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--text-primary)' }}>
                <span style={{ width: '4px', height: '20px', background: 'var(--neon)', borderRadius: '2px', display: 'inline-block' }} />
                <span>About This Course</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{course.description}</p>
            </section>

            {course.learning_objectives && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--text-primary)' }}>
                  <span style={{ width: '4px', height: '20px', background: 'var(--neon)', borderRadius: '2px', display: 'inline-block' }} />
                  <span>What You'll Learn</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {course.learning_objectives.split('\n').filter(Boolean).map((obj, i) => (
                    <div key={i} className="flex items-start space-x-3 p-3 rounded-lg" style={{
                      background: 'rgba(0,255,65,0.04)',
                      border: '1px solid rgba(0,255,65,0.08)',
                      transition: 'all 0.3s ease',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,65,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,255,65,0.2)'; e.currentTarget.style.transform = 'translateX(4px)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,65,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,255,65,0.08)'; e.currentTarget.style.transform = 'translateX(0)' }}>
                      <div style={{
                        flexShrink: 0,
                        width: '22px', height: '22px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,255,65,0.15)',
                        marginTop: '2px',
                      }}>
                        <CheckCircle size={13} style={{ color: 'var(--neon)' }} />
                      </div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{obj}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {course.requirements && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--text-primary)' }}>
                  <span style={{ width: '4px', height: '20px', background: 'var(--neon)', borderRadius: '2px', display: 'inline-block' }} />
                  <span>Requirements</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {course.requirements.split('\n').filter(Boolean).map((req, i) => (
                    <span key={i} style={{
                      padding: '6px 16px',
                      borderRadius: '100px',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      background: 'rgba(0,255,65,0.05)',
                      border: '1px solid rgba(0,255,65,0.12)',
                      backdropFilter: 'blur(10px)',
                    }}>{req}</span>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--text-primary)' }}>
                <span style={{ width: '4px', height: '20px', background: 'var(--neon)', borderRadius: '2px', display: 'inline-block' }} />
                <span>Course Content</span>
              </h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {course.modules?.length || 0} modules &middot; {course.total_lessons} lessons
              </div>
              {course.modules?.map((mod, i) => {
                const isOpen = expandedModules.includes(mod.id);
                return (
                  <div key={mod.id} className="mb-3 rounded-xl overflow-hidden" style={{
                    border: '1px solid var(--border-neon)',
                    background: 'var(--bg-dark)',
                    transition: 'border-color 0.3s ease',
                  }}>
                    <button onClick={() => toggleModule(mod.id)} style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      textAlign: 'left',
                    }}>
                      <div className="flex items-center space-x-3">
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isOpen ? 'rgba(0,255,65,0.15)' : 'rgba(0,255,65,0.05)',
                          transition: 'background 0.3s ease',
                        }}>
                          <Play size={13} style={{ color: isOpen ? 'var(--neon)' : 'var(--text-muted)', transition: 'color 0.3s ease' }} />
                        </div>
                        <div>
                          <span>Module {i + 1}: {mod.title}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{mod.lessons?.length || 0} lessons</span>
                        <ChevronDown size={16} style={{
                          color: 'var(--text-muted)',
                          transition: 'transform 0.3s ease',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }} />
                      </div>
                    </button>
                    <div style={{
                      maxHeight: isOpen ? `${(mod.lessons?.length || 0) * 48}px` : '0px',
                      overflow: 'hidden',
                      transition: 'max-height 0.4s ease',
                    }}>
                      {mod.lessons?.map((lesson) => (
                        <div key={lesson.id} className="flex items-center space-x-3 px-4 py-2.5 text-sm" style={{
                          borderTop: '1px solid var(--border-neon)',
                          color: 'var(--text-secondary)',
                          paddingLeft: '3.5rem',
                        }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--neon)',
                            opacity: 0.5,
                            flexShrink: 0,
                          }} />
                          <span style={{ flex: 1 }}>{lesson.title}</span>
                          {lesson.duration_minutes > 0 && (
                            <span className="flex items-center space-x-1" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                              <Clock size={12} />
                              <span>{lesson.duration_minutes} min</span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="neon-card sticky top-24" style={{ overflow: 'visible' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  fontSize: '2.25rem',
                  fontWeight: 800,
                  color: 'var(--neon)',
                  textShadow: '0 0 40px rgba(0,255,65,0.25)',
                }}>
                  {course.is_free ? 'Free' : `UGX ${course.price?.toLocaleString()}`}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Full lifetime access</div>
              </div>
              <Link to="/register" className="neon-btn w-full text-center block mb-6" style={{
                background: 'var(--neon)',
                color: '#fff',
                textDecoration: 'none',
                animation: 'pulseGlow 2s ease-in-out infinite',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <span style={{ position: 'relative', zIndex: 1 }}>Enroll Now</span>
              </Link>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-neon)' }}>
                  <div className="flex items-center space-x-2" style={{ color: 'var(--text-muted)' }}>
                    <Clock size={15} />
                    <span>Duration</span>
                  </div>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{course.duration_hours || 'Self-paced'}</span>
                </div>
                <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-neon)' }}>
                  <div className="flex items-center space-x-2" style={{ color: 'var(--text-muted)' }}>
                    <BookOpen size={15} />
                    <span>Lessons</span>
                  </div>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{course.total_lessons}</span>
                </div>
                <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-neon)' }}>
                  <div className="flex items-center space-x-2" style={{ color: 'var(--text-muted)' }}>
                    <BarChart size={15} />
                    <span>Level</span>
                  </div>
                  <span className="font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{course.level}</span>
                </div>
                <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-neon)' }}>
                  <div className="flex items-center space-x-2" style={{ color: 'var(--text-muted)' }}>
                    <Shield size={15} />
                    <span>Language</span>
                  </div>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{course.language || 'English'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2" style={{ color: 'var(--text-muted)' }}>
                    <Award size={15} />
                    <span>Certificate</span>
                  </div>
                  <span className="font-medium" style={{ color: course.has_certificate ? 'var(--neon)' : 'var(--text-muted)' }}>{course.has_certificate ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div className="pt-6" style={{ borderTop: '1px solid var(--border-neon)' }}>
                <div className="flex items-center space-x-3">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(0,255,65,0.2), rgba(0,255,65,0.05))',
                    border: '1px solid rgba(0,255,65,0.2)',
                    flexShrink: 0,
                  }}>
                    <span className="font-semibold" style={{ color: 'var(--neon)', fontSize: '1.1rem' }}>{course.teacher_name?.[0]}</span>
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{course.teacher_name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Course Instructor</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
