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
                className="relative bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group"
                onClick={() => setSelected(selected?.id === cert.id ? null : cert)}
              >
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50">
                        <Award className="text-indigo-600" size={28} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{cert.course_title}</h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                          <ShieldCheck size={12} className="text-indigo-400" />
                          <span className="font-mono">{cert.certificate_number}</span>
                        </div>
                        {cert.teacher_name && (
                          <p className="text-xs text-gray-400 mt-1">Issued by {cert.teacher_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); shareCert(cert); }}
                        className="p-2 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Share">
                        <Share2 size={16} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); window.open(verifyUrl, '_blank'); }}
                        className="p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors" title="Verify">
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-indigo-400" />
                      <span>{new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    {cert.grade && (
                      <div className="flex items-center gap-1.5">
                        <Award size={13} className="text-green-400" />
                        <span>Grade: <strong className="text-gray-700">{cert.grade}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className={`mt-4 transition-all duration-300 ${selected?.id === cert.id ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-start gap-4">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 shrink-0">
                          <QRCodeSVG value={qrValue} size={72} level="M" fgColor="#4f46e5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 mb-2">Actions</p>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={(e) => { e.stopPropagation(); downloadCert(cert); }}
                              className="btn-indigo text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5">
                              {downloading === cert.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                              <span>Download PDF</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); copyLink(cert); }}
                              className="btn-outline text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5">
                              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                            </button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verifyUrl)}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-colors" title="Share on Facebook">
                              <Globe size={14} />
                            </a>
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I earned my certificate "${cert.course_title}"!`)}&url=${encodeURIComponent(verifyUrl)}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-sky-100 text-gray-500 hover:text-sky-600 transition-colors" title="Share on Twitter">
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