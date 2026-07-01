import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Heart, ArrowRight } from 'lucide-react';
import { cmsAPI } from '../../services/api';

const values = [
  { icon: Users, title: 'Our Team', desc: 'Dedicated educators and technologists passionate about transforming education.' },
  { icon: Target, title: 'Our Vision', desc: 'To be Uganda\'s leading online learning platform serving students nationwide.' },
  { icon: Heart, title: 'Our Values', desc: 'Quality, accessibility, innovation, and community-driven education.' },
];

const stats = [
  { label: 'Students Enrolled', value: '10,000+' },
  { label: 'Courses Available', value: '500+' },
  { label: 'Active Teachers', value: '200+' },
  { label: 'Certificates Issued', value: '5,000+' },
];

export default function About() {
  const [cms, setCms] = useState({});
  useEffect(() => {
    cmsAPI.getPublic('about')
      .then(({ data }) => { if (data.data) setCms(data.data); })
      .catch(() => {});
  }, []);

  const displayValues = values.map((v, i) => ({ ...v, ...(cms.values?.items?.[i] || {}) }));

  return (
    <div style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-6" style={{
            background: 'linear-gradient(135deg, var(--neon), #00bfff, var(--neon))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 4s ease infinite',
          }}>
            {cms.hero?.title || "About Live Class Code"}
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {cms.hero?.subtitle || "Empowering Ugandan education through technology. Live Class Code is a modern virtual classroom platform that connects students and teachers."}
          </p>
          <div className="w-20 h-1 mx-auto mt-6 rounded-full" style={{ background: 'var(--neon)', boxShadow: 'var(--neon-glow)' }} />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <div className="neon-card p-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{cms.mission?.title || "Our Mission"}</h2>
              <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {cms.mission?.body || "To make quality education accessible to every Ugandan student through technology. We provide tools for live classes, course management, assignments, quizzes, and progress tracking."}
              </p>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Our platform supports MTN MoMo and Airtel Money payments, making it easy for students to pay for courses.
              </p>
            </div>
          </div>
          <div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: '2px solid var(--border-neon)',
                boxShadow: '0 0 30px rgba(0,255,65,0.15)',
              }}
            >
              <img
                src={cms.mission?.image_url || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop"}
                alt="Our mission"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((s) => (
            <div
              key={s.label}
              className="neon-card text-center py-8"
              style={{
                borderBottom: '3px solid var(--border-neon)',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--neon)' }}>{s.value}</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center mb-16">
          {displayValues.map((v) => (
            <div key={v.title} className="neon-card">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: 'rgba(0,255,65,0.08)',
                  boxShadow: '0 0 20px rgba(0,255,65,0.15)',
                  border: '1px solid rgba(0,255,65,0.2)',
                }}
              >
                <v.icon style={{ color: 'var(--neon)' }} size={28} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{v.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, var(--neon), #00cc55)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(0,255,65,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,65,0.5)';
              e.currentTarget.style.transform = 'scale(1.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,65,0.3)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span>Join Our Community</span>
            <ArrowRight size={20} />
          </Link>
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
