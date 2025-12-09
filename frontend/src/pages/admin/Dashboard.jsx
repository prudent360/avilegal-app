import AdminLayout from '../../components/layouts/AdminLayout'
import { Users, FileText, CreditCard, CheckCircle } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { label: 'Total Users', value: '156', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Applications', value: '89', icon: FileText, color: 'bg-amber-100 text-amber-600' },
    { label: 'Revenue', value: '₦2.4M', icon: CreditCard, color: 'bg-primary-100 text-primary-600' },
    { label: 'Completed', value: '67', icon: CheckCircle, color: 'bg-green-100 text-green-600' },
  ]

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">Admin Dashboard</h1>
        <p className="text-text-muted">Welcome back! Here's an overview of the platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-text">{value}</p>
            <p className="text-sm text-text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Recent Applications</h2>
          <p className="text-text-muted text-sm">No pending applications.</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Recent Payments</h2>
          <p className="text-text-muted text-sm">No recent payments.</p>
        </div>
      </div>
    </AdminLayout>
  )
}
