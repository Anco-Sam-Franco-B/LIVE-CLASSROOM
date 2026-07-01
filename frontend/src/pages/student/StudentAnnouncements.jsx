import { useState, useEffect } from 'react';
import { announcementsAPI } from '../../services/api';
import { Megaphone, AlertTriangle, Info } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { ListSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import Toast from '../../components/Toast';

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    announcementsAPI.getAll()
      .then(({ data }) => setAnnouncements(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await announcementsAPI.markRead(id);
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_read: true, read_count: (a.read_count || 0) + 1 } : a));
    } catch (err) { setToast({ type: 'error', message: err.response?.data?.message || 'Error' }); }
  };

  const priorityIcon = (p) => {
    if (p === 'urgent') return <AlertTriangle className="shrink-0" size={20} style={{ color: '#ff3232' }} />;
    if (p === 'high') return <AlertTriangle className="shrink-0" size={20} style={{ color: '#ffc800' }} />;
    return <Megaphone className="shrink-0" size={20} style={{ color: 'var(--neon)' }} />;
  };

  const priorityBadge = (p) => {
    const map = { urgent: 'neon-badge-danger', high: 'neon-badge-warning', normal: 'neon-badge-info', low: 'neon-badge-info' };
    return <span className={`neon-badge ${map[p] || 'neon-badge-info'}`}>{p}</span>;
  };

  if (loading) return <><PageHeader title="Announcements" /><ListSkeleton count={5} /></>;

  return (
    <div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <PageHeader title="Announcements" description="Stay updated with platform announcements" />

      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements" description="No announcements yet." />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="neon-card" style={!a.is_read ? { boxShadow: '0 0 0 2px var(--neon)' } : {}} onClick={() => !a.is_read && handleMarkRead(a.id)}>
              <div className="flex items-start space-x-3">
                {priorityIcon(a.priority)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{a.title}</h3>
                    {priorityBadge(a.priority)}
                    {!a.is_read && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--neon)' }} />}
                  </div>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{a.content}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>By {a.author_name}</span>
                    <span>{new Date(a.published_at).toLocaleDateString()}</span>
                    {a.course_id && <span>Course specific</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
