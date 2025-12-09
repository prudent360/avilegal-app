import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import { Mail, Loader, Eye, EyeOff, Send } from 'lucide-react'
import { adminAPI } from '../../services/api'

export default function SmtpConfig() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [settings, setSettings] = useState({
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
        smtp_host: res.data.smtp_host || '',
        smtp_port: res.data.smtp_port || '',
        smtp_username: res.data.smtp_username || '',
        smtp_password: res.data.smtp_password || '',
        smtp_encryption: res.data.smtp_encryption || 'tls',
        smtp_from_address: res.data.smtp_from_address || '',
        smtp_from_name: res.data.smtp_from_name || '',
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
      toast.success('SMTP settings saved successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Enter an email address')
      return
    }
    setTesting(true)
    try {
      const res = await adminAPI.testEmail(testEmail)
      toast.success(res.data.message || 'Test email sent successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send test email')
    } finally {
      setTesting(false)
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
        <h1 className="text-2xl font-bold text-text mb-1">SMTP Configuration</h1>
        <p className="text-text-muted">Configure email server settings for sending notifications.</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {/* SMTP Server */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Mail size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-text">SMTP Server Settings</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="form-group">
              <label className="form-label">SMTP Host</label>
              <input 
                type="text" 
                className="form-input font-mono text-sm" 
                placeholder="smtp.gmail.com" 
                value={settings.smtp_host} 
                onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">SMTP Port</label>
              <input 
                type="text" 
                className="form-input font-mono text-sm" 
                placeholder="587" 
                value={settings.smtp_port} 
                onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-input font-mono text-sm" 
                placeholder="your@email.com" 
                value={settings.smtp_username} 
                onChange={(e) => setSettings({ ...settings, smtp_username: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-input font-mono text-sm pr-10" 
                  placeholder="App password" 
                  value={settings.smtp_password} 
                  onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Encryption</label>
              <select 
                className="form-input form-select" 
                value={settings.smtp_encryption} 
                onChange={(e) => setSettings({ ...settings, smtp_encryption: e.target.value })}
              >
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="">None</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sender Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Send size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-text">Sender Settings</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="form-group">
              <label className="form-label">From Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="noreply@avilegal.com" 
                value={settings.smtp_from_address} 
                onChange={(e) => setSettings({ ...settings, smtp_from_address: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">From Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="AviLegal" 
                value={settings.smtp_from_name} 
                onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })} 
              />
            </div>
          </div>
        </div>

        {/* Test Email */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Test Email Configuration</h2>
          <p className="text-sm text-text-muted mb-3">
            Save your settings first, then send a test email to verify the configuration works.
          </p>
          <div className="flex gap-2">
            <input 
              type="email" 
              className="form-input flex-1" 
              placeholder="Enter email to send test"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={handleTestEmail}
              disabled={testing}
            >
              {testing ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
              {testing ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save SMTP Settings'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}
