import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { cmsAPI } from '../../services/api';

export default function NotFound() {
  const [cms, setCms] = useState({});

  useEffect(() => {
    cmsAPI.getPublic('not-found')
      .then(({ data }) => { if (data.data) setCms(data.data); })
      .catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden" style={{ background: 'var(--bg-dark)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-24 h-24 border rounded-lg opacity-20 animate-pulse" style={{ borderColor: 'var(--neon)', animationDuration: '4s' }} />
        <div className="absolute top-40 right-20 w-16 h-16 rounded-full opacity-10" style={{ background: 'var(--neon)' }} />
        <div className="absolute bottom-32 left-1/4 w-20 h-20 border rounded-full opacity-15" style={{ borderColor: 'var(--neon)' }} />
        <div className="absolute bottom-20 right-1/3 w-12 h-12 rotate-45 border opacity-10" style={{ borderColor: 'var(--neon)' }} />
        <div className="absolute top-1/3 left-1/3 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,255,65,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,255,65,0.04) 0%, transparent 70%)' }} />
      </div>

      <div className="relative rounded-2xl backdrop-blur-xl p-10 md:p-14 text-center max-w-md w-full neon-card">
        <div
          className="text-9xl font-bold leading-none mb-2"
          style={{
            background: 'linear-gradient(135deg, var(--neon), #00d4ff, var(--neon))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 60px rgba(0,255,65,0.2)',
          }}
        >
          404
        </div>

        <div
          className="w-16 h-1 mx-auto mb-6 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, var(--neon), transparent)' }}
        />

        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{cms.hero?.title || "Page Not Found"}</h1>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
          {cms.hero?.subtitle || "The page you're looking for doesn't exist or has been moved."}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
            style={{ background: 'var(--neon)', color: '#fff' }}
          >
            <Home size={18} />
            <span>{cms.hero?.cta_primary || "Go Home"}</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-300"
            style={{
              border: '1px solid var(--border-neon)',
              color: 'var(--text-primary)',
              background: 'transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,65,0.05)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,65,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <ArrowLeft size={18} />
            <span>{cms.hero?.cta_secondary || "Go Back"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
