import { useState, useEffect } from 'react';
import { paymentsAPI } from '../../services/api';
import {
  CreditCard, CheckCircle, XCircle, Trash2, RefreshCw,
  TrendingUp, DollarSign, Users, AlertCircle, Download, FileText
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { CardSkeleton, TableSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card p-4 flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [mtnBalance, setMtnBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [filter, setFilter] = useState('');
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        paymentsAPI.getAll({ limit: 50 }),
        paymentsAPI.getStats(),
      ]);
      setPayments(paymentsRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
      toast('Failed to load payment data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMtnBalance = async () => {
    try {
      const { data } = await paymentsAPI.getMtnBalance();
      setMtnBalance(data.data);
      toast('Balance fetched', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to fetch balance', 'error');
    }
  };

  const verifyPayment = async (id) => {
    try {
      await paymentsAPI.verify(id);
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'completed' } : p));
      toast('Payment verified', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const manualVerifyPayment = async (id) => {
    try {
      await paymentsAPI.manualVerify(id);
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'completed' } : p));
      toast('Payment manually verified', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const refundPayment = async (id) => {
    try {
      await paymentsAPI.refund(id, { reason: 'Admin requested refund' });
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'refunded' } : p));
      toast('Payment refunded', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const deletePayment = async (id) => {
    try {
      await paymentsAPI.delete(id);
      setPayments(prev => prev.filter(p => p.id !== id));
      toast('Payment deleted', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const exportCsv = () => {
    const headers = ['Date', 'User', 'Email', 'Method', 'Amount', 'Currency', 'Status', 'Transaction ID'];
    const rows = payments.map(p => [
      new Date(p.created_at).toISOString(),
      p.user_name || '',
      p.user_email || '',
      p.payment_method,
      p.amount,
      p.currency || 'UGX',
      p.status,
      p.transaction_id || ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Payments exported', 'success');
  };

  const statusBadge = (status) => {
    const map = { completed: 'badge-success', pending: 'badge-warning', processing: 'badge-info', failed: 'badge-danger', refunded: 'badge-info' };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
  };

  const filteredPayments = filter
    ? payments.filter(p =>
        p.status === filter ||
        p.payment_method?.includes(filter) ||
        p.user_name?.toLowerCase().includes(filter.toLowerCase()) ||
        p.user_email?.toLowerCase().includes(filter.toLowerCase())
      )
    : payments;

  if (loading) return <><PageHeader title="Payment Management" /><CardSkeleton count={4} /><TableSkeleton rows={6} cols={6} /></>;

  return (
    <div>
      <PageHeader title="Payment Management"
        description={stats ? `${stats.total_payments} payments | UGX ${parseFloat(stats.total_revenue || 0).toLocaleString()} total` : 'Loading...'}
        actions={<button onClick={exportCsv} className="btn-secondary flex items-center space-x-2"><Download size={16} /><span>Export CSV</span></button>}
      />

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={DollarSign} label="Total Revenue"
            value={`UGX ${parseFloat(stats.total_revenue || 0).toLocaleString()}`}
            sub={`${stats.completed_payments || 0} completed payments`}
            color="bg-green-500" />
          <StatCard icon={TrendingUp} label="Today"
            value={`UGX ${parseFloat(stats.today?.today_revenue || 0).toLocaleString()}`}
            sub={`${stats.today?.today_count || 0} payments today`}
            color="bg-blue-500" />
          <StatCard icon={AlertCircle} label="Pending"
            value={stats.pending_payments || 0}
            sub={`${stats.failed_payments || 0} failed`}
            color="bg-amber-500" />
          <StatCard icon={CreditCard} label="Average Payment"
            value={`UGX ${parseFloat(stats.average_payment || 0).toLocaleString()}`}
            sub={`${stats.refunded_payments || 0} refunded`}
            color="bg-indigo-500" />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          {['', 'completed', 'processing', 'failed', 'refunded'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === s ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
        <button onClick={loadMtnBalance} className="btn-outline text-sm flex items-center space-x-1">
          <RefreshCw size={14} /><span>MTN Balance</span>
        </button>
      </div>

      {mtnBalance && (
        <div className="p-3 mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">MTN MoMo Account Balance</p>
            <p className="text-lg font-bold text-gray-900">{mtnBalance.currency || 'EUR'} {parseFloat(mtnBalance.availableBalance || 0).toLocaleString()}</p>
          </div>
          <button onClick={() => setMtnBalance(null)} className="text-gray-400 hover:text-gray-600">Dismiss</button>
        </div>
      )}

      {filteredPayments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments found" description={filter ? `No payments with status "${filter}"` : ''} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Transaction</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{p.user_name}</p>
                      <p className="text-xs text-gray-500">{p.user_email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600">{p.payment_method === 'mtn_momo' ? 'MTN MoMo' : p.payment_method === 'airtel_money' ? 'Airtel Money' : p.payment_method}</span>
                      {p.provider === 'MTN' && <span className="ml-2 text-xs text-gray-400">{p.mtn_environment || 'sandbox'}</span>}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-gray-500 max-w-[100px] truncate">{p.transaction_id || '-'}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 whitespace-nowrap">{p.currency} {parseFloat(p.amount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">{statusBadge(p.status)}</td>
                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end space-x-1">
                        {p.status === 'processing' && (
                          <>
                            <button onClick={() => verifyPayment(p.id)} className="btn-outline p-2" title="Verify"><CheckCircle size={16} /></button>
                            <button onClick={() => manualVerifyPayment(p.id)} className="btn-outline p-2 text-amber-600" title="Manual Verify"><FileText size={16} /></button>
                          </>
                        )}
                        {p.status === 'completed' && (
                          <button onClick={() => refundPayment(p.id)} className="btn-outline p-2 text-red-600" title="Refund"><XCircle size={16} /></button>
                        )}
                        {p.status === 'failed' && (
                          <button onClick={() => setConfirm({
                            action: () => deletePayment(p.id),
                            title: 'Delete Payment',
                            message: 'Delete this failed payment record?'
                          })} className="p-2 rounded-lg text-red-600 hover:bg-red-50" title="Delete"><Trash2 size={16} /></button>
                        )}
                        {(p.status === 'completed' || p.status === 'failed') && (
                          <button onClick={() => setConfirm({
                            action: () => deletePayment(p.id),
                            title: 'Delete Payment',
                            message: 'Delete this payment record?'
                          })} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100" title="Delete"><Trash2 size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ConfirmDialog isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={confirm?.action} title={confirm?.title} message={confirm?.message} />
    </div>
  );
}
