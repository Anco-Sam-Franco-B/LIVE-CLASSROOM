import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import PageHeader from '../../components/PageHeader';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAuditLogs({ limit: 100 })
      .then(({ data }) => setLogs(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><PageHeader title="Audit Logs" /><TableSkeleton rows={8} cols={4} /></>;

  return (
    <div>
      <PageHeader title="Audit Logs" description={`${logs.length} log entries`} />
      <div className="neon-card overflow-hidden">
        <table className="w-full text-sm neon-table">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border-neon)' }}>
              <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>User</th>
              <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Action</th>
              <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Entity</th>
              <th className="text-right py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b" style={{ borderColor: 'var(--border-neon)' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(0,255,65,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{log.user_name || 'System'}</td>
                <td className="py-3 px-4">
                  <span className="neon-badge neon-badge-info">{log.action}</span>
                </td>
                <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{log.entity_type} #{log.entity_id?.slice(0, 8)}</td>
                <td className="py-3 px-4 text-right" style={{ color: 'var(--text-secondary)' }}>{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
