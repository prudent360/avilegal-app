import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import { CreditCard, Loader, Eye, EyeOff } from 'lucide-react'
import { adminAPI } from '../../services/api'

export default function PaymentConfig() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState({})
  const [settings, setSettings] = useState({
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
        paystack_public_key: res.data.paystack_public_key || '',
        paystack_secret_key: res.data.paystack_secret_key || '',
        flutterwave_public_key: res.data.flutterwave_public_key || '',
        flutterwave_secret_key: res.data.flutterwave_secret_key || '',
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
      toast.success('Payment settings saved successfully!')
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
        <h1 className="text-2xl font-bold text-text mb-1">Payment Configuration</h1>
        <p className="text-text-muted">Configure payment gateway API keys for Paystack and Flutterwave.</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {/* Paystack */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard size={20} className="text-green-600" />
            <div>
              <h2 className="text-lg font-semibold text-text">Paystack</h2>
              <p className="text-xs text-text-muted">Nigerian payment gateway</p>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="form-group">
              <label className="form-label">Public Key</label>
              <input 
                type="text" 
                className="form-input font-mono text-sm" 
                placeholder="pk_test_xxx or pk_live_xxx" 
                value={settings.paystack_public_key} 
                onChange={(e) => setSettings({ ...settings, paystack_public_key: e.target.value })} 
              />
              <p className="text-xs text-text-muted mt-1">Used for frontend payment initialization</p>
            </div>
            <div className="form-group">
              <label className="form-label">Secret Key</label>
              <div className="relative">
                <input 
                  type={showSecrets.paystack ? 'text' : 'password'} 
                  className="form-input font-mono text-sm pr-10" 
                  placeholder="sk_test_xxx or sk_live_xxx" 
                  value={settings.paystack_secret_key} 
                  onChange={(e) => setSettings({ ...settings, paystack_secret_key: e.target.value })} 
                />
                <button type="button" onClick={() => toggleShowSecret('paystack')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                  {showSecrets.paystack ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-text-muted mt-1">Used for backend payment verification (keep secret!)</p>
            </div>
          </div>
        </div>

        {/* Flutterwave */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard size={20} className="text-orange-500" />
            <div>
              <h2 className="text-lg font-semibold text-text">Flutterwave</h2>
              <p className="text-xs text-text-muted">African payment gateway</p>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="form-group">
              <label className="form-label">Public Key</label>
              <input 
                type="text" 
                className="form-input font-mono text-sm" 
                placeholder="FLWPUBK_TEST-xxx or FLWPUBK-xxx" 
                value={settings.flutterwave_public_key} 
                onChange={(e) => setSettings({ ...settings, flutterwave_public_key: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Secret Key</label>
              <div className="relative">
                <input 
                  type={showSecrets.flutterwave ? 'text' : 'password'} 
                  className="form-input font-mono text-sm pr-10" 
                  placeholder="FLWSECK_TEST-xxx or FLWSECK-xxx" 
                  value={settings.flutterwave_secret_key} 
                  onChange={(e) => setSettings({ ...settings, flutterwave_secret_key: e.target.value })} 
                />
                <button type="button" onClick={() => toggleShowSecret('flutterwave')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                  {showSecrets.flutterwave ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> Use test keys during development. Switch to live keys when going to production. 
            Never expose secret keys in frontend code.
          </p>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Payment Settings'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}
