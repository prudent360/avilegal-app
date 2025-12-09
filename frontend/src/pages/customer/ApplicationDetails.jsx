import CustomerLayout from '../../components/layouts/CustomerLayout'
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, CheckCircle, Clock, Loader, Circle, Download, Pencil } from 'lucide-react'
import { applicationAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function ApplicationDetails() {
  const { id } = useParams()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await applicationAPI.getOne(id)
        setApplication(res.data)
      } catch (err) {
        toast.error('Failed to load application')
      } finally {
        setLoading(false)
      }
    }
    fetchApplication()
  }, [id])

  const getStatusBadge = (status) => {
    const badges = {
      pending_payment: 'badge badge-warning',
      pending: 'badge badge-warning',
      processing: 'badge badge-info',
      completed: 'badge badge-success',
      rejected: 'badge badge-danger',
    }
    return badges[status] || 'badge'
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-NG', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)
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

  if (!application) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <p className="text-text-muted">Application not found</p>
          <Link to="/applications" className="btn btn-primary mt-4">Back to Applications</Link>
        </div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <Link to="/applications" className="inline-flex items-center gap-2 text-text-muted hover:text-text mb-6">
        <ArrowLeft size={18} /> Back to Applications
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-text">{application.company_name}</h1>
                <p className="text-text-muted">{application.service?.name}</p>
              </div>
              <span className={getStatusBadge(application.status)}>
                {application.status?.replace('_', ' ')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted">Business Type</p>
                <p className="font-medium text-text">{application.business_type || '-'}</p>
              </div>
              <div>
                <p className="text-text-muted">Submitted</p>
                <p className="font-medium text-text">{formatDate(application.submitted_at)}</p>
              </div>
              <div>
                <p className="text-text-muted">Amount Paid</p>
                <p className="font-medium text-text">{formatPrice(application.service?.price)}</p>
              </div>
              <div>
                <p className="text-text-muted">Status</p>
                <p className="font-medium text-text capitalize">{application.status?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          {application.milestones && application.milestones.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-text mb-6">Application Progress</h2>
              <div className="relative">
                {application.milestones.map((milestone, idx) => (
                  <div key={milestone.id} className="flex gap-4 pb-6 last:pb-0">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        milestone.status === 'completed' ? 'bg-green-100 text-green-600' :
                        milestone.status === 'in_progress' ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-500' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {milestone.status === 'completed' ? <CheckCircle size={18} /> :
                         milestone.status === 'in_progress' ? <Loader size={18} className="animate-spin" /> :
                         <Circle size={18} />}
                      </div>
                      {idx < application.milestones.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-2 ${
                          milestone.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pt-1 pb-4">
                      <h3 className={`font-medium ${
                        milestone.status === 'completed' ? 'text-green-700' :
                        milestone.status === 'in_progress' ? 'text-primary-600' :
                        'text-gray-500'
                      }`}>{milestone.title}</h3>
                      <p className="text-sm text-text-muted">{milestone.description}</p>
                      {milestone.completed_at && (
                        <p className="text-xs text-text-muted mt-1">Completed: {formatDate(milestone.completed_at)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {application.documents && application.documents.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-text mb-4">Documents</h2>
              <div className="space-y-2">
                {application.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-primary-600" />
                      <div>
                        <p className="font-medium text-text">{doc.name}</p>
                        <p className="text-xs text-text-muted">{doc.file_name}</p>
                      </div>
                    </div>
                    <span className={`badge ${doc.status === 'approved' ? 'badge-success' : doc.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Info */}
          {application.payments && application.payments.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-text mb-4">Payment</h2>
              {application.payments.map((payment) => (
                <div key={payment.id} className="text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-text-muted">Amount</span>
                    <span className="font-bold text-text">{formatPrice(payment.amount)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-text-muted">Reference</span>
                    <span className="text-text font-mono text-xs">{payment.reference}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-text-muted">Gateway</span>
                    <span className="text-text capitalize">{payment.gateway}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Status</span>
                    <span className={`badge ${payment.status === 'success' ? 'badge-success' : 'badge-warning'}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Actions</h2>
            <div className="space-y-2">
              {application.status === 'pending_payment' && (
                <Link to={`/applications/${application.id}/edit`} className="btn btn-outline w-full">Edit Application</Link>
              )}
            </div>
          </div>

          {/* Downloadable Documents from Admin */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Your Documents</h2>
            {application.documents && application.documents.filter(d => d.uploaded_by_admin).length > 0 ? (
              <div className="space-y-2">
                {application.documents.filter(d => d.uploaded_by_admin).map((doc) => (
                  <a 
                    key={doc.id}
                    href={`http://localhost:8000${doc.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
                  >
                    <Download size={18} className="text-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-green-700 truncate">{doc.name || doc.type}</p>
                      <p className="text-xs text-green-600">{doc.file_name}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Download size={24} className="mx-auto text-text-muted mb-2" />
                <p className="text-sm text-text-muted">
                  {application.status === 'completed' 
                    ? 'Documents will appear here once uploaded by admin.'
                    : 'Your certificates and documents will appear here once your application is processed.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
