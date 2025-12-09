import CustomerLayout from '../../components/layouts/CustomerLayout'
import { useState, useEffect, useRef } from 'react'
import { Upload, FileText, Trash2, CheckCircle, XCircle, Loader, Pen, X } from 'lucide-react'
import { documentAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [documentTypes, setDocumentTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const toast = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [docsRes, typesRes] = await Promise.all([
        documentAPI.getAll(),
        documentAPI.getTypes()
      ])
      setDocuments(docsRes.data)
      setDocumentTypes(typesRes.data)
    } catch (err) {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    setUploading(true)
    try {
      await documentAPI.upload(formData)
      toast.success('Document uploaded successfully')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return
    try {
      await documentAPI.delete(id)
      toast.success('Document deleted')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const getDocumentByType = (type) => documents.find(d => d.type === type)

  // Signature canvas functions
  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
  }

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches[0].clientX) - rect.left
    const y = (e.clientY || e.touches[0].clientY) - rect.top
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches[0].clientX) - rect.left
    const y = (e.clientY || e.touches[0].clientY) - rect.top
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => setIsDrawing(false)

  const clearCanvas = () => initCanvas()

  const saveSignature = async () => {
    const canvas = canvasRef.current
    const signature = canvas.toDataURL('image/png')
    
    setUploading(true)
    try {
      await documentAPI.uploadSignature(signature, null)
      toast.success('Signature saved successfully')
      setShowSignatureModal(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save signature')
    } finally {
      setUploading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'badge badge-warning',
      approved: 'badge badge-success',
      rejected: 'badge badge-danger',
    }
    return styles[status] || 'badge'
  }

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center py-20">
          <Loader size={32} className="animate-spin text-primary-600" />
        </div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">My Documents</h1>
        <p className="text-text-muted">Upload required documents for your business registration.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {documentTypes.map((type) => {
          const doc = getDocumentByType(type.id)
          return (
            <div key={type.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-text">{type.name}</h3>
                  <p className="text-sm text-text-muted">{type.description}</p>
                </div>
                {doc && <span className={getStatusBadge(doc.status)}>{doc.status}</span>}
              </div>

              {doc ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {doc.type === 'signature' ? (
                      <img src={doc.url} alt="Signature" className="h-10 border rounded" />
                    ) : (
                      <FileText size={24} className="text-primary-600" />
                    )}
                    <span className="text-sm truncate max-w-[150px]">{doc.file_name}</span>
                  </div>
                  <div className="flex gap-2">
                    {doc.status === 'approved' ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : doc.status === 'rejected' ? (
                      <div className="flex items-center gap-2">
                        <XCircle size={20} className="text-red-600" />
                        <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                type.id === 'signature' ? (
                  <button
                    onClick={() => { setShowSignatureModal(true); setTimeout(initCanvas, 100) }}
                    className="w-full p-6 border-2 border-dashed border-border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition flex flex-col items-center gap-2"
                  >
                    <Pen size={24} className="text-text-muted" />
                    <span className="text-sm text-text-muted">Draw your signature</span>
                  </button>
                ) : (
                  <label className="w-full p-6 border-2 border-dashed border-border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition flex flex-col items-center gap-2 cursor-pointer">
                    <Upload size={24} className="text-text-muted" />
                    <span className="text-sm text-text-muted">Click to upload</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileSelect(e, type.id)}
                      disabled={uploading}
                    />
                  </label>
                )
              )}

              {doc?.status === 'rejected' && doc.rejection_reason && (
                <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-700">
                  Reason: {doc.rejection_reason}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {uploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl flex items-center gap-4">
            <Loader size={24} className="animate-spin text-primary-600" />
            <span>Uploading...</span>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-bold text-text">Draw Your Signature</h2>
              <button onClick={() => setShowSignatureModal(false)} className="text-text-muted hover:text-text">
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <canvas
                ref={canvasRef}
                width={350}
                height={150}
                className="border border-border rounded-lg w-full touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div className="flex gap-3 mt-4">
                <button onClick={clearCanvas} className="btn btn-outline flex-1">Clear</button>
                <button onClick={saveSignature} className="btn btn-primary flex-1" disabled={uploading}>
                  {uploading ? 'Saving...' : 'Save Signature'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  )
}
