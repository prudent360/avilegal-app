import CustomerLayout from '../../components/layouts/CustomerLayout'
import { Link } from 'react-router-dom'
import { Plus, FileText, Clock, CheckCircle, XCircle, ArrowRight, Loader, Trash2, CreditCard, AlertCircle, Pencil } from 'lucide-react'
import { useState, useEffect } from 'react'
import { applicationAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await applicationAPI.getAll()
      setApplications(res.data)
    } catch (err) {
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, companyName) => {
    if (!confirm(`Delete application for "${companyName}"? This cannot be undone.`)) return
    try {
      await applicationAPI.delete(id)
      toast.success('Application deleted')
      setApplications(apps => apps.filter(a => a.id !== id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
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

  const getStatusIcon = (status) => {
    const icons = {
      pending_payment: <CreditCard size={16} />,
      pending: <Clock size={16} />,
      processing: <Loader size={16} className="animate-spin" />,
      completed: <CheckCircle size={16} />,
      rejected: <XCircle size={16} />,
    }
    return icons[status] || <FileText size={16} />
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text mb-1">My Applications</h1>
          <p className="text-text-muted">Track and manage your business registration applications.</p>
        </div>
        <Link to="/applications/new" className="btn btn-primary"><Plus size={18} /> New Application</Link>
      </div>

      {error && (
        <div className="card bg-red-50 border-red-200 text-red-700 mb-6">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <FileText size={48} className="text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text mb-2">No Applications Yet</h2>
          <p className="text-text-muted mb-4">Start your first business registration application.</p>
          <Link to="/applications/new" className="btn btn-primary">Start Application</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    app.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-600' : 'bg-primary-100 text-primary-600'
                  }`}>
                    {getStatusIcon(app.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">{app.company_name}</h3>
                    <p className="text-sm text-text-muted">{app.service?.name || 'Business Registration'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={getStatusBadge(app.status)}>
                    {getStatusLabel(app.status)}
                  </span>
                  
                  {app.status === 'pending_payment' ? (
                    <>
                      <Link to={`/applications/${app.id}/edit`} className="btn btn-outline btn-sm" title="Edit">
                        <Pencil size={16} />
                      </Link>
                      <Link to={`/applications/${app.id}`} className="btn btn-primary btn-sm">
                        Continue <ArrowRight size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(app.id, app.company_name)}
                        className="btn btn-outline btn-sm text-red-600 hover:bg-red-50 hover:border-red-300"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <Link to={`/applications/${app.id}`} className="btn btn-outline btn-sm">
                      View <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
              
              {app.status === 'pending_payment' && (
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-yellow-700 text-sm">
                  <AlertCircle size={16} />
                  <span>Payment pending. Complete payment to submit your application.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </CustomerLayout>
  )
}
