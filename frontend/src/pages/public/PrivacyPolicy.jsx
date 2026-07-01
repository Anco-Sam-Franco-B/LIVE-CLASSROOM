import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { cmsAPI } from '../../services/api';

export default function PrivacyPolicy() {
  const [cms, setCms] = useState({});

  useEffect(() => {
    cmsAPI.getPublic('privacy-policy')
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
            <Shield size={15} />
            Legal
          </div>
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {cms.hero?.title || (<>Privacy{' '}<span style={{ background: 'linear-gradient(135deg, var(--neon), #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Policy</span></>)}
          </h1>
          <span className="inline-block mt-3 px-3 py-1 text-xs rounded-full" style={{ background: 'rgba(0,255,65,0.08)', color: 'var(--neon)', border: '1px solid var(--border-neon)' }}>
            {cms.hero?.updated || "Last updated: January 2024"}
          </span>
        </div>

        <div className="space-y-5">
          {(cms.content?.sections || [
            { heading: 'Information We Collect', body: 'We collect information you provide directly to us, including your name, email address, phone number, and payment information when you register for an account or enroll in a course.' },
            { heading: 'How We Use Your Information', body: 'We use your information to provide, maintain, and improve our services, process transactions, send notifications, and communicate with you about your account and courses.' },
            { heading: 'Data Security', body: 'We implement appropriate security measures including encryption, secure socket layer technology, and regular security audits to protect your personal information.' },
            { heading: 'Contact Us', body: 'If you have questions about this privacy policy, please contact us at privacy@liveclasscode.com.' },
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
