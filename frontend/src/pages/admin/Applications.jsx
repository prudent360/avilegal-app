import AdminLayout from '../../components/layouts/AdminLayout'
import { FileText, Search } from 'lucide-react'

export default function AdminApplications() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text mb-1">Applications</h1>
          <p className="text-text-muted">Review and manage registration applications.</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" className="form-input pl-10" placeholder="Search applications..." />
          </div>
          <select className="form-input form-select w-40">
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="text-center text-text-muted py-8">No applications found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
