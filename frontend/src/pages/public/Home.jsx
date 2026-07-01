import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Video, Award, Users, TrendingUp, Globe, ArrowRight, Star, Sparkles, ChevronRight, Zap, Play } from 'lucide-react';
import { cmsAPI } from '../../services/api';

const features = [
  { icon: Video, title: 'Live Interactive Classes', desc: 'Real-time virtual classrooms with HD video and screen sharing' },
  { icon: BookOpen, title: 'Structured Courses', desc: 'Well-organized curriculum with modules and lessons' },
  { icon: Award, title: 'Certificates', desc: 'Earn verifiable certificates upon course completion' },
  { icon: Users, title: 'Expert Teachers', desc: 'Learn from qualified and experienced instructors' },
  { icon: TrendingUp, title: 'Progress Tracking', desc: 'Monitor your learning journey with detailed analytics' },
  { icon: Globe, title: 'Learn Anywhere', desc: 'Access courses on any device, anytime' },
];

const testimonials = [
  { name: 'Sarah Johnson', role: 'Student', text: 'Live Class Code transformed the way I learn. The interactive classes and quizzes keep me engaged.', avatar: 'SJ', rating: 5 },
  { name: 'James Mwangi', role: 'Teacher', text: 'The platform makes it easy to create courses and manage students. Highly recommended!', avatar: 'JM', rating: 5 },
  { name: 'Grace Nakato', role: 'Student', text: 'Live Class Code has transformed how I learn. The live classes and quizzes are fantastic.', avatar: 'GN', rating: 5 },
];

const stats = [
  { label: 'Active Students', value: '10,000+' },
  { label: 'Courses', value: '500+' },
  { label: 'Expert Teachers', value: '200+' },
  { label: 'Certificates Issued', value: '5,000+' },
];

export default function Home() {
  const [cms, setCms] = useState({});

  useEffect(() => {
    cmsAPI.getPublic('home')
      .then(({ data }) => { if (data.data) setCms(data.data); })
      .catch(() => {});
  }, []);

  const displayStats = cms.stats?.items || stats;
  const displayFeatures = features.map((f, i) => ({ ...f, ...(cms.features?.items?.[i] || {}) }));
  const displayTestimonials = cms.testimonials?.items || testimonials;

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'radial-gradient(ellipse at 15% 45%, rgba(0,255,65,0.1) 0%, transparent 55%), radial-gradient(ellipse at 85% 30%, rgba(0,191,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(0,255,65,0.04) 0%, transparent 50%), var(--bg-dark)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(0,255,65,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.04) 1px, transparent 1px)`,
          backgroundSize: '60px 60px', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '800px', height: '800px',
          background: 'radial-gradient(circle, rgba(0,255,65,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div className="animate-float" style={{
          position: 'absolute', top: '12%', right: '20%',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,65,0.12) 0%, transparent 70%)',
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />
        <div className="animate-float" style={{
          position: 'absolute', bottom: '20%', left: '8%',
          width: '180px', height: '180px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,191,255,0.08) 0%, transparent 70%)',
          filter: 'blur(45px)', pointerEvents: 'none', animationDelay: '1.5s',
        }} />
        <div className="animate-float" style={{
          position: 'absolute', top: '30%', left: '40%',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,65,0.08) 0%, transparent 70%)',
          filter: 'blur(35px)', pointerEvents: 'none', animationDelay: '3s',
        }} />
        <div className="animate-float" style={{
          position: 'absolute', top: '60%', right: '12%',
          width: '6px', height: '6px', borderRadius: '50%',
          background: 'var(--neon)',
          boxShadow: '0 0 10px var(--neon), 0 0 20px var(--neon)',
          pointerEvents: 'none', animationDelay: '0.5s',
        }} />
        <div className="animate-float" style={{
          position: 'absolute', bottom: '30%', left: '15%',
          width: '4px', height: '4px', borderRadius: '50%',
          background: 'var(--neon)',
          boxShadow: '0 0 8px var(--neon), 0 0 16px var(--neon)',
          pointerEvents: 'none', animationDelay: '2s',
        }} />
        <div className="animate-float" style={{
          position: 'absolute', top: '15%', left: '30%',
          width: '5px', height: '5px', borderRadius: '50%',
          background: '#00ccff',
          boxShadow: '0 0 8px #00ccff, 0 0 16px #00ccff',
          pointerEvents: 'none', animationDelay: '3.5s',
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 16px', borderRadius: '9999px',
                background: 'rgba(0,255,65,0.08)',
                border: '1px solid rgba(0,255,65,0.2)',
                marginBottom: '28px', fontSize: '0.875rem', color: 'var(--neon)',
              }}>
                <Sparkles size={14} />
                <span>{cms.hero?.badge || "Uganda's Premier Learning Platform"}</span>
              </div>
              <h1 style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 800, lineHeight: 1.08,
                marginBottom: '24px',
                background: 'linear-gradient(135deg, #ffffff 0%, #00ff41 40%, #00e5ff 70%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                backgroundSize: '200% 200%',
              }}>
                {cms.hero?.title || "Learn Anytime, Anywhere with Live Class Code"}
              </h1>
              <p style={{
                fontSize: '1.125rem', lineHeight: 1.7,
                marginBottom: '36px', color: 'var(--text-secondary)',
                maxWidth: '540px',
              }}>
                {cms.hero?.subtitle || "Uganda's premier online learning platform. Access live classes, interactive quizzes, assignments, and earn certificates from expert teachers."}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '16px 36px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, var(--neon) 0%, #00cc52 100%)',
                  color: '#000', fontWeight: 700, fontSize: '1rem',
                  textDecoration: 'none', position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 0 24px rgba(0,255,65,0.35), 0 0 80px rgba(0,255,65,0.1)',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,65,0.5), 0 0 100px rgba(0,255,65,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 0 24px rgba(0,255,65,0.35), 0 0 80px rgba(0,255,65,0.1)';
                  }}
                >
                  {cms.hero?.cta_primary || "Get Started Free"}
                  <ArrowRight size={20} />
                </Link>
                <Link to="/courses" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '16px 36px', borderRadius: '14px',
                  background: 'transparent', color: 'var(--text-primary)', fontWeight: 600,
                  fontSize: '1rem', textDecoration: 'none',
                  border: '1.5px solid rgba(0,255,65,0.25)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,255,65,0.06)';
                    e.currentTarget.style.boxShadow = '0 0 24px rgba(0,255,65,0.15), inset 0 0 24px rgba(0,255,65,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(0,255,65,0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(0,255,65,0.25)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {cms.hero?.cta_secondary || "Browse Courses"}
                  <ChevronRight size={18} />
                </Link>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '20px',
                marginTop: '48px', flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {[
                    { bg: '#0044ff', letter: 'S' },
                    { bg: '#00ccff', letter: 'J' },
                    { bg: 'var(--neon)', letter: 'M' },
                    { bg: '#ccff00', letter: 'G' },
                    { bg: '#ff8800', letter: 'N' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      border: '2px solid var(--bg-dark)',
                      background: item.bg, marginLeft: i > 0 ? '-10px' : '0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, color: '#000',
                      boxShadow: '0 0 0 2px rgba(0,0,0,0.3)',
                    }}>
                      {item.letter}
                    </div>
                  ))}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Trusted by <span style={{ color: 'var(--neon)', fontWeight: 700 }}>10,000+</span> students across Uganda
                </div>
              </div>
            </div>
            <div className="hidden lg:flex" style={{ justifyContent: 'center', position: 'relative', perspective: '800px' }}>
              <div className="animate-float" style={{ position: 'relative', animationDelay: '1s' }}>
                <div style={{
                  position: 'relative', borderRadius: '24px', overflow: 'hidden',
                  boxShadow: '0 0 60px rgba(0,255,65,0.1), 0 30px 80px rgba(0,0,0,0.5)',
                  transform: 'rotateY(-3deg) rotateX(2deg)',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '24px',
                    border: '1px solid rgba(0,255,65,0.15)', zIndex: 2, pointerEvents: 'none',
                  }} />
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1,
                    padding: '12px 16px',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {['#ff5f57', '#ffbd2e', '#28c840'].map((color) => (
                        <div key={color} style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                      ))}
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                      liveclasscode.com
                    </div>
                    <Zap size={12} style={{ color: 'var(--neon)' }} />
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=450&fit=crop&q=80"
                    alt="Students learning"
                    style={{ width: '100%', maxWidth: '560px', height: 'auto', display: 'block', borderRadius: '24px' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.4))',
                    pointerEvents: 'none', zIndex: 1,
                  }} />
                </div>
              </div>
              <div className="animate-float" style={{
                position: 'absolute', bottom: '10%', left: '-8%',
                padding: '16px 22px', borderRadius: '16px',
                background: 'rgba(10,10,20,0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0,255,65,0.15)',
                display: 'flex', alignItems: 'center', gap: '14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                animationDelay: '2s',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'rgba(0,255,65,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Zap size={22} style={{ color: 'var(--neon)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.3px' }}>LIVE CLASSES TODAY</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--neon)', lineHeight: 1.2 }}>24 Active</div>
                </div>
              </div>
              <div className="animate-float" style={{
                position: 'absolute', top: '8%', right: '-6%',
                padding: '14px 18px', borderRadius: '14px',
                background: 'rgba(10,10,20,0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0,255,65,0.12)',
                display: 'flex', alignItems: 'center', gap: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                animationDelay: '0.5s',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(0,200,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Play size={16} style={{ color: '#00ccff' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.3px' }}>LESSONS COMPLETED</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#00ccff', lineHeight: 1.2 }}>15,000+</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px',
          background: 'linear-gradient(to top, var(--bg-dark-secondary) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </section>

      {/* Stats */}
      <section style={{
        background: 'var(--bg-dark-secondary)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(0,255,65,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.02) 1px, transparent 1px)`,
          backgroundSize: '60px 60px', pointerEvents: 'none',
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" style={{ position: 'relative', zIndex: 1 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {displayStats.map((stat, idx) => (
              <div key={stat.label} className={idx === 0 ? '' : `stagger-${idx + 1}`} style={{
                padding: '32px 16px', textAlign: 'center',
                backdropFilter: 'blur(8px)',
                borderRight: idx < displayStats.length - 1 ? '1px solid rgba(0,255,65,0.08)' : 'none',
                borderBottom: '1px solid rgba(0,255,65,0.04)',
              }}>
                <div style={{
                  fontSize: '2.75rem', fontWeight: 800,
                  color: 'var(--neon)',
                  textShadow: '0 0 30px rgba(0,255,65,0.2), 0 0 60px rgba(0,255,65,0.08)',
                  marginBottom: '4px', lineHeight: 1,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.875rem', color: 'var(--text-secondary)',
                  letterSpacing: '0.5px',
                }}>
                  {stat.label}
                </div>
                {idx < displayStats.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)',
                    width: '1px', height: '40%',
                    background: 'linear-gradient(to bottom, transparent, rgba(0,255,65,0.2), transparent)',
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20" style={{ background: 'var(--bg-dark)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(0,255,65,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.02) 1px, transparent 1px)`,
          backgroundSize: '60px 60px', pointerEvents: 'none',
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center mb-16">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '9999px',
              background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.15)',
              marginBottom: '16px', fontSize: '0.8rem', color: 'var(--neon)',
            }}>
              <Sparkles size={14} />
              <span>{cms.features?.badge || "Why Choose Us"}</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4" style={{
              color: 'var(--text-primary)',
              background: 'linear-gradient(135deg, #fff 0%, var(--neon) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {cms.features?.title || "Everything You Need to Succeed"}
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              {cms.features?.subtitle || "A complete learning management system designed for Ugandan students and teachers."}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayFeatures.map((f, idx) => (
              <div key={f.title} className={`neon-card stagger-${idx + 1}`} style={{
                padding: '28px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderTop: '2px solid rgba(0,255,65,0.15)',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,65,0.15), 0 12px 40px rgba(0,0,0,0.3)';
                  e.currentTarget.style.borderTopColor = 'var(--neon)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderTopColor = 'rgba(0,255,65,0.15)';
                }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '18px',
                  background: 'rgba(0,255,65,0.08)',
                  boxShadow: '0 0 20px rgba(0,255,65,0.05)',
                }}>
                  <f.icon style={{ color: 'var(--neon)' }} size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20" style={{ background: 'var(--bg-dark-secondary)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(0,255,65,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.02) 1px, transparent 1px)`,
          backgroundSize: '60px 60px', pointerEvents: 'none',
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center mb-16">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '9999px',
              background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.15)',
              marginBottom: '16px', fontSize: '0.8rem', color: 'var(--neon)',
            }}>
              <Sparkles size={14} />
              <span>{cms.testimonials?.badge || "Testimonials"}</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4" style={{
              color: 'var(--text-primary)',
              background: 'linear-gradient(135deg, #fff 0%, var(--neon) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {cms.testimonials?.title || "What People Say"}
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{cms.testimonials?.subtitle || "Hear from our community of learners and educators."}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {displayTestimonials.map((t, idx) => (
              <div key={t.name} className={`neon-card stagger-${idx + 1}`} style={{
                padding: '32px 28px', textAlign: 'center',
                position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,65,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ position: 'absolute', top: '16px', left: '20px', fontSize: '3rem', lineHeight: 1, color: 'rgba(0,255,65,0.15)', fontFamily: 'serif' }}>"</div>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  background: 'rgba(0,255,65,0.08)',
                  border: '2px solid rgba(0,255,65,0.15)',
                }}>
                  <span className="text-xl font-bold" style={{ color: 'var(--neon)' }}>{t.avatar}</span>
                </div>
                <div className="flex justify-center mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} style={{ color: '#ffc800' }} size={16} />
                  ))}
                </div>
                <p className="mb-4 text-sm italic" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>"{t.text}"</p>
                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{
        background: 'var(--bg-dark)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(0,255,65,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.02) 1px, transparent 1px)`,
          backgroundSize: '60px 60px', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(0,255,65,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div className="max-w-4xl mx-auto px-4 text-center" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '9999px',
            background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.15)',
            marginBottom: '20px', fontSize: '0.8rem', color: 'var(--neon)',
          }}>
            <Sparkles size={14} />
            <span>{cms.cta?.badge || "Get Started Today"}</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold mb-4" style={{
            background: 'linear-gradient(135deg, #fff 0%, var(--neon) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {cms.cta?.title || "Ready to Start Learning?"}
          </h2>
          <p className="text-lg mb-10" style={{ color: 'var(--text-secondary)' }}>
            {cms.cta?.subtitle || "Join thousands of students already learning on Live Class Code. Start your journey today."}
          </p>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '16px 40px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--neon) 0%, #00cc52 100%)',
            color: '#000', fontWeight: 700, fontSize: '1.05rem',
            textDecoration: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 0 30px rgba(0,255,65,0.3), 0 0 80px rgba(0,255,65,0.1)',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 0 50px rgba(0,255,65,0.5), 0 0 120px rgba(0,255,65,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,65,0.3), 0 0 80px rgba(0,255,65,0.1)';
            }}
          >
            <span>{cms.cta?.button_text || "Get Started Free"}</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
