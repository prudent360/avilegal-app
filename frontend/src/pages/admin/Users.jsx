import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect } from 'react'
import { Users, Search, Loader, Trash2, Ban, CheckCircle } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const toast = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers()
      setUsers(res.data)
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (user, newStatus) => {
    try {
      await adminAPI.updateUserStatus(user.id, newStatus)
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'}`)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleDelete = async (user) => {
    if (user.roles?.some(r => r.name === 'super_admin')) {
      toast.error('Cannot delete super admin')
      return
    }
    if (!confirm(`Delete user "${user.name}"? This will also delete all their data.`)) return
    try {
      await adminAPI.deleteUser(user.id)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = !search || 
      user.name?.toLowerCase().includes(search.toLowerCase()) || 
      user.email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getRoleBadge = (roles) => {
    if (!roles?.length) return null
    const role = roles[0]
    const colors = {
      super_admin: 'badge-danger',
      admin: 'badge-info',
      manager: 'badge-warning',
      support: 'badge-secondary',
      customer: 'badge-success',
    }
    return <span className={`badge ${colors[role.name] || ''}`}>{role.display_name}</span>
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
          <h1 className="text-2xl font-bold text-text mb-1">Users</h1>
          <p className="text-text-muted">Manage all registered users.</p>
        </div>
        <div className="text-sm text-text-muted">
          Total: <span className="font-semibold text-text">{users.length}</span>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              className="form-input pl-10" 
              placeholder="Search by name or email..." 
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
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-text-muted py-8">No users found.</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="text-text-muted">{user.email}</td>
                  <td className="text-text-muted">{user.phone || '-'}</td>
                  <td>{getRoleBadge(user.roles)}</td>
                  <td>
                    <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {user.status === 'active' ? (
                        <button 
                          onClick={() => handleStatusChange(user, 'suspended')}
                          className="btn btn-outline btn-sm text-orange-600 border-orange-200 hover:bg-orange-50"
                          title="Suspend user"
                        >
                          <Ban size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleStatusChange(user, 'active')}
                          className="btn btn-outline btn-sm text-green-600 border-green-200 hover:bg-green-50"
                          title="Activate user"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {!user.roles?.some(r => r.name === 'super_admin') && (
                        <button 
                          onClick={() => handleDelete(user)}
                          className="btn btn-outline btn-sm text-red-600 border-red-200 hover:bg-red-50"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
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
