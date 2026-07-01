import { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';
import { cmsAPI } from '../../services/api';

export default function TermsConditions() {
  const [cms, setCms] = useState({});

  useEffect(() => {
    cmsAPI.getPublic('terms-conditions')
      .then(({ data }) => { if (data.data) setCms(data.data); })
      .catch(() => {});
  }, []);

  return (
    <div className="relative" style={{ background: 'var(--bg-dark)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,255,65,0.04) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,255,65,0.03) 0%, transparent 70%)' }} />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4" style={{ background: 'rgba(0,255,65,0.1)', color: 'var(--neon)' }}>
            <Scale size={15} />
            Legal
          </div>
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {cms.hero?.title || (<>Terms &{' '}<span style={{ background: 'linear-gradient(135deg, var(--neon), #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Conditions</span></>)}
          </h1>
          <span className="inline-block mt-3 px-3 py-1 text-xs rounded-full" style={{ background: 'rgba(0,255,65,0.08)', color: 'var(--neon)', border: '1px solid var(--border-neon)' }}>
            {cms.hero?.updated || "Last updated: January 2024"}
          </span>
        </div>

        <div className="space-y-5">
          {(cms.content?.sections || [
            { heading: 'Acceptance of Terms', body: 'By accessing and using Live Class Code, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform.' },
            { heading: 'User Accounts', body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use.' },
            { heading: 'Course Enrollment', body: 'Enrollment in a course grants you access to the course materials for the duration specified. Sharing account access is prohibited.' },
            { heading: 'Payments and Refunds', body: 'All payments are processed securely through MTN MoMo or Airtel Money. Refund requests are handled on a case-by-case basis.' },
            { heading: 'Contact', body: 'For questions about these terms, contact legal@liveclasscode.com.' },
          ]).map((section, i) => (
            <section key={i} className="rounded-xl p-6 md:p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-neon)', borderLeft: '3px solid var(--neon)' }}>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{section.heading}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
