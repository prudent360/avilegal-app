import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect } from 'react'
import { Users, FileText, CreditCard, CheckCircle, Clock, Loader, ArrowRight, AlertCircle } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_users: 0,
    total_applications: 0,
    pending_applications: 0,
    total_revenue: 0,
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [recentPayments, setRecentPayments] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, appsRes, paymentsRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getApplications(),
        adminAPI.getPayments(),
      ])
      setStats(statsRes.data)
      setRecentApplications(appsRes.data?.slice(0, 5) || [])
      setRecentPayments(paymentsRes.data?.slice(0, 5) || [])
    } catch (err) {
      console.error('Failed to load dashboard data')
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
    return new Date(date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending_payment: 'badge badge-warning',
      pending: 'badge badge-info',
      processing: 'badge badge-info',
      completed: 'badge badge-success',
      rejected: 'badge badge-danger',
    }
    return badges[status] || 'badge'
  }

  const statCards = [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Applications', value: stats.total_applications, icon: FileText, color: 'bg-amber-100 text-amber-600' },
    { label: 'Revenue', value: formatPrice(stats.total_revenue), icon: CreditCard, color: 'bg-primary-100 text-primary-600' },
    { label: 'Pending Review', value: stats.pending_applications, icon: Clock, color: 'bg-orange-100 text-orange-600' },
  ]

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">Admin Dashboard</h1>
        <p className="text-text-muted">Welcome back! Here's an overview of the platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-text">{value}</p>
            <p className="text-sm text-text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Recent Applications</h2>
            <Link to="/admin/applications" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {recentApplications.length > 0 ? (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <Link key={app.id} to={`/admin/applications/${app.id}`} 
                  className="flex items-center justify-between p-3 bg-surface-hover rounded-lg hover:bg-gray-100 transition">
                  <div>
                    <p className="font-medium text-text text-sm">{app.company_name}</p>
                    <p className="text-xs text-text-muted">{app.user?.name} • {formatDate(app.created_at)}</p>
                  </div>
                  <span className={getStatusBadge(app.status)}>{app.status}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-text-muted">
              <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No applications yet.</p>
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Recent Payments</h2>
            <Link to="/admin/payments" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {recentPayments.length > 0 ? (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                  <div>
                    <p className="font-medium text-text text-sm">{payment.user?.name}</p>
                    <p className="text-xs text-text-muted">{payment.reference} • {formatDate(payment.paid_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text">{formatPrice(payment.amount)}</p>
                    <span className={`badge ${payment.status === 'success' ? 'badge-success' : 'badge-warning'}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-text-muted">
              <CreditCard size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No payments yet.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
