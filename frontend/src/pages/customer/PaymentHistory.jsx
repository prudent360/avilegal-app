import CustomerLayout from '../../components/layouts/CustomerLayout'
import { CreditCard } from 'lucide-react'

export default function PaymentHistory() {
  return (
    <CustomerLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">Payment History</h1>
        <p className="text-text-muted">View all your payment transactions.</p>
      </div>

      <div className="card text-center py-12">
        <CreditCard size={48} className="text-text-muted mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-text mb-2">No Payments Yet</h2>
        <p className="text-text-muted">Your payment history will appear here.</p>
      </div>
    </CustomerLayout>
  )
}
