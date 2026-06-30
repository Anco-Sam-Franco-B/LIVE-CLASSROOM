import { useState, useEffect } from 'react';
import { certificatesAPI } from '../../services/api';
import { Award, Search, Trash2, ExternalLink, Download } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { ListSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';
import DebouncedInput from '../../components/DebouncedInput';
import Pagination from '../../components/Pagination';

export default function CertificateManagement() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmRevoke, setConfirmRevoke] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 20;

  const load = () => {
    setLoading(true);
    certificatesAPI.getAll({ page, limit, search })
      .then(({ data }) => { setCertificates(data.data); setTotal(data.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, search]);

  const handleRevoke = async () => {
    try {
      await certificatesAPI.revoke(confirmRevoke);
      setToast({ type: 'success', message: 'Certificate revoked' });
      setConfirmRevoke(null);
      load();
    } catch (err) { setToast({ type: 'error', message: err.response?.data?.message || 'Error' }); }
  };

  if (loading && certificates.length === 0) return <><PageHeader title="Certificates" /><ListSkeleton count={10} /></>;

  return (
    <div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <PageHeader title="Certificate Management" description={`${total} certificate${total !== 1 ? 's' : ''} issued`} />

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <DebouncedInput value={search} onChange={setSearch} placeholder="Search by student or course..." className="input-field max-w-md" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Student</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Course</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Certificate #</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Issued</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Grade</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{cert.student_name}</span>
                    <span className="block text-xs text-gray-400">{cert.student_email}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">{cert.course_title}</td>
                  <td className="py-3 px-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{cert.certificate_number}</code>
                  </td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{new Date(cert.issued_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="badge badge-info">{cert.grade || '-'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600" title="View"><ExternalLink size={16} /></a>
                      <button onClick={() => setConfirmRevoke(cert.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600" title="Revoke"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {certificates.length === 0 && (
          <EmptyState icon={Award} title="No certificates issued" description="Certificates appear here once issued to students." />
        )}
        {total > limit && <div className="p-4 border-t border-gray-200"><Pagination page={page} total={total} limit={limit} onPageChange={setPage} /></div>}
      </div>

      {confirmRevoke && (
        <ConfirmDialog title="Revoke Certificate?" message="This will permanently revoke this certificate. The student will no longer be able to verify it." onConfirm={handleRevoke} onCancel={() => setConfirmRevoke(null)} />
      )}
    </div>
  );
}
