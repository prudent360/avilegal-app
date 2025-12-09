import AdminLayout from '../../components/layouts/AdminLayout'
import { Shield, Plus, Users, Edit, Trash2, X, Loader, Lock, UserPlus, Mail, Phone } from 'lucide-react'
import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function Roles() {
  const [roles, setRoles] = useState([])
  const [staff, setStaff] = useState([])
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading] = useState(true)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [roleFormData, setRoleFormData] = useState({ name: '', display_name: '', description: '', permissions: [] })
  const [staffFormData, setStaffFormData] = useState({ name: '', email: '', phone: '', password: '', role_id: '' })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('roles')
  const toast = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes, staffRes] = await Promise.all([
        adminAPI.getRoles(),
        adminAPI.getPermissions(),
        adminAPI.getStaff()
      ])
      setRoles(rolesRes.data)
      setPermissions(permsRes.data)
      setStaff(staffRes.data)
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Role functions
  const openCreateRoleModal = () => {
    setEditingRole(null)
    setRoleFormData({ name: '', display_name: '', description: '', permissions: [] })
    setShowRoleModal(true)
  }

  const openEditRoleModal = (role) => {
    setEditingRole(role)
    setRoleFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description || '',
      permissions: role.permissions?.map(p => p.id) || []
    })
    setShowRoleModal(true)
  }

  const togglePermission = (permId) => {
    setRoleFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(id => id !== permId)
        : [...prev.permissions, permId]
    }))
  }

  const handleRoleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingRole) {
        await adminAPI.updateRole(editingRole.id, roleFormData)
        toast.success('Role updated successfully')
      } else {
        await adminAPI.createRole(roleFormData)
        toast.success('Role created successfully')
      }
      setShowRoleModal(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async (role) => {
    if (role.is_system) {
      toast.error('Cannot delete system role')
      return
    }
    if (!confirm(`Delete role "${role.display_name}"?`)) return
    try {
      await adminAPI.deleteRole(role.id)
      toast.success('Role deleted')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete role')
    }
  }

  // Staff functions
  const openAddStaffModal = () => {
    setStaffFormData({ name: '', email: '', phone: '', password: '', role_id: '' })
    setShowStaffModal(true)
  }

  const handleStaffSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminAPI.createStaff(staffFormData)
      toast.success('Staff member added successfully')
      setShowStaffModal(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add staff')
    } finally {
      setSaving(false)
    }
  }

  const staffRoles = roles.filter(r => r.name !== 'customer')

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
          <h1 className="text-2xl font-bold text-text mb-1">Roles & Staff Management</h1>
          <p className="text-text-muted">Manage roles, permissions, and staff members.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'roles' ? 'bg-primary-600 text-white' : 'bg-surface border border-border text-text hover:bg-gray-50'}`}
        >
          <Shield size={18} className="inline mr-2" />Roles
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'staff' ? 'bg-primary-600 text-white' : 'bg-surface border border-border text-text hover:bg-gray-50'}`}
        >
          <Users size={18} className="inline mr-2" />Staff Members
        </button>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={openCreateRoleModal} className="btn btn-primary"><Plus size={18} /> Add Role</button>
          </div>
          <div className="grid gap-4">
            {roles.map((role) => (
              <div key={role.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      role.name === 'super_admin' ? 'bg-red-100 text-red-600' :
                      role.name === 'admin' ? 'bg-purple-100 text-purple-600' :
                      role.name === 'customer' ? 'bg-green-100 text-green-600' :
                      'bg-primary-100 text-primary-600'
                    }`}>
                      {role.is_system ? <Lock size={20} /> : <Shield size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-text">{role.display_name}</h3>
                        {role.is_system && <span className="badge badge-secondary text-xs">System</span>}
                      </div>
                      <p className="text-sm text-text-muted">{role.description}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {role.permissions?.slice(0, 4).map(p => (
                          <span key={p.id} className="badge badge-outline text-xs">{p.display_name}</span>
                        ))}
                        {role.permissions?.length > 4 && (
                          <span className="badge badge-outline text-xs">+{role.permissions.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right mr-4">
                      <p className="font-semibold text-text">{role.users_count || 0}</p>
                      <p className="text-xs text-text-muted">users</p>
                    </div>
                    <button onClick={() => openEditRoleModal(role)} className="btn btn-outline btn-sm">
                      <Edit size={16} />
                    </button>
                    {!role.is_system && (
                      <button onClick={() => handleDeleteRole(role)} className="btn btn-outline btn-sm text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={openAddStaffModal} className="btn btn-primary"><UserPlus size={18} /> Add Staff</button>
          </div>
          {staff.length === 0 ? (
            <div className="card text-center py-12">
              <Users size={48} className="text-text-muted mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-text mb-2">No Staff Members</h2>
              <p className="text-text-muted mb-4">Add staff members to help manage the platform.</p>
              <button onClick={openAddStaffModal} className="btn btn-primary">Add First Staff</button>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-muted">Name</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-muted">Email</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-muted">Role</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-muted">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {staff.map((member) => (
                    <tr key={member.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                            {member.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="font-medium text-text">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-muted">{member.email}</td>
                      <td className="px-4 py-3">
                        {member.roles?.map(r => (
                          <span key={r.id} className={`badge ${
                            r.name === 'super_admin' ? 'badge-danger' :
                            r.name === 'admin' ? 'badge-info' :
                            'badge-secondary'
                          }`}>{r.display_name}</span>
                        ))}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${member.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-text">{editingRole ? 'Edit Role' : 'Create Role'}</h2>
              <button onClick={() => setShowRoleModal(false)} className="text-text-muted hover:text-text"><X size={24} /></button>
            </div>
            <form onSubmit={handleRoleSubmit} className="p-6">
              <div className="grid gap-4 mb-6">
                <div className="form-group">
                  <label className="form-label">Role Name (internal)</label>
                  <input type="text" className="form-input" placeholder="e.g. content_editor" value={roleFormData.name} onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })} disabled={editingRole?.is_system} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Display Name</label>
                  <input type="text" className="form-input" placeholder="e.g. Content Editor" value={roleFormData.display_name} onChange={(e) => setRoleFormData({ ...roleFormData, display_name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={2} placeholder="Role description..." value={roleFormData.description} onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })} />
                </div>
              </div>
              <h3 className="font-semibold text-text mb-4">Permissions</h3>
              <div className="space-y-4 mb-6">
                {Object.entries(permissions).map(([group, perms]) => (
                  <div key={group} className="border border-border rounded-lg p-4">
                    <h4 className="font-medium text-text capitalize mb-3">{group}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((perm) => (
                        <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={roleFormData.permissions.includes(perm.id)} onChange={() => togglePermission(perm.id)} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                          <span className="text-sm text-text">{perm.display_name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowRoleModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-text">Add Staff Member</h2>
              <button onClick={() => setShowStaffModal(false)} className="text-text-muted hover:text-text"><X size={24} /></button>
            </div>
            <form onSubmit={handleStaffSubmit} className="p-6">
              <div className="grid gap-4">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" placeholder="John Doe" value={staffFormData.name} onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="john@avilegal.com" value={staffFormData.email} onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-input" placeholder="+234 800 000 0000" value={staffFormData.phone} onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" placeholder="Min 8 characters" value={staffFormData.password} onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })} required minLength={8} />
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Role</label>
                  <select className="form-input form-select" value={staffFormData.role_id} onChange={(e) => setStaffFormData({ ...staffFormData, role_id: e.target.value })} required>
                    <option value="">Select a role</option>
                    {staffRoles.map((role) => (
                      <option key={role.id} value={role.id}>{role.display_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowStaffModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding...' : 'Add Staff'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
