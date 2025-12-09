import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { FileText, Search, Loader, CheckCircle, XCircle, ExternalLink, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DocumentReview() {
  const toast = useToast()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const res = await adminAPI.getDocuments()
      setDocuments(res.data || [])
    } catch (err) {
      console.error('Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveDocument(id)
      toast.success('Document approved')
      fetchDocuments()
    } catch (err) {
      toast.error('Failed to approve document')
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return
    try {
      await adminAPI.rejectDocument(id, reason)
      toast.success('Document rejected')
      fetchDocuments()
    } catch (err) {
      toast.error('Failed to reject document')
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStatusBadge = (status) => {
    if (status === 'approved') return 'badge badge-success'
    if (status === 'rejected') return 'badge badge-danger'
    return 'badge badge-warning'
  }

  const filteredDocs = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.status === filter
    const matchesSearch = !search || 
      doc.name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.type?.toLowerCase().includes(search.toLowerCase()) ||
      doc.user?.name?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

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
          <h1 className="text-2xl font-bold text-text mb-1">Document Review</h1>
          <p className="text-text-muted">Review and verify customer documents.</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              className="form-input pl-10" 
              placeholder="Search documents..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="form-input form-select w-40"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredDocs.length > 0 ? (
        <div className="space-y-3">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-text">{doc.name || doc.type}</p>
                    <p className="text-sm text-text-muted">{doc.user?.name} • {doc.file_name}</p>
                    <p className="text-xs text-text-muted mt-1">{formatDate(doc.created_at)}</p>
                  </div>
                </div>
                <span className={getStatusBadge(doc.status)}>{doc.status}</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex gap-2">
                  {doc.url && (
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline"
                    >
                      <Eye size={16} /> View
                    </a>
                  )}
                  {doc.application_id && (
                    <Link to={`/admin/applications/${doc.application_id}`} className="btn btn-sm btn-outline">
                      <ExternalLink size={16} /> Application
                    </Link>
                  )}
                </div>
                {doc.status === 'pending' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApprove(doc.id)}
                      className="btn btn-sm btn-primary"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button 
                      onClick={() => handleReject(doc.id)}
                      className="btn btn-sm btn-outline text-red-600 hover:bg-red-50"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FileText size={48} className="text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text mb-2">No Documents to Review</h2>
          <p className="text-text-muted">Documents pending review will appear here.</p>
        </div>
      )}
    </AdminLayout>
  )
}
