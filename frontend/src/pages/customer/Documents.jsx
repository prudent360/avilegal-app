import CustomerLayout from '../../components/layouts/CustomerLayout'
import { Upload, FileText, CheckCircle, Clock, X } from 'lucide-react'

export default function Documents() {
  return (
    <CustomerLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">Documents</h1>
        <p className="text-text-muted">Upload and manage your business documents.</p>
      </div>

      <div className="card mb-6">
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <Upload size={48} className="text-text-muted mx-auto mb-4" />
          <h3 className="font-semibold text-text mb-2">Drag & Drop Files Here</h3>
          <p className="text-text-muted text-sm mb-4">or click to browse</p>
          <button className="btn btn-primary">Choose Files</button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-text mb-4">Uploaded Documents</h2>
        <p className="text-text-muted text-sm">No documents uploaded yet.</p>
      </div>
    </CustomerLayout>
  )
}
