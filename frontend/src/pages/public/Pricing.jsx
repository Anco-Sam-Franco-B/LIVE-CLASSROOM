import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { cmsAPI } from '../../services/api';

const plans = [
  {
    name: 'Free',
    price: '0',
    period: 'forever',
    features: ['Access to free courses', 'Basic quizzes', 'Course progress tracking', 'Community forum access'],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Student',
    price: '50,000',
    period: '/month',
    features: ['All free features', 'Unlimited course access', 'Live class participation', 'Assignments & quizzes', 'Certificate on completion', 'Priority support'],
    cta: 'Start Learning',
    featured: true,
  },
  {
    name: 'Teacher',
    price: '100,000',
    period: '/month',
    features: ['Create unlimited courses', 'Student management', 'Live class hosting', 'Advanced analytics', 'Payment integration', 'Dedicated support'],
    cta: 'Start Teaching',
    featured: false,
  },
];

export default function Pricing() {
  const [cms, setCms] = useState({});
  useEffect(() => {
    cmsAPI.getPublic('pricing')
      .then(({ data }) => { if (data.data) setCms(data.data); })
      .catch(() => {});
  }, []);

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
            {cms.hero?.title || "Simple, Transparent Pricing"}
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{cms.hero?.subtitle || "Choose the plan that fits your needs"}</p>
          <div className="w-20 h-1 mx-auto mt-6 rounded-full" style={{ background: 'var(--neon)', boxShadow: 'var(--neon-glow)' }} />
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {(cms.pricing?.plans || plans).map((plan) => (
            <div
              key={plan.name}
              className={`neon-card relative`}
              style={{
                border: plan.featured ? '2px solid var(--neon)' : '1px solid rgba(0,255,65,0.1)',
                animation: plan.featured ? 'pulseBorder 2s ease-in-out infinite' : 'none',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,255,65,0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {plan.featured && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full text-sm font-semibold tracking-wide"
                  style={{
                    background: 'linear-gradient(135deg, var(--neon), #00cc55)',
                    color: '#fff',
                    boxShadow: '0 0 20px rgba(0,255,65,0.4)',
                  }}
                >
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>UGX {plan.price}</span>
                <span className="ml-1 text-sm" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start space-x-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle style={{ color: 'var(--neon)', filter: 'drop-shadow(0 0 4px rgba(0,255,65,0.4))' }} className="flex-shrink-0 mt-0.5" size={18} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`w-full text-center py-3 rounded-lg font-semibold block transition-all duration-300`}
                style={
                  plan.featured
                    ? {
                        background: 'linear-gradient(135deg, var(--neon), #00cc55)',
                        color: '#fff',
                        boxShadow: '0 0 20px rgba(0,255,65,0.3)',
                      }
                    : {
                        border: '2px solid var(--border-neon)',
                        color: 'var(--neon)',
                        background: 'transparent',
                      }
                }
                onMouseEnter={(e) => {
                  if (plan.featured) {
                    e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,65,0.5)';
                  } else {
                    e.currentTarget.style.background = 'rgba(0,255,65,0.1)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,65,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (plan.featured) {
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,65,0.3)';
                  } else {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulseBorder {
          0%, 100% { box-shadow: 0 0 12px rgba(0,255,65,0.2); }
          50% { box-shadow: 0 0 28px rgba(0,255,65,0.4); }
        }
      `}</style>
    </div>
  );
}
