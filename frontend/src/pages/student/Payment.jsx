import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI, paymentsAPI } from '../../services/api';
import { CreditCard, Smartphone, ArrowLeft, Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { Input, Select } from '../../components/FormFields';

export default function Payment() {
  const navigate = useNavigate();
  const toast = useToast();
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [method, setMethod] = useState('mtn_momo');
  const [phone, setPhone] = useState('');
  const [activePayment, setActivePayment] = useState(null);
  const [pollingStatus, setPollingStatus] = useState(null);
  const pollTimer = useRef(null);

  useEffect(() => {
    loadPendingPayments();
    return () => { if (pollTimer.current) clearInterval(pollTimer.current); };
  }, []);

  const loadPendingPayments = async () => {
    try {
      const { data } = await coursesAPI.getMyCourses();
      const enrollmentsWithPayment = data.data.filter(e => !e.payment_id && e.price > 0);
      setPendingEnrollments(enrollmentsWithPayment);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (paymentId) => {
    let attempts = 0;
    setPollingStatus('checking');
    pollTimer.current = setInterval(async () => {
      attempts++;
      try {
        const { data } = await paymentsAPI.getStatus(paymentId);
        if (data.data.status === 'completed') {
          clearInterval(pollTimer.current);
          setPollingStatus('completed');
          setActivePayment(null);
          toast('Payment successful! You are now enrolled.', 'success');
          loadPendingPayments();
        } else if (data.data.status === 'failed') {
          clearInterval(pollTimer.current);
          setPollingStatus('failed');
          setActivePayment(null);
          toast('Payment failed. Please try again.', 'error');
        } else if (attempts >= 12) {
          clearInterval(pollTimer.current);
          setPollingStatus('timeout');
          toast('Payment is taking longer than expected. Check your payment history.', 'warning');
        } else {
          setPollingStatus('checking');
        }
      } catch {
        if (attempts >= 12) {
          clearInterval(pollTimer.current);
          setPollingStatus('timeout');
        }
      }
    }, 5000);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!phone.match(/^(\+256|0)[0-9]{9}$/)) {
      toast('Enter a valid Ugandan phone number (e.g., 07XXXXXXXXX)', 'error');
      return;
    }
    if (!selectedEnrollment) {
      toast('Select a course to pay for', 'error');
      return;
    }
    setPaying(true);
    setPollingStatus('initiating');
    try {
      const apiMethod = method === 'mtn_momo' ? paymentsAPI.mtn : paymentsAPI.airtel;
      const { data } = await apiMethod({
        amount: selectedEnrollment.price,
        phoneNumber: phone,
        enrollmentId: selectedEnrollment.id,
        description: `Payment for ${selectedEnrollment.title}`,
      });
      toast('Payment initiated! Complete the transaction on your phone.', 'success');
      setActivePayment({ id: data.data.id, amount: selectedEnrollment.price });
      setSelectedEnrollment(null);
      setPhone('');
      startPolling(data.data.id);
    } catch (err) {
      toast(err.response?.data?.message || 'Payment failed', 'error');
      setPollingStatus(null);
    } finally {
      setPaying(false);
    }
  };

  const handleRetry = async () => {
    if (!activePayment) return;
    try {
      await paymentsAPI.retry(activePayment.id);
      toast('Payment retry initiated', 'success');
      startPolling(activePayment.id);
    } catch (err) {
      toast(err.response?.data?.message || 'Retry failed', 'error');
    }
  };

  if (loading) return <><PageHeader title="Make Payment" /><CardSkeleton count={3} /></>;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Make Payment" description={`${pendingEnrollments.length} course${pendingEnrollments.length !== 1 ? 's' : ''} awaiting payment`} actions={<button onClick={() => navigate('/student/courses')} className="btn-secondary flex items-center space-x-2"><ArrowLeft size={18} /><span>Back to Courses</span></button>} />

      {pollingStatus && (
        <div className={`mb-6 p-4 rounded-lg border ${
          pollingStatus === 'checking' || pollingStatus === 'initiating' ? 'bg-blue-50 border-blue-200' :
          pollingStatus === 'completed' ? 'bg-green-50 border-green-200' :
          pollingStatus === 'failed' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-3">
            {pollingStatus === 'initiating' && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
            {pollingStatus === 'checking' && <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />}
            {pollingStatus === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {pollingStatus === 'failed' && <XCircle className="w-5 h-5 text-red-600" />}
            {pollingStatus === 'timeout' && <RefreshCw className="w-5 h-5 text-yellow-600" />}
            <div className="flex-1">
              <p className={`font-medium ${
                pollingStatus === 'checking' || pollingStatus === 'initiating' ? 'text-blue-800' :
                pollingStatus === 'completed' ? 'text-green-800' :
                pollingStatus === 'failed' ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {pollingStatus === 'initiating' && 'Initiating payment...'}
                {pollingStatus === 'checking' && 'Checking payment status...'}
                {pollingStatus === 'completed' && 'Payment successful! You are now enrolled.'}
                {pollingStatus === 'failed' && 'Payment failed.'}
                {pollingStatus === 'timeout' && 'Status check timed out.'}
              </p>
              {activePayment && (
                <p className="text-sm text-gray-600 mt-1">
                  Amount: UGX {parseFloat(activePayment.amount).toLocaleString()}
                </p>
              )}
            </div>
            {pollingStatus === 'failed' && (
              <button onClick={handleRetry} className="btn-primary text-sm py-1 px-3">Retry</button>
            )}
            {pollingStatus === 'timeout' && (
              <button onClick={() => { setPollingStatus(null); setActivePayment(null); }} className="btn-secondary text-sm py-1 px-3">Dismiss</button>
            )}
          </div>
        </div>
      )}

      {pendingEnrollments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No pending payments" description="All your courses are paid for or free." action={<button onClick={() => navigate('/student/courses')} className="btn-primary">Browse Courses</button>} />
      ) : (
        <div className="space-y-6">
          {pendingEnrollments.map((enrollment) => (
            <div key={enrollment.id} className="card">
              <div className="flex items-start space-x-4 p-4 border-b border-gray-100">
                <img src={enrollment.thumbnail_url || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=200&fit=crop'} alt={enrollment.title} className="w-20 h-16 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{enrollment.title}</h3>
                  <p className="text-sm text-gray-500">{enrollment.teacher_name}</p>
                  <p className="text-lg font-bold text-indigo-600 mt-2">UGX {parseFloat(enrollment.price).toLocaleString()}</p>
                </div>
              </div>

              {selectedEnrollment?.id === enrollment.id ? (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-4">Complete Payment</h4>
                  <form onSubmit={handlePay} className="space-y-4">
                    <Select label="Payment Method" value={method} onChange={e => setMethod(e.target.value)} placeholder="Select method">
                      <option value="mtn_momo">MTN MoMo</option>
                      <option value="airtel_money">Airtel Money</option>
                    </Select>
                    <Input label="Phone Number" type="tel" placeholder="07XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} required icon={<Smartphone className="w-5 h-5" />} />
                    <div className="flex space-x-3 pt-2">
                      <button type="submit" disabled={paying || pollingStatus === 'checking'} className={`btn-primary flex-1 ${paying ? 'btn-loading' : ''}`}>{paying ? 'Processing...' : `Pay UGX ${parseFloat(enrollment.price).toLocaleString()}`}</button>
                      <button type="button" onClick={() => setSelectedEnrollment(null)} className="btn-secondary">Cancel</button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-4">
                  <button onClick={() => setSelectedEnrollment(enrollment)} className="btn-primary w-full flex items-center justify-center space-x-2">
                    <CreditCard size={20} /><span>Pay Now</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
