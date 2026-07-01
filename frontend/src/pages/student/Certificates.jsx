import { useState, useEffect } from 'react';
import { certificatesAPI } from '../../services/api';
import { Award, Download, ExternalLink, Calendar, ShieldCheck, BookOpen, Share2, Check, Copy, Globe, MessageCircle, Link, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PageHeader from '../../components/PageHeader';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const toast = useToast();

  useEffect(() => {
    certificatesAPI.getMy()
      .then(({ data }) => setCertificates(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getVerifyUrl = (cert) => `${window.location.origin}/certificates/verify/${cert.certificate_number}`;

  const copyLink = (cert) => {
    navigator.clipboard.writeText(getVerifyUrl(cert));
    setCopied(true);
    toast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCert = async (cert) => {
    setDownloading(cert.id);
    try {
      const response = await fetch(cert.certificate_url || getVerifyUrl(cert));
      if (!response.ok) {
        window.open(getVerifyUrl(cert), '_blank');
        toast('Certificate opened in new tab', 'success');
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cert.certificate_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast('Certificate downloaded', 'success');
    } catch {
      window.open(getVerifyUrl(cert), '_blank');
    } finally {
      setDownloading(null);
    }
  };

  const shareCert = async (cert) => {
    const url = getVerifyUrl(cert);
    const text = `I earned my certificate "${cert.course_title}"! Verify at: ${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Certificate', text, url });
        toast('Shared successfully!', 'success');
      } catch {}
    } else {
      copyLink(cert);
    }
  };

  if (loading) return <><PageHeader title="My Certificates" /><CardSkeleton count={4} /></>;

  return (
    <div>
      <PageHeader title="My Certificates" description={`${certificates.length} certificate${certificates.length !== 1 ? 's' : ''}`} />
      {certificates.length === 0 ? (
        <EmptyState icon={Award} title="No certificates yet" description="Complete a course to earn your certificate." />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {certificates.map((cert) => {
            const verifyUrl = getVerifyUrl(cert);
            const qrValue = JSON.stringify({
              cert: cert.certificate_number,
              course: cert.course_title,
              issued: new Date(cert.issued_at).toISOString(),
              grade: cert.grade,
              teacher: cert.teacher_name,
              verify: verifyUrl,
            });
            return (
              <div key={cert.id}
                className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-neon)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,255,65,0.15)' } onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)' }
                onClick={() => setSelected(selected?.id === cert.id ? null : cert)}
              >
                <div className="h-1.5" style={{ background: 'linear-gradient(to right, var(--neon), #7fff00, #ff69b4)' }} />

                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl" style={{ background: 'rgba(0,255,65,0.1)' }}>
                        <Award size={28} style={{ color: 'var(--neon)' }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{cert.course_title}</h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <ShieldCheck size={12} style={{ color: 'var(--neon)' }} />
                          <span className="font-mono">{cert.certificate_number}</span>
                        </div>
                        {cert.teacher_name && (
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Issued by {cert.teacher_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); shareCert(cert); }}
                        className="p-2 rounded-lg transition-colors" title="Share" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,150,255,0.1)'; e.currentTarget.style.color = '#0096ff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                        <Share2 size={16} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); window.open(verifyUrl, '_blank'); }}
                        className="p-2 rounded-lg transition-colors" title="Verify" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,65,0.1)'; e.currentTarget.style.color = 'var(--neon)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} style={{ color: 'var(--neon)' }} />
                      <span>{new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    {cert.grade && (
                      <div className="flex items-center gap-1.5">
                        <Award size={13} style={{ color: 'var(--neon)' }} />
                        <span>Grade: <strong style={{ color: 'var(--text-secondary)' }}>{cert.grade}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className={`mt-4 transition-all duration-300 ${selected?.id === cert.id ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                    <div style={{ borderTop: '1px solid var(--border-neon)' }} className="pt-4">
                      <div className="flex items-start gap-4">
                        <div className="p-1.5 rounded-lg shrink-0" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-neon)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <QRCodeSVG value={qrValue} size={72} level="M" fgColor="#4f46e5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Actions</p>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={(e) => { e.stopPropagation(); downloadCert(cert); }}
                              className="neon-btn text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5">
                              {downloading === cert.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                              <span>Download PDF</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); copyLink(cert); }}
                              className="neon-btn-outline text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5">
                              {copied ? <Check size={14} style={{ color: 'var(--neon)' }} /> : <Copy size={14} />}
                              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                            </button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verifyUrl)}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              className="p-1.5 rounded-lg transition-colors" title="Share on Facebook" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,150,255,0.1)'; e.currentTarget.style.color = '#0096ff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                              <Globe size={14} />
                            </a>
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I earned my certificate "${cert.course_title}"!`)}&url=${encodeURIComponent(verifyUrl)}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              className="p-1.5 rounded-lg transition-colors" title="Share on Twitter" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,150,255,0.1)'; e.currentTarget.style.color = '#0096ff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                              <MessageCircle size={14} />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}