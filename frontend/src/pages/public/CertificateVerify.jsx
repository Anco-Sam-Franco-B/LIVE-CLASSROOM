import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certificatesAPI, cmsAPI } from '../../services/api';
import { Award, CheckCircle, XCircle, Shield, Calendar, Clock, User, BookOpen, Search, PenLine } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function CertificateVerify() {
  const { number } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState('');
  const [authorityName, setAuthorityName] = useState('');
  const [cms, setCms] = useState({});

  useEffect(() => {
    cmsAPI.getPublic('certificates')
      .then(({ data }) => { if (data.data) setCms(data.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!number) return;
    fetch('/api/settings/public')
      .then(r => r.json())
      .then(({ data }) => {
        setSignatureUrl(data?.certificate_signature_url || '');
        setAuthorityName(data?.certificate_authority_name || '');
      })
      .catch(() => {});
    certificatesAPI.verify(number)
      .then(({ data }) => setCert(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Certificate not found'))
      .finally(() => setLoading(false));
  }, [number]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-dark)' }}>
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4" style={{ background: 'rgba(0,255,65,0.2)' }} />
          <div className="h-4 rounded w-48 mx-auto mb-2" style={{ background: 'rgba(0,255,65,0.2)' }} />
          <div className="h-3 rounded w-32 mx-auto" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-dark)' }}>
        <div className="rounded-2xl shadow-xl max-w-md w-full p-8 text-center neon-card">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,0,0,0.1)' }}>
            <XCircle size={32} style={{ color: '#ff4444' }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Certificate Not Found</h1>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>{error}</p>
          <Link to="/" className="px-6 py-2.5 rounded-lg inline-flex items-center gap-2" style={{ background: 'var(--neon)', color: '#fff' }}>
            <Search size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const qrValue = JSON.stringify({
    cert: cert.certificate_number,
    student: cert.student_name,
    course: cert.course_title,
    issued: new Date(cert.issued_at).toISOString(),
    grade: cert.grade,
    verify: `${window.location.origin}/certificates/verify/${cert.certificate_number}`,
  });

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4" style={{ background: 'rgba(0,255,65,0.1)', color: 'var(--neon)' }}>
            <CheckCircle size={16} />
            Verified Certificate
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{cms.hero?.title || "Certificate Verification"}</h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>{cms.hero?.subtitle || "This certificate has been verified as authentic"}</p>
        </div>

        <div className="rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--bg-card)' }}>
          <div className="h-2" style={{ background: 'var(--neon)' }} />

          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-0.5 rounded-full" style={{ background: 'var(--neon)' }} />
                  <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: 'var(--neon)' }}>Certificate of Completion</span>
                </div>

                <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                  Certificate of <span style={{ color: 'var(--neon)' }}>Achievement</span>
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User size={18} style={{ color: 'var(--neon)' }} className="mt-0.5" />
                    <div>
                      <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Student</p>
                      <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{cert.student_name}</p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{cert.student_email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BookOpen size={18} style={{ color: 'var(--neon)' }} className="mt-0.5" />
                    <div>
                      <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Course</p>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cert.course_title}</p>
                      {cert.duration_hours && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{cert.duration_hours} hours</p>}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar size={18} style={{ color: 'var(--neon)' }} className="mt-0.5" />
                    <div>
                      <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Issued On</p>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {cert.grade && (
                    <div className="flex items-start gap-3">
                      <Award size={18} style={{ color: 'var(--neon)' }} className="mt-0.5" />
                      <div>
                        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Grade Achieved</p>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cert.grade}</p>
                      </div>
                    </div>
                  )}

                  {cert.teacher_name && (
                    <div className="flex items-start gap-3">
                      <User size={18} style={{ color: 'var(--neon)' }} className="mt-0.5" />
                      <div>
                        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Instructor</p>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cert.teacher_name}</p>
                      </div>
                    </div>
                  )}

                  {signatureUrl && (
                    <div className="flex items-start gap-3 pt-4" style={{ borderTop: '1px solid var(--border-neon)' }}>
                      <PenLine size={18} style={{ color: 'var(--neon)' }} className="mt-0.5" />
                      <div>
                        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Authorized Signature</p>
                        <img src={signatureUrl} alt="Signature" className="h-12 object-contain mt-1" style={{ filter: 'brightness(0.5)' }} />
                        <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>{authorityName || 'Authorized Signatory'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-6 rounded-xl min-w-[180px]" style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-neon)' }}>
                <div className="p-3 rounded-xl shadow-sm mb-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-neon)' }}>
                  <QRCodeSVG value={qrValue} size={120} level="M" fgColor="#00ff41" />
                </div>
                <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>Scan to verify</p>
                <div className="text-center">
                  <p className="text-xs font-mono px-3 py-1 rounded" style={{ color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border-neon)' }}>
                    {cert.certificate_number}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs" style={{ color: 'var(--neon)' }}>
                  <Shield size={14} />
                  <span>Authentic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
