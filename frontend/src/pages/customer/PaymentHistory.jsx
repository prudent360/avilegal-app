import CustomerLayout from '../../components/layouts/CustomerLayout'
import { useState, useEffect } from 'react'
import { CreditCard, Loader, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react'
import { paymentAPI } from '../../services/api'
import { Link } from 'react-router-dom'

export default function PaymentHistory() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await paymentAPI.getHistory()
      setPayments(res.data || [])
    } catch (err) {
      console.error('Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    if (!price) return '₦0'
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-NG', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const getStatusIcon = (status) => {
    if (status === 'success') return <CheckCircle size={18} className="text-green-600" />
    if (status === 'pending') return <Clock size={18} className="text-yellow-600" />
    return <XCircle size={18} className="text-red-600" />
  }

  const getStatusBadge = (status) => {
    if (status === 'success') return 'badge badge-success'
    if (status === 'pending') return 'badge badge-warning'
    return 'badge badge-danger'
  }

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center py-20">
          <Loader size={32} className="animate-spin text-primary-600" />
        </div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">Payment History</h1>
        <p className="text-text-muted">View all your payment transactions.</p>
      </div>

      {payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    payment.status === 'success' ? 'bg-green-100' : 
                    payment.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    {getStatusIcon(payment.status)}
                  </div>
                  <div>
                    <p className="font-semibold text-text">{payment.application?.company_name || 'Application Payment'}</p>
                    <p className="text-sm text-text-muted">{payment.application?.service?.name || 'Business Registration'}</p>
                    <p className="text-xs text-text-muted mt-1">Ref: {payment.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-text">{formatPrice(payment.amount)}</p>
                  <span className={getStatusBadge(payment.status)}>{payment.status}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
                <div className="flex gap-4">
                  <span className="text-text-muted">Gateway: <span className="text-text capitalize">{payment.gateway}</span></span>
                  <span className="text-text-muted">Date: <span className="text-text">{formatDate(payment.paid_at || payment.created_at)}</span></span>
                </div>
                {payment.application_id && (
                  <Link to={`/applications/${payment.application_id}`} className="text-primary-600 hover:underline flex items-center gap-1">
                    View Application <ExternalLink size={14} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <CreditCard size={48} className="text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text mb-2">No Payments Yet</h2>
          <p className="text-text-muted mb-4">Your payment history will appear here once you make a payment.</p>
          <Link to="/applications/new" className="btn btn-primary">Start New Application</Link>
        </div>
      )}
    </CustomerLayout>
  )
}
