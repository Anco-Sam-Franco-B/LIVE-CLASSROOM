import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certificatesAPI } from '../../services/api';
import { Award, CheckCircle, XCircle, Shield, Calendar, Clock, User, BookOpen, Search, PenLine } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function CertificateVerify() {
  const { number } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState('');
  const [authorityName, setAuthorityName] = useState('');

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-indigo-200 rounded-full mx-auto mb-4" />
          <div className="h-4 bg-indigo-200 rounded w-48 mx-auto mb-2" />
          <div className="h-3 bg-gray-200 rounded w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link to="/" className="btn-indigo px-6 py-2.5 rounded-lg inline-flex items-center gap-2">
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <CheckCircle size={16} />
            Verified Certificate
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Verification</h1>
          <p className="text-gray-500 mt-1">This certificate has been verified as authentic</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                  <span className="text-xs tracking-[0.2em] uppercase font-medium text-indigo-600">Certificate of Completion</span>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Certificate of <span className="text-indigo-600">Achievement</span>
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User size={18} className="text-indigo-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Student</p>
                      <p className="font-semibold text-gray-900 text-lg">{cert.student_name}</p>
                      <p className="text-sm text-gray-500">{cert.student_email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BookOpen size={18} className="text-indigo-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Course</p>
                      <p className="font-semibold text-gray-900">{cert.course_title}</p>
                      {cert.duration_hours && <p className="text-sm text-gray-500">{cert.duration_hours} hours</p>}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-indigo-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Issued On</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {cert.grade && (
                    <div className="flex items-start gap-3">
                      <Award size={18} className="text-indigo-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Grade Achieved</p>
                        <p className="font-semibold text-gray-900">{cert.grade}</p>
                      </div>
                    </div>
                  )}

                  {cert.teacher_name && (
                    <div className="flex items-start gap-3">
                      <User size={18} className="text-indigo-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Instructor</p>
                        <p className="font-semibold text-gray-900">{cert.teacher_name}</p>
                      </div>
                    </div>
                  )}

                  {signatureUrl && (
                    <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                      <PenLine size={18} className="text-indigo-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Authorized Signature</p>
                        <img src={signatureUrl} alt="Signature" className="h-12 object-contain mt-1" style={{ filter: 'brightness(0.5)' }} />
                        <p className="text-sm text-gray-600 font-medium mt-1">{authorityName || 'Authorized Signatory'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100 min-w-[180px]">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 mb-3">
                  <QRCodeSVG value={qrValue} size={120} level="M" fgColor="#4f46e5" />
                </div>
                <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-3">Scan to verify</p>
                <div className="text-center">
                  <p className="text-xs text-gray-500 font-mono bg-white px-3 py-1 rounded border border-gray-100">
                    {cert.certificate_number}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-green-600">
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
