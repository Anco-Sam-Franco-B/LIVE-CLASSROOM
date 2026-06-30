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

  if (loading) return <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" /></div>;
  if (!course) return <div className="text-center py-12 text-gray-500">Course not found</div>;

  return (
    <div className="flex gap-6">
      <div className={`w-80 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="card sticky top-20">
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900 truncate">{course.title}</h2>
            <div className="mt-3 flex items-center space-x-2 text-sm text-gray-500">
              <BarChart3 size={16} /><span>{completedCount}/{totalLessons} lessons</span>
              <span className="text-indigo-600 font-medium"><Percent size={14} className="inline" />{progressPercent}%</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          {course.modules?.map((mod) => {
            const mc = moduleCompletedCount(mod);
            const mt = mod.lessons?.length || 0;
            const mp = mt > 0 ? Math.round((mc / mt) * 100) : 0;
            return (
              <div key={mod.id} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-medium text-gray-600 truncate">{mod.title}</h3>
                  <span className="text-xs text-gray-400 ml-2">{mc}/{mt}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${mp}%` }} />
                </div>
                <div className="space-y-0.5">
                  {mod.lessons?.map((lesson) => {
                    const completed = isCompleted(lesson.id);
                    const active = selectedLesson?.id === lesson.id;
                    return (
                      <button key={lesson.id} onClick={() => setSelectedLesson(lesson)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition ${active ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm' : completed ? 'text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                        {completed ? <CheckCircle size={16} className="text-emerald-500 shrink-0" /> :
                          active ? <PlayCircle size={16} className="text-indigo-500 shrink-0" /> :
                            <Circle size={16} className="text-gray-300 shrink-0" />}
                        <span className="truncate">{lesson.title}</span>
                        {lesson.duration_minutes > 0 && (
                          <span className="text-xs text-gray-400 shrink-0 ml-auto"><Clock size={12} className="inline" />{lesson.duration_minutes}m</span>
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
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mb-4 p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Toggle sidebar">
          <Menu size={20} />
        </button>

        {showCertBanner && certificate && (
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-5 mb-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Award size={32} />
                <div>
                  <h3 className="font-semibold text-lg">Course Completed!</h3>
                  <p className="text-emerald-100 text-sm">Your certificate #{certificate.certificate_number} is ready</p>
                </div>
              </div>
              <Link to={`/certificates/verify/${certificate.certificate_number}`} target="_blank"
                className="flex items-center space-x-1.5 bg-white text-emerald-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-emerald-50 transition-colors">
                <ExternalLink size={16} /><span>View Certificate</span>
              </Link>
            </div>
          </div>
        )}

        {selectedLesson ? (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{selectedLesson.title}</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{currentIdx + 1} / {totalLessons}</span>
            </div>

            {selectedLesson.video_url && (
              <div className="aspect-video bg-gray-900 rounded-lg mb-4 overflow-hidden">
                <video ref={videoRef} controls className="w-full h-full" src={selectedLesson.video_url} onEnded={handleVideoEnd}>
                  <p className="text-white">Your browser does not support video playback.</p>
                </video>
              </div>
            )}
            {selectedLesson.article_content && (
              <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: selectedLesson.article_content }} />
            )}
            {selectedLesson.description && !selectedLesson.article_content && (
              <p className="text-gray-600 mb-4">{selectedLesson.description}</p>
            )}
            {selectedLesson.pdf_url && (
              <a href={selectedLesson.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-indigo-600 mb-6 hover:text-indigo-800">
                <FileText size={20} /><span>Download PDF Material</span>
              </a>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-6">
              <div className="flex space-x-2">
                {prevLesson && (
                  <button onClick={() => setSelectedLesson(prevLesson)}
                    className="btn-secondary text-sm flex items-center space-x-1">
                    <ChevronLeft size={16} /><span>Previous</span>
                  </button>
                )}
              </div>

              <button onClick={() => markComplete(selectedLesson.id)}
                className={`px-6 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition-all ${isCompleted(selectedLesson.id) ? 'bg-emerald-100 text-emerald-800 cursor-default' : 'btn-primary'}`}>
                {isCompleted(selectedLesson.id) ? <><CheckCircle size={18} /><span>Completed</span></> : <><CheckCircle size={18} /><span>Mark as Complete</span></>}
              </button>

              <div className="flex space-x-2">
                {nextLesson && (
                  <button onClick={() => setSelectedLesson(nextLesson)}
                    className="btn-primary text-sm flex items-center space-x-1">
                    <span>Next</span><ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <BookOpen size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Select a lesson to start learning</p>
          </div>
        )}
      </div>
    </div>
  );
}
