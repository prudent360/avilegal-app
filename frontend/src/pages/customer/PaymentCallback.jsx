import CustomerLayout from '../../components/layouts/CustomerLayout'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { paymentAPI } from '../../services/api'

export default function PaymentCallback() {
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference') || searchParams.get('tx_ref') || searchParams.get('trxref')
      
      if (!reference) {
        setStatus('error')
        setMessage('No payment reference found')
        return
      }

      try {
        const res = await paymentAPI.verify({ reference })
        if (res.data.success) {
          setStatus('success')
          setMessage('Payment successful! Your application has been submitted.')
        } else {
          setStatus('error')
          setMessage(res.data.message || 'Payment verification failed')
        }
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Payment verification failed')
      }
    }

    verifyPayment()
  }, [searchParams])

  return (
    <CustomerLayout>
      <div className="max-w-md mx-auto text-center py-12">
        {status === 'verifying' && (
          <>
            <Loader size={64} className="animate-spin text-primary-600 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-text mb-2">Verifying Payment</h1>
            <p className="text-text-muted">Please wait while we confirm your payment...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">Payment Successful!</h1>
            <p className="text-text-muted mb-8">{message}</p>
            <div className="space-y-3">
              <button onClick={() => navigate('/applications')} className="btn btn-primary w-full">
                View My Applications
              </button>
              <button onClick={() => navigate('/documents')} className="btn btn-outline w-full">
                Upload Documents
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={48} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">Payment Failed</h1>
            <p className="text-text-muted mb-8">{message}</p>
            <div className="space-y-3">
              <button onClick={() => navigate('/applications/new')} className="btn btn-primary w-full">
                Try Again
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn btn-outline w-full">
                Go to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </CustomerLayout>
  )
}
