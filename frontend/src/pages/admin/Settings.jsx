import AdminLayout from '../../components/layouts/AdminLayout'
import { useState } from 'react'
import { useToast } from '../../context/ToastContext'
import { Settings as SettingsIcon, Building2 } from 'lucide-react'

export default function Settings() {
  const toast = useToast()
  const [settings, setSettings] = useState({
    company_name: 'AviLegal',
    company_email: 'info@avilegal.com',
    company_phone: '+234 xxx xxx xxxx',
    currency: 'NGN',
  })

  const handleSave = (e) => {
    e.preventDefault()
    toast.success('Settings saved successfully!')
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">Settings</h1>
        <p className="text-text-muted">Configure system settings and preferences.</p>
      </div>

      <div className="max-w-xl">
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">Company Information</h2>
          <form onSubmit={handleSave}>
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
              <label className="form-label">Currency</label>
              <select className="form-input form-select" value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}>
                <option value="NGN">Nigerian Naira (₦)</option>
                <option value="USD">US Dollar ($)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
