import { useState, useEffect } from 'react';
import { BookOpen, Video, Award, Users, BarChart3, CreditCard, MessageSquare, Bell, FileText, Shield, Globe, Zap } from 'lucide-react';
import { cmsAPI } from '../../services/api';

const featuresList = [
  { icon: Video, title: 'Live Virtual Classrooms', desc: 'Real-time interactive classes with HD video, screen sharing, chat, and file sharing.' },
  { icon: BookOpen, title: 'Course Management', desc: 'Create structured courses with modules, lessons, videos, PDFs, and articles.' },
  { icon: Award, title: 'Certificates', desc: 'Auto-generate verifiable certificates upon course completion with unique IDs.' },
  { icon: Users, title: 'Multi-Role Support', desc: 'Dedicated portals for super admins, admins, teachers, and students.' },
  { icon: FileText, title: 'Assignments & Quizzes', desc: 'Create assignments and quizzes with auto-grading, multiple attempts, and feedback.' },
  { icon: BarChart3, title: 'Analytics & Reports', desc: 'Comprehensive reports on student progress, revenue, attendance, and course performance.' },
  { icon: CreditCard, title: 'Mobile Money Payments', desc: 'Integrated MTN MoMo and Airtel Money for seamless course payments.' },
  { icon: MessageSquare, title: 'Real-Time Chat', desc: 'Built-in messaging system for students, teachers, and parents.' },
  { icon: Bell, title: 'Notifications', desc: 'In-app and email notifications for assignments, meetings, payments, and updates.' },
  { icon: Shield, title: 'Secure Authentication', desc: 'JWT tokens, 2FA, account locking, and session management for maximum security.' },
  { icon: Globe, title: 'Accessible Anywhere', desc: 'Responsive design works on desktop, tablet, and mobile devices.' },
  { icon: Zap, title: 'Progress Tracking', desc: 'Track lesson completion, quiz scores, assignment grades, and overall course progress.' },
];

export default function Features() {
  const [cms, setCms] = useState({});
  useEffect(() => {
    cmsAPI.getPublic('features')
      .then(({ data }) => { if (data.data) setCms(data.data); })
      .catch(() => {});
  }, []);

  const displayFeatures = featuresList.map((f, i) => ({ ...f, ...(cms.features?.items?.[i] || {}) }));

  return (
    <div style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-4" style={{
            background: 'linear-gradient(135deg, var(--neon), #00bfff, var(--neon))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 4s ease infinite',
          }}>
            {cms.hero?.title || "Platform Features"}
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {cms.hero?.subtitle || "Everything you need to run a successful online learning program."}
          </p>
          <div className="w-20 h-1 mx-auto mt-6 rounded-full" style={{ background: 'var(--neon)', boxShadow: 'var(--neon-glow)' }} />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayFeatures.map((f) => (
            <div
              key={f.title}
              className="neon-card overflow-hidden"
              style={{
                borderTop: '3px solid var(--border-neon)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,255,65,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: 'rgba(0,255,65,0.08)',
                  boxShadow: '0 0 20px rgba(0,255,65,0.15)',
                  border: '1px solid rgba(0,255,65,0.2)',
                }}
              >
                <f.icon style={{ color: 'var(--neon)' }} size={26} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
