import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import { Mail, Loader, Send, RotateCcw, Save, X, Eye, EyeOff, Settings, FileText } from 'lucide-react'
import { adminAPI } from '../../services/api'

export default function EmailConfig() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('smtp')
  
  // SMTP State
  const [smtpLoading, setSmtpLoading] = useState(true)
  const [smtpSaving, setSmtpSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [smtpSettings, setSmtpSettings] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    smtp_from_address: '',
    smtp_from_name: '',
  })

  // Templates State
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [templateSaving, setTemplateSaving] = useState(false)
  const [templateTestEmail, setTemplateTestEmail] = useState('')
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    is_active: true,
  })

  useEffect(() => {
    fetchSmtpSettings()
    fetchTemplates()
  }, [])

  // SMTP Functions
  const fetchSmtpSettings = async () => {
    try {
      const res = await adminAPI.getSettings()
      setSmtpSettings(prev => ({
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
      toast.error('Failed to load SMTP settings')
    } finally {
      setSmtpLoading(false)
    }
  }

  const handleSmtpSave = async (e) => {
    e.preventDefault()
    setSmtpSaving(true)
    try {
      await adminAPI.updateSettings({ settings: smtpSettings })
      toast.success('SMTP settings saved successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSmtpSaving(false)
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
      toast.success(res.data.message || 'Test email sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send test email')
    } finally {
      setTesting(false)
    }
  }

  // Template Functions
  const fetchTemplates = async () => {
    try {
      const res = await adminAPI.getEmailTemplates()
      setTemplates(res.data)
    } catch (err) {
      toast.error('Failed to load email templates')
    } finally {
      setTemplatesLoading(false)
    }
  }

  const selectTemplate = (template) => {
    setSelectedTemplate(template)
    setFormData({
      subject: template.subject,
      body: template.body,
      is_active: template.is_active,
    })
    setEditMode(false)
  }

  const handleTemplateSave = async () => {
    setTemplateSaving(true)
    try {
      await adminAPI.updateEmailTemplate(selectedTemplate.id, formData)
      toast.success('Template saved successfully')
      setEditMode(false)
      fetchTemplates()
      setSelectedTemplate({ ...selectedTemplate, ...formData })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save template')
    } finally {
      setTemplateSaving(false)
    }
  }

  const handleTemplateReset = async () => {
    if (!confirm('Reset this template to default?')) return
    try {
      await adminAPI.resetEmailTemplate(selectedTemplate.id)
      toast.success('Template reset to default')
      fetchTemplates()
      const res = await adminAPI.getEmailTemplate(selectedTemplate.id)
      selectTemplate(res.data)
    } catch (err) {
      toast.error('Failed to reset template')
    }
  }

  const handleTemplateTest = async () => {
    if (!templateTestEmail) {
      toast.error('Enter an email address')
      return
    }
    try {
      const res = await adminAPI.testEmailTemplate(selectedTemplate.id, templateTestEmail)
      toast.success(res.data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send test')
    }
  }

  if (smtpLoading && templatesLoading) {
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text mb-1">Email Configuration</h1>
        <p className="text-text-muted">Configure SMTP settings and customize email templates.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('smtp')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'smtp' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <span className="flex items-center gap-2">
            <Settings size={16} /> SMTP Settings
          </span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'templates' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText size={16} /> Email Templates
          </span>
        </button>
      </div>

      {/* SMTP Tab */}
      {activeTab === 'smtp' && (
        <form onSubmit={handleSmtpSave} className="max-w-2xl space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Mail size={20} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-text">SMTP Server</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="form-group">
                <label className="form-label">SMTP Host</label>
                <input type="text" className="form-input font-mono text-sm" placeholder="smtp.gmail.com" 
                  value={smtpSettings.smtp_host} onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_host: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">SMTP Port</label>
                <input type="text" className="form-input font-mono text-sm" placeholder="587" 
                  value={smtpSettings.smtp_port} onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_port: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input type="text" className="form-input font-mono text-sm" placeholder="your@email.com" 
                  value={smtpSettings.smtp_username} onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_username: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} className="form-input font-mono text-sm pr-10" placeholder="App password" 
                    value={smtpSettings.smtp_password} onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_password: e.target.value })} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Encryption</label>
                <select className="form-input form-select" value={smtpSettings.smtp_encryption} 
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_encryption: e.target.value })}>
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="">None</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Send size={20} className="text-primary-600" />
              <h2 className="text-lg font-semibold text-text">Sender Settings</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="form-group">
                <label className="form-label">From Address</label>
                <input type="email" className="form-input" placeholder="noreply@avilegal.com" 
                  value={smtpSettings.smtp_from_address} onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_from_address: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">From Name</label>
                <input type="text" className="form-input" placeholder="AviLegal" 
                  value={smtpSettings.smtp_from_name} onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_from_name: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Test Configuration</h2>
            <div className="flex gap-2">
              <input type="email" className="form-input flex-1" placeholder="Enter email to send test" 
                value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
              <button type="button" className="btn btn-outline" onClick={handleTestEmail} disabled={testing}>
                {testing ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                {testing ? 'Sending...' : 'Send Test'}
              </button>
            </div>
            <p className="text-xs text-text-muted mt-2">Save settings first, then test.</p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={smtpSaving}>
            {smtpSaving ? 'Saving...' : 'Save SMTP Settings'}
          </button>
        </form>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-text">Templates</h2>
            </div>
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {templates.map((template) => (
                <button key={template.id} onClick={() => selectTemplate(template)}
                  className={`w-full p-4 text-left hover:bg-surface-hover transition-colors ${
                    selectedTemplate?.id === template.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                  }`}>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className={template.is_active ? 'text-primary-600' : 'text-text-muted'} />
                    <div>
                      <p className="font-medium text-text text-sm">{template.name}</p>
                      <p className="text-xs text-text-muted">{template.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedTemplate ? (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-text">{selectedTemplate.name}</h2>
                    <p className="text-sm text-text-muted">{selectedTemplate.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {editMode ? (
                      <>
                        <button onClick={() => setEditMode(false)} className="btn btn-outline btn-sm"><X size={16} /> Cancel</button>
                        <button onClick={handleTemplateSave} className="btn btn-primary btn-sm" disabled={templateSaving}>
                          <Save size={16} /> {templateSaving ? 'Saving...' : 'Save'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={handleTemplateReset} className="btn btn-outline btn-sm"><RotateCcw size={16} /> Reset</button>
                        <button onClick={() => setEditMode(true)} className="btn btn-primary btn-sm">Edit</button>
                      </>
                    )}
                  </div>
                </div>

                {selectedTemplate.variables?.length > 0 && (
                  <div className="mb-4 p-3 bg-surface-hover rounded-lg">
                    <p className="text-xs font-medium text-text-muted mb-2">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.variables.map((v) => (
                        <code key={v} className="px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">{`{{${v}}}`}</code>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  {editMode ? (
                    <input type="text" className="form-input font-mono text-sm" value={formData.subject} 
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                  ) : (
                    <div className="p-3 bg-surface-hover rounded-lg font-mono text-sm">{formData.subject}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Body</label>
                  {editMode ? (
                    <textarea className="form-input font-mono text-sm" rows={10} value={formData.body} 
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })} />
                  ) : (
                    <pre className="p-3 bg-surface-hover rounded-lg font-mono text-sm whitespace-pre-wrap max-h-64 overflow-auto">{formData.body}</pre>
                  )}
                </div>

                {editMode && (
                  <div className="form-group">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.is_active} 
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 rounded border-border text-primary-600" />
                      <span className="text-sm text-text">Template is active</span>
                    </label>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border">
                  <label className="form-label">Send Test</label>
                  <div className="flex gap-2">
                    <input type="email" className="form-input flex-1" placeholder="Enter email" 
                      value={templateTestEmail} onChange={(e) => setTemplateTestEmail(e.target.value)} />
                    <button onClick={handleTemplateTest} className="btn btn-outline"><Send size={16} /> Test</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center py-12 text-text-muted">
                <Mail size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select a template to view and edit</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
