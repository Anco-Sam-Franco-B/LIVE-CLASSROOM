import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesAPI, certificatesAPI } from '../../services/api';
import { CheckCircle, PlayCircle, FileText, Menu, ChevronLeft, ChevronRight, Clock, BookOpen, BarChart3, Circle, Percent, Award, ExternalLink } from 'lucide-react';

export default function CourseLearning() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({ enrollment: {}, lessons: [] });
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [showCertBanner, setShowCertBanner] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          coursesAPI.getById(courseId),
          coursesAPI.getCourseProgress(courseId),
        ]);
        setCourse(courseRes.data.data);
        setProgress(progressRes.data.data || { enrollment: {}, lessons: [] });
        const first = courseRes.data.data.modules?.[0]?.lessons?.[0];
        if (first) setSelectedLesson(first);
        checkExistingCertificate();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const checkExistingCertificate = async () => {
    try {
      const { data } = await certificatesAPI.getMy();
      const cert = (data.data || []).find(c => c.course_id === courseId);
      if (cert) { setCertificate(cert); setShowCertBanner(true); }
    } catch { /* no cert yet */ }
  };

  const flatLessons = course?.modules?.flatMap(m => m.lessons || []) || [];
  const lessonProgressMap = {};
  (progress.lessons || []).forEach(lp => { lessonProgressMap[lp.lesson_id] = lp; });

  const isCompleted = (lessonId) => !!lessonProgressMap[lessonId]?.is_completed;
  const totalLessons = flatLessons.length;
  const completedCount = flatLessons.filter(l => isCompleted(l.id)).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const currentIdx = flatLessons.findIndex(l => l.id === selectedLesson?.id);
  const prevLesson = currentIdx > 0 ? flatLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < flatLessons.length - 1 ? flatLessons[currentIdx + 1] : null;

  const markComplete = async (lessonId) => {
    try {
      const duration = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0;
      await coursesAPI.updateProgress({ lessonId, isCompleted: true, watchedDuration: duration });
      const existing = lessonProgressMap[lessonId];
      const newLessons = existing
        ? (progress.lessons || [])
        : [...(progress.lessons || []), { lesson_id: lessonId, is_completed: true, watched_duration: duration }];
      setProgress(prev => ({ ...prev, lessons: newLessons }));
      const newCompleted = flatLessons.filter(l => isCompleted(l.id) || l.id === lessonId).length;
      if (newCompleted >= totalLessons && !existing) {
        setTimeout(async () => {
          await checkExistingCertificate();
        }, 500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVideoEnd = () => {
    if (selectedLesson && !isCompleted(selectedLesson.id)) {
      markComplete(selectedLesson.id);
    }
  };

  const moduleCompletedCount = (mod) =>
    (mod.lessons || []).filter(l => isCompleted(l.id)).length;

  if (loading) return <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto" style={{ borderColor: 'var(--neon)', borderTopColor: 'transparent' }} /></div>;
  if (!course) return <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>Course not found</div>;

  return (
    <div className="flex gap-6">
      <div className={`w-80 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="neon-card" style={{ position: 'sticky', top: '5rem' }}>
          <div className="mb-4">
            <h2 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{course.title}</h2>
            <div className="mt-3 flex items-center space-x-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <BarChart3 size={16} /><span>{completedCount}/{totalLessons} lessons</span>
              <span className="font-medium" style={{ color: 'var(--neon)' }}><Percent size={14} className="inline" />{progressPercent}%</span>
            </div>
            <div className="mt-2 w-full rounded-full h-2" style={{ background: 'var(--bg-card)' }}>
              <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%`, background: 'var(--neon)' }} />
            </div>
          </div>
          {course.modules?.map((mod) => {
            const mc = moduleCompletedCount(mod);
            const mt = mod.lessons?.length || 0;
            const mp = mt > 0 ? Math.round((mc / mt) * 100) : 0;
            return (
              <div key={mod.id} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{mod.title}</h3>
                  <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{mc}/{mt}</span>
                </div>
                <div className="w-full rounded-full h-1.5 mb-2" style={{ background: 'var(--bg-card)' }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${mp}%`, background: 'var(--neon)' }} />
                </div>
                <div className="space-y-0.5">
                  {mod.lessons?.map((lesson) => {
                    const completed = isCompleted(lesson.id);
                    const active = selectedLesson?.id === lesson.id;
                    return (
                      <button key={lesson.id} onClick={() => setSelectedLesson(lesson)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition`}
                        style={active ? { background: 'rgba(0,255,65,0.1)', color: 'var(--neon)', fontWeight: 500, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : completed ? { color: 'var(--neon)' } : { color: 'var(--text-secondary)' }}
                        onMouseEnter={e => { if (!active && !completed) e.currentTarget.style.background = 'rgba(0,255,65,0.05)'; }} onMouseLeave={e => { if (!active && !completed) e.currentTarget.style.background = ''; }}>
                        {completed ? <CheckCircle size={16} className="shrink-0" style={{ color: 'var(--neon)' }} /> :
                          active ? <PlayCircle size={16} className="shrink-0" style={{ color: 'var(--neon)' }} /> :
                            <Circle size={16} className="shrink-0" style={{ color: 'var(--text-muted)' }} />}
                        <span className="truncate">{lesson.title}</span>
                        {lesson.duration_minutes > 0 && (
                          <span className="text-xs shrink-0 ml-auto" style={{ color: 'var(--text-muted)' }}><Clock size={12} className="inline" />{lesson.duration_minutes}m</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mb-4 p-2 rounded-lg transition-colors" title="Toggle sidebar" onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
          <Menu size={20} />
        </button>

        {showCertBanner && certificate && (
          <div className="rounded-xl p-5 mb-4 shadow-lg" style={{ background: 'linear-gradient(to right, var(--neon), #00cc52)', color: 'white' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Award size={32} />
                <div>
                  <h3 className="font-semibold text-lg">Course Completed!</h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>Your certificate #{certificate.certificate_number} is ready</p>
                </div>
              </div>
              <Link to={`/certificates/verify/${certificate.certificate_number}`} target="_blank"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-colors" style={{ background: 'var(--bg-card)', color: 'var(--neon)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,65,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}>
                <ExternalLink size={16} /><span>View Certificate</span>
              </Link>
            </div>
          </div>
        )}

        {selectedLesson ? (
          <div className="neon-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedLesson.title}</h2>
              <span className="text-xs px-2 py-1 rounded" style={{ color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>{currentIdx + 1} / {totalLessons}</span>
            </div>

            {selectedLesson.video_url && (
              <div className="aspect-video rounded-lg mb-4 overflow-hidden" style={{ background: '#1a1a2e' }}>
                  <video ref={videoRef} controls className="w-full h-full" src={selectedLesson.video_url} onEnded={handleVideoEnd}></video>
              </div>
            )}
            {selectedLesson.article_content && (
              <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: selectedLesson.article_content }} />
            )}
            {selectedLesson.description && !selectedLesson.article_content && (
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{selectedLesson.description}</p>
            )}
            {selectedLesson.pdf_url && (
              <a href={selectedLesson.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 mb-6" style={{ color: 'var(--neon)' }} onMouseEnter={e => e.currentTarget.style.color = '#00cc52'} onMouseLeave={e => e.currentTarget.style.color = 'var(--neon)'}>
                <FileText size={20} /><span>Download PDF Material</span>
              </a>
            )}

            <div className="flex items-center justify-between pt-4 mt-6" style={{ borderTop: '1px solid var(--border-neon)' }}>
              <div className="flex space-x-2">
                {prevLesson && (
                  <button onClick={() => setSelectedLesson(prevLesson)}
                    className="neon-btn-ghost text-sm flex items-center space-x-1">
                    <ChevronLeft size={16} /><span>Previous</span>
                  </button>
                )}
              </div>

              <button onClick={() => markComplete(selectedLesson.id)}
                className={`px-6 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition-all cursor-default ${isCompleted(selectedLesson.id) ? '' : 'neon-btn'}`}
                style={isCompleted(selectedLesson.id) ? { background: 'rgba(0,255,65,0.1)', color: 'var(--neon)', cursor: 'default' } : {}}>
                {isCompleted(selectedLesson.id) ? <><CheckCircle size={18} /><span>Completed</span></> : <><CheckCircle size={18} /><span>Mark as Complete</span></>}
              </button>

              <div className="flex space-x-2">
                {nextLesson && (
                  <button onClick={() => setSelectedLesson(nextLesson)}
                    className="neon-btn text-sm flex items-center space-x-1">
                    <span>Next</span><ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="neon-card text-center py-12">
            <BookOpen size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Select a lesson to start learning</p>
          </div>
        )}
      </div>
    </div>
  );
}
