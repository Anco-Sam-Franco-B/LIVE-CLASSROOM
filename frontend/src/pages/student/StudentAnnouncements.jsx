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
    if (p === 'urgent') return <AlertTriangle className="text-red-500 shrink-0" size={20} />;
    if (p === 'high') return <AlertTriangle className="text-orange-500 shrink-0" size={20} />;
    return <Megaphone className="text-indigo-500 shrink-0" size={20} />;
  };

  const priorityBadge = (p) => {
    const map = { urgent: 'badge-danger', high: 'badge-warning', normal: 'badge-info', low: 'badge-secondary' };
    return <span className={`badge ${map[p] || 'badge-info'}`}>{p}</span>;
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
            <div key={a.id} className={`card ${!a.is_read ? 'ring-2 ring-indigo-200' : ''}`} onClick={() => !a.is_read && handleMarkRead(a.id)}>
              <div className="flex items-start space-x-3">
                {priorityIcon(a.priority)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    {priorityBadge(a.priority)}
                    {!a.is_read && <span className="w-2 h-2 bg-indigo-600 rounded-full shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{a.content}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
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
