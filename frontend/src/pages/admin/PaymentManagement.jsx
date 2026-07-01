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
    <div className="neon-card p-4 flex items-center space-x-4">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: color }}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
        {sub && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
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
    const map = {
      completed: 'neon-badge-success',
      pending: 'neon-badge-warning',
      processing: 'neon-badge-info',
      failed: 'neon-badge-danger',
      refunded: 'neon-badge-info',
    };
    return <span className={`neon-badge ${map[status] || 'neon-badge-info'}`}>{status}</span>;
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
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,255,65,0.05)] via-transparent to-[rgba(0,191,255,0.05)] rounded-2xl" />
      <div className="relative z-10">
        <PageHeader title="Payment Management"
          description={stats ? `${stats.total_payments} payments | UGX ${parseFloat(stats.total_revenue || 0).toLocaleString()} total` : 'Loading...'}
          actions={<button onClick={exportCsv} className="neon-btn flex items-center space-x-2"><Download size={16} /><span>Export CSV</span></button>}
        />

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="neon-card p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,255,65,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[rgba(0,255,65,0.12)] backdrop-blur-sm border border-[rgba(0,255,65,0.3)] shadow-[0_0_20px_rgba(0,255,65,0.15)]">
                <DollarSign className="w-6 h-6 text-[var(--neon)]" />
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Total Revenue</p>
                <p className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{`UGX ${parseFloat(stats.total_revenue || 0).toLocaleString()}`}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{`${stats.completed_payments || 0} completed payments`}</p>
              </div>
            </div>
          </div>
          <div className="neon-card p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,191,255,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[rgba(0,191,255,0.12)] backdrop-blur-sm border border-[rgba(0,191,255,0.3)] shadow-[0_0_20px_rgba(0,191,255,0.15)]">
                <TrendingUp className="w-6 h-6 text-[#00ccff]" />
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Today</p>
                <p className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{`UGX ${parseFloat(stats.today?.today_revenue || 0).toLocaleString()}`}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{`${stats.today?.today_count || 0} payments today`}</p>
              </div>
            </div>
          </div>
          <div className="neon-card p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,200,0,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[rgba(255,200,0,0.12)] backdrop-blur-sm border border-[rgba(255,200,0,0.3)] shadow-[0_0_20px_rgba(255,200,0,0.15)]">
                <AlertCircle className="w-6 h-6 text-[#ffc800]" />
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Pending</p>
                <p className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stats.pending_payments || 0}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{`${stats.failed_payments || 0} failed`}</p>
              </div>
            </div>
          </div>
          <div className="neon-card p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,255,65,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[rgba(0,255,65,0.12)] backdrop-blur-sm border border-[rgba(0,255,65,0.3)] shadow-[0_0_20px_rgba(0,255,65,0.15)]">
                <CreditCard className="w-6 h-6 text-[var(--neon)]" />
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Average Payment</p>
                <p className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{`UGX ${parseFloat(stats.average_payment || 0).toLocaleString()}`}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{`${stats.refunded_payments || 0} refunded`}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex flex-wrap gap-2">
          {['', 'completed', 'processing', 'failed', 'refunded'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`neon-btn text-sm ${filter === s ? 'active' : ''}`}
              onMouseEnter={e=>{if(filter!==s){e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 4px 20px rgba(0,255,65,0.2)'}}}
              onMouseLeave={e=>{if(filter!==s){e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}}>              {s || 'All'}
            </button>
          ))}
        </div>
        <button onClick={loadMtnBalance} className="neon-btn-outline text-sm flex items-center space-x-2 hover-scale">
          <RefreshCw size={14} /><span>MTN Balance</span>
        </button>
      </div>

      {mtnBalance && (
        <div className="p-3 mb-4 rounded-lg flex items-center justify-between" style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid var(--border-neon)' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>MTN MoMo Account Balance</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{mtnBalance.currency || 'EUR'} {parseFloat(mtnBalance.availableBalance || 0).toLocaleString()}</p>
          </div>
          <button onClick={() => setMtnBalance(null)} style={{ color: 'var(--text-muted)' }} onMouseEnter={e=>e.currentTarget.style.color='var(--text-primary)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}>Dismiss</button>
        </div>
      )}

      {filteredPayments.length === 0 ? (
        <div className="neon-card p-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[rgba(0,255,65,0.1)] backdrop-blur-sm border border-[rgba(0,255,65,0.3)] shadow-[0_0_20px_rgba(0,255,65,0.15)]">
            <CreditCard size={32} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No payments found</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{filter ? `No payments with status "${filter}"` : ''}</p>
        </div>
      ) : (
        <div className="neon-card overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[rgba(0,255,65,0.6)] via-[rgba(0,191,255,0.6)] to-[rgba(255,200,0,0.6)]" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-neon)' }}>
                  <th className="text-left py-4 px-6 font-semibold" style={{ color: 'var(--text-muted)', background: 'rgba(0,255,65,0.05)' }}>User</th>
                  <th className="text-left py-4 px-6 font-semibold" style={{ color: 'var(--text-muted)', background: 'rgba(0,255,65,0.05)' }}>Method</th>
                  <th className="text-left py-4 px-6 font-semibold" style={{ color: 'var(--text-muted)', background: 'rgba(0,255,65,0.05)' }}>Transaction</th>
                  <th className="text-right py-4 px-6 font-semibold" style={{ color: 'var(--text-muted)', background: 'rgba(0,255,65,0.05)' }}>Amount</th>
                  <th className="text-center py-4 px-6 font-semibold" style={{ color: 'var(--text-muted)', background: 'rgba(0,255,65,0.05)' }}>Status</th>
                  <th className="text-left py-4 px-6 font-semibold" style={{ color: 'var(--text-muted)', background: 'rgba(0,255,65,0.05)' }}>Date</th>
                  <th className="text-right py-4 px-6 font-semibold" style={{ color: 'var(--text-muted)', background: 'rgba(0,255,65,0.05)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-[rgba(0,255,65,0.05)] transition-colors duration-200" style={{ borderColor: 'var(--border-neon)' }}>
                    <td className="py-4 px-6">
                      <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{p.user_name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.user_email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium" style={{
                        background: p.payment_method === 'mtn_momo' ? 'rgba(0,191,255,0.1)' : p.payment_method === 'airtel_money' ? 'rgba(255,200,0,0.1)' : 'rgba(0,255,65,0.1)',
                        color: p.payment_method === 'mtn_momo' ? '#00ccff' : p.payment_method === 'airtel_money' ? '#ffc800' : 'var(--neon)',
                        border: p.payment_method === 'mtn_momo' ? '1px solid rgba(0,191,255,0.3)' : p.payment_method === 'airtel_money' ? '1px solid rgba(255,200,0,0.3)' : '1px solid rgba(0,255,65,0.3)'
                      }}>{p.payment_method === 'mtn_momo' ? 'MTN MoMo' : p.payment_method === 'airtel_money' ? 'Airtel Money' : p.payment_method}</span>
                      {p.provider === 'MTN' && <span className="ml-2 text-xs px-2 py-1 rounded" style={{ background: 'rgba(0,255,65,0.1)', color: 'var(--text-muted)', border: '1px solid var(--border-neon)' }}>{p.mtn_environment || 'sandbox'}</span>}
                    </td>
                    <td className="py-4 px-6 text-xs font-mono" style={{ color: 'var(--text-muted)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.transaction_id || '-'}</td>
                    <td className="py-4 px-6 text-right font-semibold whitespace-nowrap" style={{ color: 'var(--neon)' }}>{p.currency} {parseFloat(p.amount).toLocaleString()}</td>
                    <td className="py-4 px-6 text-center">{statusBadge(p.status)}</td>
                    <td className="py-4 px-6 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end space-x-2">
                        {p.status === 'processing' && (
                          <>
                            <button onClick={() => verifyPayment(p.id)} className="neon-btn-outline p-2 hover-scale" title="Verify"><CheckCircle size={16} /></button>
                            <button onClick={() => manualVerifyPayment(p.id)} className="neon-btn-outline p-2 hover-scale" title="Manual Verify" style={{ color: '#ffc800' }}><FileText size={16} /></button>
                          </>
                        )}
                        {p.status === 'completed' && (
                          <button onClick={() => refundPayment(p.id)} className="neon-btn-outline p-2 hover-scale" title="Refund" style={{ color: '#ff3232' }}><XCircle size={16} /></button>
                        )}
                        {p.status === 'failed' && (
                          <button onClick={() => setConfirm({
                            action: () => deletePayment(p.id),
                            title: 'Delete Payment',
                            message: 'Delete this failed payment record?'
                          })} className="p-2 rounded-lg hover:bg-[rgba(255,50,50,0.1)] transition-colors" title="Delete" style={{ color: '#ff3232' }}><Trash2 size={16} /></button>
                        )}
                        {(p.status === 'completed' || p.status === 'failed') && (
                          <button onClick={() => setConfirm({
                            action: () => deletePayment(p.id),
                            title: 'Delete Payment',
                            message: 'Delete this payment record?'
                          })} className="p-2 rounded-lg hover:bg-[rgba(0,255,65,0.05)] transition-colors" title="Delete"><Trash2 size={16} /></button>
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
  </div>
);
}
