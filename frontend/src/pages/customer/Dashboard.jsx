import CustomerLayout from '../../components/layouts/CustomerLayout'
import { FileText, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const stats = [
    { label: 'Total Applications', value: '3', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { label: 'Pending', value: '1', icon: Clock, color: 'bg-amber-100 text-amber-600' },
    { label: 'Completed', value: '2', icon: CheckCircle, color: 'bg-primary-100 text-primary-600' },
    { label: 'Action Required', value: '0', icon: AlertCircle, color: 'bg-red-100 text-red-600' },
  ]

  return (
    <CustomerLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">Dashboard</h1>
        <p className="text-text-muted">Welcome back! Here's an overview of your applications.</p>
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

      {/* Quick Actions */}
      <div className="summary-card mb-8">
        <h2 className="text-lg font-semibold mb-2">Start a New Application</h2>
        <p className="text-primary-100 mb-4">Register your business with CAC, get a trademark, or apply for other legal services.</p>
        <Link to="/applications/new" className="inline-flex items-center gap-2 bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50">
          New Application <ArrowRight size={16} />
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold text-text mb-4">Recent Applications</h2>
        <p className="text-text-muted text-sm">No applications yet. Start your first registration!</p>
      </div>
    </CustomerLayout>
  )
}
