import CustomerLayout from '../../components/layouts/CustomerLayout'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

export default function ApplicationDetails() {
  const { id } = useParams()

  return (
    <CustomerLayout>
      <Link to="/applications" className="inline-flex items-center gap-2 text-text-muted hover:text-text mb-6">
        <ArrowLeft size={18} /> Back to Applications
      </Link>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <FileText size={24} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Application #{id}</h1>
            <p className="text-text-muted">Company Registration</p>
          </div>
          <span className="ml-auto badge badge-warning">Pending</span>
        </div>

        <div className="border-t border-border pt-6">
          <p className="text-text-muted">Application details will be displayed here.</p>
        </div>
      </div>
    </CustomerLayout>
  )
}
