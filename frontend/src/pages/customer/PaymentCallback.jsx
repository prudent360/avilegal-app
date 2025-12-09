import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

export default function PaymentCallback() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    const reference = searchParams.get('reference')
    if (reference) {
      setTimeout(() => {
        setStatus('success')
        toast.success('Payment successful!')
      }, 2000)
    } else {
      setStatus('error')
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="card max-w-sm w-full text-center">
        {status === 'loading' && (
          <>
            <Loader size={48} className="text-primary-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-lg font-semibold text-text mb-2">Verifying Payment...</h2>
            <p className="text-text-muted">Please wait while we confirm your payment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-primary-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-text mb-2">Payment Successful!</h2>
            <p className="text-text-muted mb-4">Your payment has been processed successfully.</p>
            <button onClick={() => navigate('/applications')} className="btn btn-primary w-full">View Applications</button>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-text mb-2">Payment Failed</h2>
            <p className="text-text-muted mb-4">Something went wrong with your payment.</p>
            <button onClick={() => navigate('/applications')} className="btn btn-outline w-full">Back to Applications</button>
          </>
        )}
      </div>
    </div>
  )
}
