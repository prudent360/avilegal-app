import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { Briefcase, Plus, Loader, Edit2, Trash2, X, Check } from 'lucide-react'

export default function Services() {
  const toast = useToast()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', price: '', processing_time: '', is_active: true
  })

  useEffect(() => { fetchServices() }, [])

  const fetchServices = async () => {
    try {
      const res = await adminAPI.getServices()
      setServices(res.data || [])
    } catch (err) {
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', price: '', processing_time: '', is_active: true })
    setEditing(null)
    setShowForm(false)
  }

  const handleEdit = (service) => {
    setFormData({
      name: service.name,
      slug: service.slug,
      description: service.description || '',
      price: service.price,
      processing_time: service.processing_time || '',
      is_active: service.is_active
    })
    setEditing(service.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.price) {
      toast.error('Name and price are required')
      return
    }
    
    setSaving(true)
    try {
      if (editing) {
        await adminAPI.updateService(editing, formData)
        toast.success('Service updated')
      } else {
        await adminAPI.createService(formData)
        toast.success('Service created')
      }
      resetForm()
      fetchServices()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return
    try {
      await adminAPI.deleteService(id)
      toast.success('Service deleted')
      fetchServices()
    } catch (err) {
      toast.error('Failed to delete service')
    }
  }

  const formatPrice = (price) => {
    if (!price) return '₦0'
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)
  }

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
          <h1 className="text-2xl font-bold text-text mb-1">Services</h1>
          <p className="text-text-muted">Manage your business registration services.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn btn-primary">
          <Plus size={18} /> Add Service
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">{editing ? 'Edit Service' : 'New Service'}</h2>
            <button onClick={resetForm} className="text-text-muted hover:text-text"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input type="text" className="form-input" placeholder="e.g. Business Name Registration" 
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Slug</label>
                <input type="text" className="form-input" placeholder="business-name" 
                  value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Price (₦) *</label>
                <input type="number" className="form-input" placeholder="50000" 
                  value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Processing Time</label>
                <input type="text" className="form-input" placeholder="e.g. 5-7 business days" 
                  value={formData.processing_time} onChange={(e) => setFormData({ ...formData, processing_time: e.target.value })} />
              </div>
              <div className="form-group sm:col-span-2">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} placeholder="Service description..."
                  value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_active} 
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary-600" />
                  <span className="text-sm text-text">Service is active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                {editing ? 'Update' : 'Create'} Service
              </button>
              <button type="button" onClick={resetForm} className="btn btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      {services.length > 0 ? (
        <div className="grid gap-4">
          {services.map((service) => (
            <div key={service.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${service.is_active ? 'bg-primary-100' : 'bg-gray-100'}`}>
                    <Briefcase size={24} className={service.is_active ? 'text-primary-600' : 'text-gray-400'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text">{service.name}</h3>
                      {!service.is_active && <span className="badge badge-warning">Inactive</span>}
                    </div>
                    <p className="text-sm text-text-muted">{service.description || 'No description'}</p>
                    <p className="text-xs text-text-muted mt-1">Slug: {service.slug} • {service.processing_time || 'N/A'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-600">{formatPrice(service.price)}</p>
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => handleEdit(service)} className="btn btn-sm btn-outline">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(service.id)} className="btn btn-sm btn-outline text-red-600 hover:bg-red-50">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Briefcase size={48} className="text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text mb-2">No Services</h2>
          <p className="text-text-muted mb-4">Add your first service to get started.</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={18} /> Add Service</button>
        </div>
      )}
    </AdminLayout>
  )
}
