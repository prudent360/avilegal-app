import AdminLayout from '../../components/layouts/AdminLayout'
import { Users, Search } from 'lucide-react'

export default function AdminUsers() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text mb-1">Users</h1>
          <p className="text-text-muted">Manage all registered users.</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" className="form-input pl-10" placeholder="Search users..." />
          </div>
          <select className="form-input form-select w-40">
            <option>All Status</option>
            <option>Active</option>
            <option>Suspended</option>
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
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="text-center text-text-muted py-8">No users found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
