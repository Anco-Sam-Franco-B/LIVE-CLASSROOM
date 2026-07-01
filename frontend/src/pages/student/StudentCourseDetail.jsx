import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../services/api';
import { Star, Users, BookOpen, CheckCircle, Play, Clock, ChevronLeft, ExternalLink, CreditCard } from 'lucide-react';
import Toast from '../../components/Toast';

export default function StudentCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, myRes] = await Promise.all([
          coursesAPI.getById(courseId),
          coursesAPI.getMyCourses(),
        ]);
        setCourse(courseRes.data.data);
        setEnrolledIds(new Set(myRes.data.data.map(e => e.course_id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const isEnrolled = enrolledIds.has(course?.id);

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
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
      setEnrolling(false);
    }
  };

  if (loading) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto" style={{ borderColor: 'var(--neon)', borderTopColor: 'transparent' }} /></div>;
  if (!course) return <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>Course not found</div>;

  return (
    <div>
      <button onClick={() => navigate('/student/courses/browse')} className="flex items-center space-x-1 text-sm mb-4" style={{ color: 'var(--text-secondary)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
        <ChevronLeft size={18} /><span>Back to Catalog</span>
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{course.title}</h1>
          <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>{course.short_description}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center space-x-1"><Star size={18} style={{ color: '#ffc800' }} className="fill-current" /><span className="font-semibold">{parseFloat(course.rating).toFixed(1)}</span> ({course.rating_count} reviews)</span>
            <span className="flex items-center space-x-1"><Users size={18} /><span>{course.enrolled_students || course.enrollment_count} enrolled</span></span>
            <span className="flex items-center space-x-1"><BookOpen size={18} /><span>{course.total_lessons} lessons</span></span>
            <span className="neon-badge neon-badge-info">{course.level}</span>
          </div>

          <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=400&fit=crop'} alt={course.title} className="w-full h-72 object-cover rounded-xl mb-8" />

          <div className="space-y-6">
            {course.description && (
              <section>
                <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Description</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{course.description}</p>
              </section>
            )}
            {course.learning_objectives && (
              <section>
                <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>What You'll Learn</h2>
                <div className="grid md:grid-cols-2 gap-2">
                  {course.learning_objectives.split('\n').filter(Boolean).map((obj, i) => (
                    <div key={i} className="flex items-start space-x-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <CheckCircle className="flex-shrink-0 mt-0.5" size={16} style={{ color: 'var(--neon)' }} />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {course.requirements && (
              <section>
                <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Requirements</h2>
                <ul className="space-y-1">
                  {course.requirements.split('\n').filter(Boolean).map((req, i) => (
                    <li key={i} className="text-sm ml-4 list-disc" style={{ color: 'var(--text-secondary)' }}>{req}</li>
                  ))}
                </ul>
              </section>
            )}
            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Course Content</h2>
              {course.modules?.map((mod, i) => (
                <div key={mod.id} className="rounded-lg mb-3 overflow-hidden" style={{ border: '1px solid var(--border-neon)' }}>
                  <div className="px-4 py-3 font-medium flex items-center justify-between" style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>
                    <span>Module {i + 1}: {mod.title}</span>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{mod.lessons?.length || 0} lessons</span>
                  </div>
                  {mod.lessons?.map((lesson) => (
                    <div key={lesson.id} className="px-4 py-2.5 flex items-center space-x-3 text-sm" style={{ borderTop: '1px solid var(--border-neon)', color: 'var(--text-secondary)' }}>
                      <Play size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{lesson.title}</span>
                      {lesson.duration_minutes > 0 && <span className="ml-auto" style={{ color: 'var(--text-muted)' }}>{lesson.duration_minutes} min</span>}
                    </div>
                  ))}
                </div>
              ))}
              {(!course.modules || course.modules.length === 0) && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Course content is being prepared.</p>
              )}
            </section>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="neon-card" style={{ position: 'sticky', top: '5rem' }}>
            <div className="text-3xl font-bold mb-6" style={{ color: 'var(--neon)' }}>
              {course.is_free ? 'Free' : `UGX ${parseFloat(course.price || 0).toLocaleString()}`}
            </div>

            {isEnrolled ? (
              <button onClick={() => navigate(`/student/courses/${course.id}/learn`)} className="neon-btn w-full flex items-center justify-center space-x-2 mb-4">
                <ExternalLink size={20} /><span>Continue Learning</span>
              </button>
            ) : (
              <button onClick={handleEnroll} disabled={enrolling} className="neon-btn w-full flex items-center justify-center space-x-2 mb-4">
                {enrolling ? (
                  <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /><span>Enrolling...</span></>
                ) : course.is_free || course.price === 0 ? (
                  <><CheckCircle size={20} /><span>Enroll Free</span></>
                ) : (
                  <><CreditCard size={20} /><span>Enroll & Pay</span></>
                )}
              </button>
            )}

            <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center justify-between"><span>Duration</span><span className="font-medium">{course.duration_hours ? `${course.duration_hours}h` : 'Self-paced'}</span></div>
              <div className="flex items-center justify-between"><span>Lessons</span><span className="font-medium">{course.total_lessons}</span></div>
              <div className="flex items-center justify-between"><span>Level</span><span className="font-medium capitalize">{course.level}</span></div>
              <div className="flex items-center justify-between"><span>Language</span><span className="font-medium">{course.language}</span></div>
              <div className="flex items-center justify-between"><span>Certificate</span><span className="font-medium">{course.has_certificate ? 'Yes' : 'No'}</span></div>
            </div>

            <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-neon)' }}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,255,65,0.1)' }}>
                  <span className="font-medium" style={{ color: 'var(--neon)' }}>{course.teacher_name?.[0]}</span>
                </div>
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{course.teacher_name}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Instructor</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
