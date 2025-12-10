import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect, useRef } from 'react'
import { useToast } from '../../context/ToastContext'
import { Building2, Loader, Image, Upload, Trash2, Save } from 'lucide-react'
import { adminAPI } from '../../services/api'

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'

export default function Settings() {
  const toast = useToast()
  const headerLogoRef = useRef(null)
  const footerLogoRef = useRef(null)
  const dashboardLogoRef = useRef(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState({})
  
  const [settings, setSettings] = useState({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    frontend_url: '',
  })
  
  const [logos, setLogos] = useState({
    header_logo: '',
    footer_logo: '',
    dashboard_logo: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await adminAPI.getSettings()
      setSettings(prev => ({
        ...prev,
        company_name: res.data.company_name || '',
        company_email: res.data.company_email || '',
        company_phone: res.data.company_phone || '',
        company_address: res.data.company_address || '',
        frontend_url: res.data.frontend_url || '',
      }))
      setLogos({
        header_logo: res.data.header_logo || '',
        footer_logo: res.data.footer_logo || '',
        dashboard_logo: res.data.dashboard_logo || '',
      })
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

  const handleLogoUpload = async (e, type) => {
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

    setUploadingLogo(prev => ({ ...prev, [type]: true }))
    try {
      const formData = new FormData()
      formData.append('logo', file)
      formData.append('type', type)
      const res = await adminAPI.uploadLogo(formData)
      setLogos(prev => ({ ...prev, [`${type}_logo`]: res.data.logo_url }))
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} logo uploaded`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload logo')
    } finally {
      setUploadingLogo(prev => ({ ...prev, [type]: false }))
      // Reset file input
      if (type === 'header' && headerLogoRef.current) headerLogoRef.current.value = ''
      if (type === 'footer' && footerLogoRef.current) footerLogoRef.current.value = ''
      if (type === 'dashboard' && dashboardLogoRef.current) dashboardLogoRef.current.value = ''
    }
  }

  const handleDeleteLogo = async (type) => {
    if (!confirm(`Remove ${type} logo?`)) return
    try {
      await adminAPI.deleteLogo(type)
      setLogos(prev => ({ ...prev, [`${type}_logo`]: '' }))
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} logo removed`)
    } catch (err) {
      toast.error('Failed to remove logo')
    }
  }

  const LogoUploadSection = ({ type, label, description, logoRef }) => {
    const logoKey = `${type}_logo`
    const logoUrl = logos[logoKey]
    
    return (
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium text-text">{label}</h3>
            <p className="text-sm text-text-muted">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="w-20 h-20 bg-gray-100 border border-border rounded-lg flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <img src={`${API_URL}${logoUrl}`} alt={label} className="w-full h-full object-contain p-2" />
            ) : (
              <Image size={24} className="text-gray-400" />
            )}
          </div>
          
          {/* Actions */}
          <div className="flex-1 space-y-2">
            <input
              type="file"
              ref={logoRef}
              accept="image/*"
              onChange={(e) => handleLogoUpload(e, type)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => logoRef.current?.click()}
              disabled={uploadingLogo[type]}
              className="btn btn-outline btn-sm w-full"
            >
              {uploadingLogo[type] ? (
                <><Loader size={14} className="animate-spin" /> Uploading...</>
              ) : (
                <><Upload size={14} /> {logoUrl ? 'Change' : 'Upload'}</>
              )}
            </button>
            {logoUrl && (
              <button
                type="button"
                onClick={() => handleDeleteLogo(type)}
                className="btn btn-sm w-full text-red-600 hover:bg-red-50 border-red-200"
              >
                <Trash2 size={14} /> Remove
              </button>
            )}
          </div>
        </div>
      </div>
    )
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
        <p className="text-text-muted">Manage your company information and branding.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Building2 size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-text">Company Information</h2>
          </div>
          
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="form-input"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                placeholder="AviLegal"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={settings.company_email}
                onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                placeholder="info@avilegal.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={settings.company_phone}
                onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                placeholder="+234 xxx xxx xxxx"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                className="form-input"
                rows={2}
                value={settings.company_address}
                onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                placeholder="Company address..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Frontend URL</label>
              <input
                type="url"
                className="form-input"
                value={settings.frontend_url}
                onChange={(e) => setSettings({ ...settings, frontend_url: e.target.value })}
                placeholder="https://avilegal.com"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><Loader size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
            </button>
          </form>
        </div>

        {/* Logo Management */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Image size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-text">Logo Management</h2>
          </div>
          
          <div className="space-y-4">
            <LogoUploadSection
              type="header"
              label="Header Logo"
              description="Displayed in the landing page header"
              logoRef={headerLogoRef}
            />
            <LogoUploadSection
              type="footer"
              label="Footer Logo"
              description="Displayed in the landing page footer"
              logoRef={footerLogoRef}
            />
            <LogoUploadSection
              type="dashboard"
              label="Dashboard Logo"
              description="Displayed in the sidebar of customer/admin dashboards"
              logoRef={dashboardLogoRef}
            />
          </div>
          
          <p className="text-xs text-text-muted mt-4">
            Recommended: PNG or SVG format. Max size: 2MB. Optimal dimensions: 200x50px for header/footer, 40x40px for dashboard.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
