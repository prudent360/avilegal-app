import CustomerLayout from '../../components/layouts/CustomerLayout'
import { Link } from 'react-router-dom'
import { Plus, FileText, Clock, CheckCircle, XCircle, ArrowRight, Loader } from 'lucide-react'
import { useState, useEffect } from 'react'
import { applicationAPI } from '../../services/api'

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await applicationAPI.getAll()
        setApplications(res.data)
      } catch (err) {
        setError('Failed to load applications')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [])

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge badge-warning',
      processing: 'badge badge-info',
      completed: 'badge badge-success',
      rejected: 'badge badge-danger',
    }
    return badges[status] || 'badge'
  }

  const getStatusIcon = (status) => {
    const icons = {
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
            <div key={app.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                  {getStatusIcon(app.status)}
                </div>
                <div>
                  <h3 className="font-semibold text-text">{app.company_name}</h3>
                  <p className="text-sm text-text-muted">{app.service?.name || 'Business Registration'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={getStatusBadge(app.status)}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
                <Link to={`/applications/${app.id}`} className="btn btn-outline btn-sm">
                  View <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </CustomerLayout>
  )
}
