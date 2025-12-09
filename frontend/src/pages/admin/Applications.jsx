import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Search, Loader, Eye, CheckCircle, XCircle, Clock, CreditCard, ArrowRight } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function AdminApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const toast = useToast()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await adminAPI.getApplications()
      setApplications(res.data)
    } catch (err) {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveApplication(id)
      toast.success('Application approved')
      fetchApplications()
    } catch (err) {
      toast.error('Failed to approve application')
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return
    try {
      await adminAPI.rejectApplication(id, reason)
      toast.success('Application rejected')
      fetchApplications()
    } catch (err) {
      toast.error('Failed to reject application')
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      app.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.user?.email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  const getStatusLabel = (status) => {
    const labels = {
      pending_payment: 'Awaiting Payment',
      pending: 'Pending Review',
      processing: 'Processing',
      completed: 'Completed',
      rejected: 'Rejected',
    }
    return labels[status] || status
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-NG', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    })
  }

  const formatPrice = (price) => {
    if (!price) return '-'
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)
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
          <h1 className="text-2xl font-bold text-text mb-1">Applications</h1>
          <p className="text-text-muted">Review and manage registration applications.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="badge badge-info">{applications.filter(a => a.status === 'pending').length} Pending</span>
          <span className="badge badge-success">{applications.filter(a => a.status === 'completed').length} Completed</span>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              className="form-input pl-10" 
              placeholder="Search by company name or customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="form-input form-select w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending_payment">Awaiting Payment</option>
            <option value="pending">Pending Review</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-text-muted py-8">
                  <FileText size={32} className="mx-auto mb-2 opacity-50" />
                  No applications found.
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div>
                      <p className="font-medium text-text">{app.company_name}</p>
                      <p className="text-xs text-text-muted">{app.business_type}</p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="text-text">{app.user?.name}</p>
                      <p className="text-xs text-text-muted">{app.user?.email}</p>
                    </div>
                  </td>
                  <td className="text-text-muted">{app.service?.name || '-'}</td>
                  <td className="font-medium">{formatPrice(app.service?.price)}</td>
                  <td>
                    <span className={getStatusBadge(app.status)}>
                      {getStatusLabel(app.status)}
                    </span>
                  </td>
                  <td className="text-text-muted text-sm">{formatDate(app.created_at)}</td>
                  <td>
                    <div className="flex gap-2">
                      {app.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(app.id)}
                            className="btn btn-sm btn-outline text-green-600 hover:bg-green-50 hover:border-green-300"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            onClick={() => handleReject(app.id)}
                            className="btn btn-sm btn-outline text-red-600 hover:bg-red-50 hover:border-red-300"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      <Link to={`/admin/applications/${app.id}`} className="btn btn-sm btn-outline" title="View Details">
                        <Eye size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
