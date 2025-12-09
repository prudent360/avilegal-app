import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect } from 'react'
import { CreditCard, Search, Download, Loader } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const toast = useToast()

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await adminAPI.getPayments()
      setPayments(res.data)
    } catch (err) {
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !search || 
      payment.reference?.toLowerCase().includes(search.toLowerCase()) ||
      payment.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      payment.user?.email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getStatusBadge = (status) => {
    const classes = {
      success: 'badge-success',
      pending: 'badge-warning',
      failed: 'badge-danger',
    }
    return <span className={`badge ${classes[status] || ''}`}>{status}</span>
  }

  const handleExport = () => {
    if (payments.length === 0) {
      toast.error('No payments to export')
      return
    }
    const csvContent = [
      ['Reference', 'Customer', 'Email', 'Amount', 'Gateway', 'Status', 'Date'].join(','),
      ...payments.map(p => [
        p.reference,
        p.user?.name,
        p.user?.email,
        p.amount,
        p.gateway,
        p.status,
        p.paid_at || p.created_at
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader size={32} className="animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text mb-1">Payments</h1>
          <p className="text-text-muted">View all payment transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">Total: <span className="font-semibold text-text">{payments.length}</span></span>
          <button onClick={handleExport} className="btn btn-outline"><Download size={18} /> Export CSV</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              className="form-input pl-10" 
              placeholder="Search by reference, name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="form-input form-select w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="success">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Gateway</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-text-muted py-8">No payments found.</td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <code className="text-xs bg-surface-hover px-2 py-1 rounded">{payment.reference}</code>
                  </td>
                  <td>
                    <div>
                      <p className="font-medium text-text">{payment.user?.name}</p>
                      <p className="text-xs text-text-muted">{payment.user?.email}</p>
                    </div>
                  </td>
                  <td className="text-text-muted">{payment.application?.service?.name || '-'}</td>
                  <td className="font-semibold text-text">{formatAmount(payment.amount)}</td>
                  <td>
                    <span className={`text-xs font-medium ${payment.gateway === 'paystack' ? 'text-green-600' : 'text-orange-500'}`}>
                      {payment.gateway?.toUpperCase()}
                    </span>
                  </td>
                  <td>{getStatusBadge(payment.status)}</td>
                  <td className="text-text-muted text-sm">{formatDate(payment.paid_at || payment.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
