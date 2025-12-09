import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, CheckCircle, Clock, Loader, Circle, Download, User, Building2, Users, CreditCard, XCircle, ExternalLink, Upload, Play, Award } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const ADMIN_DOC_TYPES = [
  { value: 'cac_certificate', label: 'CAC Certificate' },
  { value: 'tin_certificate', label: 'TIN Certificate' },
  { value: 'status_report', label: 'Status Report' },
  { value: 'business_name_certificate', label: 'Business Name Certificate' },
  { value: 'memorandum', label: 'Memorandum & Articles' },
  { value: 'other', label: 'Other Document' },
]

export default function AdminApplicationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadData, setUploadData] = useState({ type: '', name: '', file: null })
  const toast = useToast()

  useEffect(() => {
    fetchApplication()
  }, [id])

  const fetchApplication = async () => {
    try {
      const res = await adminAPI.getApplication(id)
      setApplication(res.data)
    } catch (err) {
      toast.error('Failed to load application')
      navigate('/admin/applications')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setActionLoading('approve')
    try {
      await adminAPI.approveApplication(id)
      toast.success('Application approved and moved to processing')
      fetchApplication()
    } catch (err) {
      toast.error('Failed to approve application')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return
    setActionLoading('reject')
    try {
      await adminAPI.rejectApplication(id, reason)
      toast.success('Application rejected')
      fetchApplication()
    } catch (err) {
      toast.error('Failed to reject application')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateMilestone = async (milestoneId) => {
    setActionLoading(`milestone-${milestoneId}`)
    try {
      await adminAPI.updateMilestone(id, milestoneId)
      toast.success('Milestone updated')
      fetchApplication()
    } catch (err) {
      toast.error('Failed to update milestone')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCompleteApplication = async () => {
    if (!confirm('Mark this application as completed?')) return
    setActionLoading('complete')
    try {
      await adminAPI.completeApplication(id)
      toast.success('Application marked as completed')
      fetchApplication()
    } catch (err) {
      toast.error('Failed to complete application')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUploadDocument = async (e) => {
    e.preventDefault()
    if (!uploadData.type || !uploadData.file) {
      toast.error('Please select a document type and file')
      return
    }

    setUploadLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadData.file)
      formData.append('type', uploadData.type)
      if (uploadData.name) formData.append('name', uploadData.name)

      await adminAPI.uploadDocumentForCustomer(id, formData)
      toast.success('Document uploaded successfully')
      setShowUploadForm(false)
      setUploadData({ type: '', name: '', file: null })
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchApplication()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload document')
    } finally {
      setUploadLoading(false)
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

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-NG', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
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

  if (!application) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-text-muted">Application not found</p>
          <Link to="/admin/applications" className="btn btn-primary mt-4">Back to Applications</Link>
        </div>
      </AdminLayout>
    )
  }

  const details = application.details || {}
  const applicant = details.applicant || {}
  const partners = details.partners || []

  return (
    <AdminLayout>
      <Link to="/admin/applications" className="inline-flex items-center gap-2 text-text-muted hover:text-text mb-6">
        <ArrowLeft size={18} /> Back to Applications
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-text">{application.company_name}</h1>
                <p className="text-text-muted">{application.service?.name}</p>
              </div>
              <span className={getStatusBadge(application.status)}>
                {getStatusLabel(application.status)}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-text-muted">Business Type</p>
                <p className="font-medium text-text">{application.business_type || '-'}</p>
              </div>
              <div>
                <p className="text-text-muted">Created</p>
                <p className="font-medium text-text">{formatDate(application.created_at)}</p>
              </div>
              <div>
                <p className="text-text-muted">Amount</p>
                <p className="font-medium text-text">{formatPrice(application.service?.price)}</p>
              </div>
              <div>
                <p className="text-text-muted">Submitted</p>
                <p className="font-medium text-text">{formatDate(application.submitted_at)}</p>
              </div>
            </div>
          </div>

          {/* Applicant Details */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-primary-600" />
              <h2 className="text-lg font-semibold text-text">Applicant Details</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted">Full Name</p>
                <p className="font-medium text-text">{applicant.full_name || '-'}</p>
              </div>
              <div>
                <p className="text-text-muted">Email</p>
                <p className="font-medium text-text">{applicant.email || application.user?.email || '-'}</p>
              </div>
              <div>
                <p className="text-text-muted">Phone</p>
                <p className="font-medium text-text">{applicant.phone || '-'}</p>
              </div>
              <div>
                <p className="text-text-muted">Gender</p>
                <p className="font-medium text-text">{applicant.gender || '-'}</p>
              </div>
              <div>
                <p className="text-text-muted">Date of Birth</p>
                <p className="font-medium text-text">{applicant.dob || '-'}</p>
              </div>
              <div>
                <p className="text-text-muted">NIN</p>
                <p className="font-medium text-text font-mono">{applicant.nin || '-'}</p>
              </div>
              <div>
                <p className="text-text-muted">Occupation</p>
                <p className="font-medium text-text">{applicant.occupation || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-text-muted">Residential Address</p>
                <p className="font-medium text-text">{applicant.residential_address || '-'}</p>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={20} className="text-primary-600" />
              <h2 className="text-lg font-semibold text-text">Business Details</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted">Business Name (Option 1)</p>
                <p className="font-medium text-text">{application.company_name}</p>
              </div>
              <div>
                <p className="text-text-muted">Business Name (Option 2)</p>
                <p className="font-medium text-text">{details.company_name_option2 || '-'}</p>
              </div>
              <div>
                <p className="text-text-muted">Business Type</p>
                <p className="font-medium text-text">{application.business_type}</p>
              </div>
              <div>
                <p className="text-text-muted">Nature of Business</p>
                <p className="font-medium text-text">{details.nature_of_business || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-text-muted">Business Address</p>
                <p className="font-medium text-text">{details.business_address || applicant.residential_address || '-'}</p>
              </div>
            </div>
          </div>

          {/* Partners (if Partnership) */}
          {partners.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Users size={20} className="text-blue-600" />
                <h2 className="text-lg font-semibold text-text">Partners ({partners.length})</h2>
              </div>
              <div className="space-y-4">
                {partners.map((partner, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-text mb-3">Partner {idx + 1}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-text-muted">Full Name</p>
                        <p className="font-medium text-text">{partner.full_name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Email</p>
                        <p className="font-medium text-text">{partner.email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Phone</p>
                        <p className="font-medium text-text">{partner.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">NIN</p>
                        <p className="font-medium text-text font-mono">{partner.nin || '-'}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Share %</p>
                        <p className="font-medium text-text">{partner.share_percentage || '-'}%</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Address</p>
                        <p className="font-medium text-text">{partner.residential_address || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-primary-600" />
                <h2 className="text-lg font-semibold text-text">Documents</h2>
              </div>
              {['processing', 'completed'].includes(application.status) && (
                <button 
                  onClick={() => setShowUploadForm(!showUploadForm)}
                  className="btn btn-sm btn-primary"
                >
                  <Upload size={16} /> Upload for Customer
                </button>
              )}
            </div>

            {/* Admin Upload Form */}
            {showUploadForm && (
              <form onSubmit={handleUploadDocument} className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-700 mb-3">Upload Document for Customer</h3>
                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div className="form-group mb-0">
                    <label className="form-label text-sm">Document Type *</label>
                    <select 
                      className="form-input form-select"
                      value={uploadData.type}
                      onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                    >
                      <option value="">Select type</option>
                      {ADMIN_DOC_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label text-sm">Custom Name (Optional)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. CAC Certificate - ABC Ltd"
                      value={uploadData.name}
                      onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group mb-3">
                  <label className="form-label text-sm">File *</label>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="form-input"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary btn-sm" disabled={uploadLoading}>
                    {uploadLoading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
                    {uploadLoading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button type="button" onClick={() => setShowUploadForm(false)} className="btn btn-outline btn-sm">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {application.documents && application.documents.length > 0 ? (
              <div className="space-y-3">
                {application.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className={doc.uploaded_by_admin ? 'text-blue-600' : 'text-primary-600'} />
                      <div>
                        <p className="font-medium text-text">
                          {doc.name || doc.type}
                          {doc.uploaded_by_admin && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Admin Upload</span>}
                        </p>
                        <p className="text-xs text-text-muted">{doc.file_name} • {formatDate(doc.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${doc.status === 'approved' ? 'badge-success' : doc.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {doc.status}
                      </span>
                      {doc.url && (
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline"
                          title="View Document"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-sm">No documents uploaded yet.</p>
            )}

            {/* Applicant Documents from details */}
            {(applicant.nin_doc || applicant.signature_doc || applicant.photo_doc) && (
              <div className="mt-4 pt-4 border-t border-border">
                <h3 className="font-medium text-text mb-3">Applicant Documents (from application)</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                    {applicant.nin_doc && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-700">NIN Document</p>
                        <p className="text-xs text-green-600">✓ Uploaded</p>
                        {applicant.nin_doc.url && (
                          <a href={applicant.nin_doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-700 underline">View</a>
                        )}
                      </div>
                    )}
                    {applicant.signature_doc && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-700">Signature</p>
                        <p className="text-xs text-green-600">✓ Uploaded</p>
                        {applicant.signature_doc.url && (
                          <a href={applicant.signature_doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-700 underline">View</a>
                        )}
                      </div>
                    )}
                    {applicant.photo_doc && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-700">Passport Photo</p>
                        <p className="text-xs text-green-600">✓ Uploaded</p>
                        {applicant.photo_doc.url && (
                          <a href={applicant.photo_doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-700 underline">View</a>
                        )}
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* Progress Timeline with Update Controls */}
          {application.milestones && application.milestones.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text">Processing Progress</h2>
                {application.status === 'processing' && (
                  <button 
                    onClick={handleCompleteApplication}
                    className="btn btn-sm btn-primary"
                    disabled={actionLoading === 'complete'}
                  >
                    {actionLoading === 'complete' ? <Loader size={16} className="animate-spin" /> : <Award size={16} />}
                    Mark Complete
                  </button>
                )}
              </div>
              <div className="relative">
                {application.milestones.map((milestone, idx) => (
                  <div key={milestone.id} className="flex gap-4 pb-6 last:pb-0">
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
                    <div className="pt-1 pb-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
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
                        {milestone.status === 'in_progress' && application.status === 'processing' && (
                          <button 
                            onClick={() => handleUpdateMilestone(milestone.id)}
                            className="btn btn-sm btn-outline text-green-600 hover:bg-green-50"
                            disabled={actionLoading === `milestone-${milestone.id}`}
                            title="Mark as complete"
                          >
                            {actionLoading === `milestone-${milestone.id}` ? (
                              <Loader size={16} className="animate-spin" />
                            ) : (
                              <><CheckCircle size={16} /> Complete</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Customer</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                {application.user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-text">{application.user?.name}</p>
                <p className="text-sm text-text-muted">{application.user?.email}</p>
              </div>
            </div>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted">Phone</span>
                <span className="text-text">{application.user?.phone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Registered</span>
                <span className="text-text">{formatDate(application.user?.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {application.payments && application.payments.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={20} className="text-primary-600" />
                <h2 className="text-lg font-semibold text-text">Payment</h2>
              </div>
              {application.payments.map((payment) => (
                <div key={payment.id} className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Amount</span>
                    <span className="font-bold text-text">{formatPrice(payment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Reference</span>
                    <span className="text-text font-mono text-xs">{payment.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Gateway</span>
                    <span className="text-text capitalize">{payment.gateway}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Status</span>
                    <span className={`badge ${payment.status === 'success' ? 'badge-success' : 'badge-warning'}`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Paid At</span>
                    <span className="text-text">{formatDate(payment.paid_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Actions</h2>
            <div className="space-y-2">
              {application.status === 'pending' && (
                <>
                  <button 
                    onClick={handleApprove} 
                    className="btn btn-primary w-full"
                    disabled={actionLoading}
                  >
                    {actionLoading === 'approve' ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Approve Application
                  </button>
                  <button 
                    onClick={handleReject} 
                    className="btn btn-outline w-full text-red-600 hover:bg-red-50 hover:border-red-300"
                    disabled={actionLoading}
                  >
                    {actionLoading === 'reject' ? <Loader size={16} className="animate-spin" /> : <XCircle size={16} />}
                    Reject Application
                  </button>
                </>
              )}
              {application.status === 'rejected' && application.admin_notes && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-700">Rejection Reason:</p>
                  <p className="text-sm text-red-600">{application.admin_notes}</p>
                </div>
              )}
              {application.status === 'completed' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                  <Award size={24} className="mx-auto text-green-600 mb-2" />
                  <p className="text-sm font-medium text-green-700">Application Completed</p>
                  <p className="text-xs text-green-600">{formatDate(application.completed_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
