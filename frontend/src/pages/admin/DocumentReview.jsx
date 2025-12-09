import AdminLayout from '../../components/layouts/AdminLayout'
import { Upload, Search } from 'lucide-react'

export default function DocumentReview() {
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
            <input type="text" className="form-input pl-10" placeholder="Search documents..." />
          </div>
          <select className="form-input form-select w-40">
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      <div className="card text-center py-12">
        <Upload size={48} className="text-text-muted mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-text mb-2">No Documents to Review</h2>
        <p className="text-text-muted">Documents pending review will appear here.</p>
      </div>
    </AdminLayout>
  )
}
