import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import { CreditCard, Building2, Loader, Eye, EyeOff, Mail } from 'lucide-react'
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
    smtp_host: '',
    smtp_port: '',
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    smtp_from_address: '',
    smtp_from_name: '',
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
        <p className="text-text-muted">Configure system settings, payment gateways, and email.</p>
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

        {/* Email SMTP */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Mail size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-text">Email (SMTP) Configuration</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="form-group">
              <label className="form-label">SMTP Host</label>
              <input type="text" className="form-input font-mono text-sm" placeholder="smtp.gmail.com" value={settings.smtp_host} onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">SMTP Port</label>
              <input type="text" className="form-input font-mono text-sm" placeholder="587" value={settings.smtp_port} onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input type="text" className="form-input font-mono text-sm" placeholder="your@email.com" value={settings.smtp_username} onChange={(e) => setSettings({ ...settings, smtp_username: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <input type={showSecrets.smtp ? 'text' : 'password'} className="form-input font-mono text-sm pr-10" placeholder="App password" value={settings.smtp_password} onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })} />
                <button type="button" onClick={() => toggleShowSecret('smtp')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                  {showSecrets.smtp ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Encryption</label>
              <select className="form-input form-select" value={settings.smtp_encryption} onChange={(e) => setSettings({ ...settings, smtp_encryption: e.target.value })}>
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="">None</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">From Address</label>
              <input type="email" className="form-input" placeholder="noreply@avilegal.com" value={settings.smtp_from_address} onChange={(e) => setSettings({ ...settings, smtp_from_address: e.target.value })} />
            </div>
            <div className="form-group sm:col-span-2">
              <label className="form-label">From Name</label>
              <input type="text" className="form-input" placeholder="AviLegal" value={settings.smtp_from_name} onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })} />
            </div>
            <div className="form-group sm:col-span-2">
              <label className="form-label">Test Email</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  className="form-input flex-1" 
                  placeholder="Enter email to send test"
                  id="test-email-input"
                />
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={async () => {
                    const email = document.getElementById('test-email-input').value
                    if (!email) {
                      toast.error('Enter an email address')
                      return
                    }
                    try {
                      const res = await adminAPI.testEmail(email)
                      toast.success(res.data.message)
                    } catch (err) {
                      toast.error(err.response?.data?.message || 'Failed to send test email')
                    }
                  }}
                >
                  Send Test
                </button>
              </div>
              <p className="text-xs text-text-muted mt-1">Save settings first, then send a test email to verify.</p>
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
