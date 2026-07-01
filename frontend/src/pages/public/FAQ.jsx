import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cmsAPI } from '../../services/api';

const faqs = [
  { q: 'What is Live Class Code?', a: 'Live Class Code is a comprehensive online learning management system designed for Ugandan students and teachers. It supports live classes, course management, assignments, quizzes, and mobile money payments.' },
  { q: 'How do I enroll in a course?', a: 'Create an account, browse the course catalog, and click "Enroll Now" on any course. You can pay via MTN MoMo or Airtel Money.' },
  { q: 'What payment methods are accepted?', a: 'We accept MTN Mobile Money and Airtel Money. Bank transfers and card payments coming soon.' },
  { q: 'Can teachers create their own courses?', a: 'Yes! Teachers can create structured courses with modules, lessons, videos, PDFs, assignments, and quizzes.' },
  { q: 'How do live classes work?', a: 'Teachers schedule live classes with HD video, screen sharing, and chat. Students receive reminders and join via a secure link.' },
  { q: 'How are certificates issued?', a: 'Certificates are automatically generated when a student completes all course requirements. Each certificate has a unique verification number.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use JWT authentication, bcrypt password hashing, Helmet security headers, and SQL injection protection.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [cms, setCms] = useState({});
  useEffect(() => {
    cmsAPI.getPublic('faq')
      .then(({ data }) => { if (data.data) setCms(data.data); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-extrabold mb-4" style={{
            background: 'linear-gradient(135deg, var(--neon), #00bfff, var(--neon))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 4s ease infinite',
          }}>
            {cms.hero?.title || "Frequently Asked Questions"}
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{cms.hero?.subtitle || "Find answers to common questions about Live Class Code."}</p>
          <div className="w-20 h-1 mx-auto mt-6 rounded-full" style={{ background: 'var(--neon)', boxShadow: 'var(--neon-glow)' }} />
        </div>
        <div className="space-y-4">
          {(cms.faqs?.items || faqs).map((faq, i) => (
            <div
              key={i}
              className="neon-card cursor-pointer"
              style={{
                borderLeft: openIndex === i ? '3px solid var(--neon)' : '3px solid transparent',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (openIndex !== i) {
                  e.currentTarget.style.borderLeftColor = 'var(--border-neon)';
                }
              }}
              onMouseLeave={(e) => {
                if (openIndex !== i) {
                  e.currentTarget.style.borderLeftColor = 'transparent';
                }
              }}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300"
                    style={{
                      background: openIndex === i ? 'var(--neon)' : 'var(--text-muted)',
                      boxShadow: openIndex === i ? '0 0 8px rgba(0,255,65,0.6)' : 'none',
                    }}
                  />
                  <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{faq.q}</h3>
                </div>
                <ChevronDown
                  size={20}
                  style={{
                    color: openIndex === i ? 'var(--neon)' : 'var(--text-muted)',
                    transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease, color 0.3s ease',
                  }}
                />
              </div>
              <div
                style={{
                  maxHeight: openIndex === i ? '300px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.35s ease, opacity 0.3s ease, margin 0.3s ease',
                  opacity: openIndex === i ? 1 : 0,
                  marginTop: openIndex === i ? '12px' : '0',
                }}
              >
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{faq.a}</p>
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
