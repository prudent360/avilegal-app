import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import { Settings as SettingsIcon, CreditCard, Building2, Globe, Loader, Eye, EyeOff } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Settings() {
  const toast = useToast()
  const { isSuperAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState({})
  const [settings, setSettings] = useState({
    company_name: '',
    company_email: '',
    company_phone: '',
    frontend_url: '',
    paystack_public_key: '',
    paystack_secret_key: '',
    flutterwave_public_key: '',
    flutterwave_secret_key: '',
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

  const toggleShowSecret = (key) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
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
        <h1 className="text-2xl font-bold text-text mb-1">Settings</h1>
        <p className="text-text-muted">Configure system settings and payment gateways.</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
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
              <input type="url" className="form-input" placeholder="http://localhost:3003" value={settings.frontend_url} onChange={(e) => setSettings({ ...settings, frontend_url: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Paystack */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard size={20} className="text-green-600" />
            <h2 className="text-lg font-semibold text-text">Paystack Configuration</h2>
          </div>
          <div className="grid gap-4">
            <div className="form-group">
              <label className="form-label">Public Key</label>
              <input type="text" className="form-input font-mono text-sm" placeholder="pk_test_xxx or pk_live_xxx" value={settings.paystack_public_key} onChange={(e) => setSettings({ ...settings, paystack_public_key: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Secret Key</label>
              <div className="relative">
                <input type={showSecrets.paystack ? 'text' : 'password'} className="form-input font-mono text-sm pr-10" placeholder="sk_test_xxx or sk_live_xxx" value={settings.paystack_secret_key} onChange={(e) => setSettings({ ...settings, paystack_secret_key: e.target.value })} />
                <button type="button" onClick={() => toggleShowSecret('paystack')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                  {showSecrets.paystack ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Flutterwave */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard size={20} className="text-orange-500" />
            <h2 className="text-lg font-semibold text-text">Flutterwave Configuration</h2>
          </div>
          <div className="grid gap-4">
            <div className="form-group">
              <label className="form-label">Public Key</label>
              <input type="text" className="form-input font-mono text-sm" placeholder="FLWPUBK_TEST-xxx or FLWPUBK-xxx" value={settings.flutterwave_public_key} onChange={(e) => setSettings({ ...settings, flutterwave_public_key: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Secret Key</label>
              <div className="relative">
                <input type={showSecrets.flutterwave ? 'text' : 'password'} className="form-input font-mono text-sm pr-10" placeholder="FLWSECK_TEST-xxx or FLWSECK-xxx" value={settings.flutterwave_secret_key} onChange={(e) => setSettings({ ...settings, flutterwave_secret_key: e.target.value })} />
                <button type="button" onClick={() => toggleShowSecret('flutterwave')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                  {showSecrets.flutterwave ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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
