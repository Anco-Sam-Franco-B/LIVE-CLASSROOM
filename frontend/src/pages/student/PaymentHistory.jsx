import { useState, useEffect } from 'react';
import { paymentsAPI } from '../../services/api';
import { CreditCard, Download, FileText, RefreshCw, Eye } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data } = await paymentsAPI.getHistory();
      setPayments(data.data);
    } catch (err) {
      console.error(err);
      toast('Failed to load payment history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      completed: 'badge-success',
      pending: 'badge-warning',
      processing: 'badge-info',
      failed: 'badge-danger',
      refunded: 'badge-info'
    };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-UG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleViewReceipt = async (paymentId) => {
    try {
      const { data } = await paymentsAPI.getReceipt(paymentId);
      if (data.data?.pdf_url) {
        window.open(data.data.pdf_url, '_blank');
      } else {
        toast('Receipt not yet generated', 'warning');
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load receipt', 'error');
    }
  };

  const handleViewInvoice = async (paymentId) => {
    try {
      const { data } = await paymentsAPI.getInvoice(paymentId);
      if (data.data?.pdf_url) {
        window.open(data.data.pdf_url, '_blank');
      } else {
        toast('Invoice not yet generated', 'warning');
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load invoice', 'error');
    }
  };

  const handleRetry = async (paymentId) => {
    try {
      await paymentsAPI.retry(paymentId);
      toast('Payment retry initiated', 'success');
      loadHistory();
    } catch (err) {
      toast(err.response?.data?.message || 'Retry failed', 'error');
    }
  };

  if (loading) return <><PageHeader title="Payment History" /><TableSkeleton rows={8} cols={6} /></>;

  return (
    <div>
      <PageHeader title="Payment History" description={`${payments.length} transaction${payments.length !== 1 ? 's' : ''}`} />

      {payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payment history" description="Payments for course enrollments will appear here." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Transaction ID</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{formatDate(p.created_at)}</td>
                    <td className="py-3 px-4 text-gray-900 max-w-[200px] truncate">{p.course_title || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {p.payment_method === 'mtn_momo' ? 'MTN MoMo' :
                       p.payment_method === 'airtel_money' ? 'Airtel Money' : p.payment_method}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs font-mono max-w-[120px] truncate">{p.transaction_id || '-'}</td>
                    <td className="py-3 px-4 text-right text-gray-900 font-medium whitespace-nowrap">{p.currency} {parseFloat(p.amount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">{statusBadge(p.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end space-x-1">
                        {p.status === 'completed' && (
                          <>
                            <button onClick={() => handleViewReceipt(p.id)} className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50" title="View Receipt">
                              <FileText size={16} />
                            </button>
                            <button onClick={() => handleViewInvoice(p.id)} className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50" title="View Invoice">
                              <Download size={16} />
                            </button>
                          </>
                        )}
                        {p.status === 'failed' && (
                          <button onClick={() => handleRetry(p.id)} className="p-2 rounded-lg text-amber-600 hover:bg-amber-50" title="Retry Payment">
                            <RefreshCw size={16} />
                          </button>
                        )}
                        {p.status === 'processing' && (
                          <button onClick={() => handleViewReceipt(p.id)} className="p-2 rounded-lg text-gray-400" title="Pending">
                            <Eye size={16} />
                          </button>
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
    </div>
  );
}
