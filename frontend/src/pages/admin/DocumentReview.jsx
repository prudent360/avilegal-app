import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { FileText, Search, Loader, CheckCircle, XCircle, Eye, User, ChevronDown, ChevronUp, X } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'

export default function DocumentReview() {
  const toast = useToast()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [statusFilter, setStatusFilter] = useState('pending')

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

  // Group documents by user
  const groupedByUser = documents.reduce((acc, doc) => {
    if (!doc.user) return acc
    const userId = doc.user.id
    if (!acc[userId]) {
      acc[userId] = {
        user: doc.user,
        documents: [],
        pendingCount: 0
      }
    }
    acc[userId].documents.push(doc)
    if (doc.status === 'pending') {
      acc[userId].pendingCount++
    }
    return acc
  }, {})

  // Convert to array and filter based on search
  const users = Object.values(groupedByUser).filter(({ user }) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return user.name?.toLowerCase().includes(searchLower) ||
           user.email?.toLowerCase().includes(searchLower)
  })

  // Sort users with pending documents first
  users.sort((a, b) => b.pendingCount - a.pendingCount)

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

  // Get filtered documents for selected user
  const getFilteredDocs = (userDocs) => {
    if (statusFilter === 'all') return userDocs
    return userDocs.filter(doc => doc.status === statusFilter)
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
          <h1 className="text-2xl font-bold text-text mb-1">Document Review</h1>
          <p className="text-text-muted">Search for users and review their documents.</p>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            className="form-input pl-10" 
            placeholder="Search users by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
              Users ({users.length})
            </h2>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {users.length > 0 ? users.map(({ user, pendingCount, documents: userDocs }) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : { ...user, documents: userDocs })}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${
                    selectedUser?.id === user.id 
                      ? 'bg-primary-50 border-2 border-primary-500' 
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text truncate">{user.name}</p>
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>
                  {pendingCount > 0 && (
                    <span className="badge badge-warning">{pendingCount}</span>
                  )}
                </button>
              )) : (
                <p className="text-sm text-text-muted text-center py-4">No users found</p>
              )}
            </div>
          </div>
        </div>

        {/* Documents Panel */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User size={24} className="text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-text">{selectedUser.name}</h2>
                    <p className="text-sm text-text-muted">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="form-input form-select text-sm py-1.5"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button onClick={() => setSelectedUser(null)} className="text-text-muted hover:text-text p-1">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {getFilteredDocs(selectedUser.documents).length > 0 ? (
                  getFilteredDocs(selectedUser.documents).map((doc) => (
                    <div key={doc.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <FileText size={20} className="text-primary-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-text">{doc.name || doc.type}</p>
                            <p className="text-xs text-text-muted">{formatDate(doc.created_at)}</p>
                          </div>
                        </div>
                        <span className={getStatusBadge(doc.status)}>{doc.status}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        {doc.url && (
                          <a 
                            href={`${API_URL}${doc.url}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline"
                          >
                            <Eye size={14} /> View Document
                          </a>
                        )}
                        {doc.status === 'pending' && (
                          <div className="flex gap-2 ml-auto">
                            <button 
                              onClick={() => handleApprove(doc.id)}
                              className="btn btn-sm btn-primary"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button 
                              onClick={() => handleReject(doc.id)}
                              className="btn btn-sm btn-outline text-red-600 hover:bg-red-50"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText size={32} className="text-text-muted mx-auto mb-2" />
                    <p className="text-text-muted">No {statusFilter !== 'all' ? statusFilter : ''} documents</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card text-center py-16">
              <User size={48} className="text-text-muted mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-text mb-2">Select a User</h2>
              <p className="text-text-muted">Click on a user from the list to view and review their documents.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
