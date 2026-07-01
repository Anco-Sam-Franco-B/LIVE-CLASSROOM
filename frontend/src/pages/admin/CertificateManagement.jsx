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

      <div className="neon-card overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-neon)' }}>
          <DebouncedInput value={search} onChange={setSearch} placeholder="Search by student or course..." className="neon-input max-w-md" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm neon-table">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-neon)', background: 'var(--bg-dark)' }}>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Student</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Course</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Certificate #</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Issued</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Grade</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert.id} className="border-b" style={{ borderColor: 'var(--border-neon)' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(0,255,65,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td className="py-3 px-4">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{cert.student_name}</span>
                    <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>{cert.student_email}</span>
                  </td>
                  <td className="py-3 px-4 max-w-[200px] truncate" style={{ color: 'var(--text-secondary)' }}>{cert.course_title}</td>
                  <td className="py-3 px-4">
                    <code className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-card)' }}>{cert.certificate_number}</code>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{new Date(cert.issued_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="neon-badge neon-badge-info">{cert.grade || '-'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,255,65,0.05)';e.currentTarget.style.color='var(--neon)'}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-muted)'}} title="View"><ExternalLink size={16} /></a>
                      <button onClick={() => setConfirmRevoke(cert.id)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,255,65,0.05)';e.currentTarget.style.color='#ff3232'}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-muted)'}} title="Revoke"><Trash2 size={16} /></button>
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
        {total > limit && <div className="p-4 border-t" style={{ borderColor: 'var(--border-neon)' }}><Pagination page={page} total={total} limit={limit} onPageChange={setPage} /></div>}
      </div>

      {confirmRevoke && (
        <ConfirmDialog title="Revoke Certificate?" message="This will permanently revoke this certificate. The student will no longer be able to verify it." onConfirm={handleRevoke} onCancel={() => setConfirmRevoke(null)} />
      )}
    </div>
  );
}
