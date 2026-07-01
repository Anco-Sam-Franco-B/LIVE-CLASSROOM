import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { cmsAPI } from '../../services/api';

const posts = [
  { title: 'The Future of Online Learning in Uganda', excerpt: 'How digital education is transforming the Ugandan education landscape and creating new opportunities.', author: 'Admin', date: '2024-01-15', image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=250&fit=crop', tag: 'Education' },
  { title: 'Tips for Effective Online Teaching', excerpt: 'Best practices for teachers transitioning to virtual classrooms and engaging students remotely.', author: 'Teacher John', date: '2024-01-10', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=250&fit=crop', tag: 'Teaching' },
  { title: 'Why Mobile Money is Perfect for Education', excerpt: 'How MTN MoMo and Airtel Money are making education payments accessible to all Ugandans.', author: 'Admin', date: '2024-01-05', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=250&fit=crop', tag: 'Payments' },
];

export default function Blog() {
  const [cms, setCms] = useState({});
  useEffect(() => {
    cmsAPI.getPublic('blog')
      .then(({ data }) => { if (data.data) setCms(data.data); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-extrabold mb-4" style={{
            background: 'linear-gradient(135deg, var(--neon), #00bfff, var(--neon))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 4s ease infinite',
          }}>
            {cms.hero?.title || "Our Blog"}
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{cms.hero?.subtitle || "Insights and updates from the Live Class Code team."}</p>
          <div className="w-20 h-1 mx-auto mt-6 rounded-full" style={{ background: 'var(--neon)', boxShadow: 'var(--neon-glow)' }} />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {(cms.posts?.items || posts).map((post) => (
            <div
              key={post.title}
              className="neon-card overflow-hidden p-0"
              style={{
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,255,65,0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="relative overflow-hidden">
                <div
                  className="absolute inset-0 z-10"
                  style={{
                    background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6) 100%)',
                  }}
                />
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-52 object-cover transition-transform duration-500"
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
                <div className="absolute top-3 left-3 z-20">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: 'rgba(0,255,65,0.15)',
                      color: 'var(--neon)',
                      border: '1px solid rgba(0,255,65,0.3)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {post.tag}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <span
                    className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-muted)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <User size={12} />
                    <span>{post.author}</span>
                  </span>
                  <span
                    className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-muted)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <Calendar size={12} />
                    <span>{post.date}</span>
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{post.title}</h3>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{post.excerpt}</p>
                <Link
                  to="#"
                  className="inline-flex items-center space-x-1.5 text-sm font-medium group transition-all duration-300"
                  style={{ color: 'var(--neon)' }}
                  onMouseEnter={(e) => {
                    const arrow = e.currentTarget.querySelector('.arrow-icon');
                    if (arrow) arrow.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    const arrow = e.currentTarget.querySelector('.arrow-icon');
                    if (arrow) arrow.style.transform = 'translateX(0)';
                  }}
                >
                  <span>Read More</span>
                  <ArrowRight size={16} className="arrow-icon" style={{ transition: 'transform 0.2s ease' }} />
                </Link>
              </div>
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
