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
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-500">User</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Action</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Entity</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">{log.user_name || 'System'}</td>
                <td className="py-3 px-4">
                  <span className="badge badge-info">{log.action}</span>
                </td>
                <td className="py-3 px-4 text-gray-600">{log.entity_type} #{log.entity_id?.slice(0, 8)}</td>
                <td className="py-3 px-4 text-right text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
