import { useState, useEffect } from 'react';
import { usersAPI, cmsAPI } from '../../services/api';
import { Star, BookOpen, GraduationCap, Mail } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-neon)' }}>
      <div className="animate-pulse">
        <div className="w-24 h-24 rounded-full mx-auto mb-4" style={{ background: 'rgba(0,255,65,0.1)' }} />
        <div className="h-5 rounded w-32 mx-auto mb-2" style={{ background: 'rgba(0,255,65,0.1)' }} />
        <div className="h-3 rounded w-24 mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-3 rounded w-full mb-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-3 rounded w-3/4 mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="flex justify-center gap-6">
          <div className="h-3 rounded w-16" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="h-3 rounded w-12" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
      </div>
    </div>
  );
}

export default function TeacherProfiles() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cms, setCms] = useState({});

  useEffect(() => {
    cmsAPI.getPublic('teachers')
      .then(({ data }) => { if (data.data) setCms(data.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    usersAPI.getTeachers()
      .then(({ data }) => setTeachers(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="h-10 rounded w-64 mx-auto mb-3 animate-pulse" style={{ background: 'rgba(0,255,65,0.1)' }} />
          <div className="h-4 rounded w-96 mx-auto animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => <SkeletonCard key={n} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,255,65,0.08) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,255,65,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-5" style={{ background: 'rgba(0,255,65,0.1)', color: 'var(--neon)' }}>
            <GraduationCap size={16} />
            Expert Educators
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {cms.hero?.title || (<>Meet Our{' '}<span style={{ background: 'linear-gradient(135deg, var(--neon), #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Teachers</span></>)}
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {cms.hero?.subtitle || "Learn from experienced and qualified educators dedicated to your success"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map(teacher => (
            <div
              key={teacher.id}
              className="group rounded-2xl p-6 text-center relative transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-neon)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: '0 0 40px rgba(0,255,65,0.08)' }}
              />

              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 relative"
                  style={{ background: 'rgba(0,255,65,0.08)' }}
                >
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
                    style={{ boxShadow: '0 0 30px rgba(0,255,65,0.3), inset 0 0 20px rgba(0,255,65,0.1)', border: '2px solid var(--neon)' }}
                  />
                  <span className="text-2xl font-bold relative z-10" style={{ color: 'var(--neon)' }}>
                    {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                  </span>
                </div>

                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {teacher.first_name} {teacher.last_name}
                </h3>

                <div className="flex items-center justify-center gap-1.5 text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                  <Mail size={13} />
                  <span>{teacher.email}</span>
                </div>

                <p className="text-sm mb-5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {teacher.bio || 'Experienced educator passionate about teaching.'}
                </p>

                <div
                  className="flex items-center justify-center gap-6 pt-4 text-sm"
                  style={{ borderTop: '1px solid var(--border-neon)' }}
                >
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                    <BookOpen size={15} style={{ color: 'var(--neon)' }} />
                    <span>{teacher.course_count} courses</span>
                  </span>
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                    <Star size={15} style={{ color: '#ffc800' }} />
                    <span>{parseFloat(teacher.avg_rating).toFixed(1)}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
