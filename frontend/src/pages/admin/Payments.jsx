import AdminLayout from '../../components/layouts/AdminLayout'
import { CreditCard, Search, Download } from 'lucide-react'

export default function Payments() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text mb-1">Payments</h1>
          <p className="text-text-muted">View all payment transactions.</p>
        </div>
        <button className="btn btn-outline"><Download size={18} /> Export CSV</button>
      </div>

      <div className="card mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" className="form-input pl-10" placeholder="Search payments..." />
          </div>
          <select className="form-input form-select w-40">
            <option>All Status</option>
            <option>Successful</option>
            <option>Pending</option>
            <option>Failed</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="text-center text-text-muted py-8">No payments found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
