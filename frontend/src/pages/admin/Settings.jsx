import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect, useRef } from 'react'
import { useToast } from '../../context/ToastContext'
import { Building2, Loader, Image, Upload, Trash2 } from 'lucide-react'
import { adminAPI } from '../../services/api'

export default function Settings() {
  const toast = useToast()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [settings, setSettings] = useState({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    frontend_url: '',
    company_logo: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await adminAPI.getSettings()
      setSettings(prev => ({
        ...prev,
        ...res.data,
      }))
    } catch (err) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminAPI.updateSettings({ settings })
      toast.success('Settings saved successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)
      const res = await adminAPI.uploadLogo(formData)
      setSettings(prev => ({ ...prev, company_logo: res.data.logo_url }))
      toast.success('Logo uploaded successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload logo')
    } finally {
      setUploadingLogo(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteLogo = async () => {
    if (!confirm('Remove company logo?')) return
    try {
      await adminAPI.deleteLogo()
      setSettings(prev => ({ ...prev, company_logo: '' }))
      toast.success('Logo removed')
    } catch (err) {
      toast.error('Failed to remove logo')
    }
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">General Settings</h1>
        <p className="text-text-muted">Configure company information and branding.</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {/* Company Logo */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Image size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-text">Company Logo</h2>
          </div>
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 bg-surface-hover border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden">
              {settings.company_logo ? (
                <img 
                  src={`http://localhost:8000${settings.company_logo}`} 
                  alt="Company Logo" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-text-muted">
                  <Image size={32} className="mx-auto mb-1 opacity-50" />
                  <span className="text-xs">No logo</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-text-muted mb-3">
                Upload your company logo. Recommended size: 200x200px. Max file size: 2MB.
              </p>
              <div className="flex gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-outline btn-sm"
                  disabled={uploadingLogo}
                >
                  {uploadingLogo ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                </button>
                {settings.company_logo && (
                  <button 
                    type="button" 
                    onClick={handleDeleteLogo}
                    className="btn btn-outline btn-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Building2 size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-text">Company Information</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input type="text" className="form-input" value={settings.company_name} onChange={(e) => setSettings({ ...settings, company_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={settings.company_email} onChange={(e) => setSettings({ ...settings, company_email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-input" value={settings.company_phone} onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Frontend URL</label>
              <input type="url" className="form-input" placeholder="http://localhost:5173" value={settings.frontend_url} onChange={(e) => setSettings({ ...settings, frontend_url: e.target.value })} />
            </div>
            <div className="form-group sm:col-span-2">
              <label className="form-label">Company Address</label>
              <textarea className="form-input" rows={2} value={settings.company_address || ''} onChange={(e) => setSettings({ ...settings, company_address: e.target.value })} placeholder="Enter company address" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}
