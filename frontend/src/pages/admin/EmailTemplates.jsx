import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import { Mail, Loader, ArrowLeft, Send, RotateCcw, Eye, Save, X } from 'lucide-react'
import { adminAPI } from '../../services/api'

export default function EmailTemplates() {
  const toast = useToast()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    is_active: true,
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await adminAPI.getEmailTemplates()
      setTemplates(res.data)
    } catch (err) {
      toast.error('Failed to load email templates')
    } finally {
      setLoading(false)
    }
  }

  const selectTemplate = async (template) => {
    setSelectedTemplate(template)
    setFormData({
      subject: template.subject,
      body: template.body,
      is_active: template.is_active,
    })
    setEditMode(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminAPI.updateEmailTemplate(selectedTemplate.id, formData)
      toast.success('Template saved successfully')
      setEditMode(false)
      fetchTemplates()
      setSelectedTemplate({ ...selectedTemplate, ...formData })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Reset this template to default? Your changes will be lost.')) return
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

  const handleTest = async () => {
    if (!testEmail) {
      toast.error('Enter an email address')
      return
    }
    try {
      const res = await adminAPI.testEmailTemplate(selectedTemplate.id, testEmail)
      toast.success(res.data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send test email')
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text mb-1">Email Templates</h1>
        <p className="text-text-muted">Customize the emails sent to users.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-text">Templates</h2>
          </div>
          <div className="divide-y divide-border">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => selectTemplate(template)}
                className={`w-full p-4 text-left hover:bg-surface-hover transition-colors ${
                  selectedTemplate?.id === template.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                }`}
              >
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

        {/* Template Editor */}
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
                      <button onClick={() => setEditMode(false)} className="btn btn-outline btn-sm">
                        <X size={16} /> Cancel
                      </button>
                      <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
                        <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleReset} className="btn btn-outline btn-sm">
                        <RotateCcw size={16} /> Reset
                      </button>
                      <button onClick={() => setEditMode(true)} className="btn btn-primary btn-sm">
                        Edit Template
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Variables */}
              <div className="mb-4 p-3 bg-surface-hover rounded-lg">
                <p className="text-xs font-medium text-text-muted mb-2">Available Variables:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedTemplate.variables?.map((v) => (
                    <code key={v} className="px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                      {`{{${v}}}`}
                    </code>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="form-group">
                <label className="form-label">Subject</label>
                {editMode ? (
                  <input
                    type="text"
                    className="form-input font-mono text-sm"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                ) : (
                  <div className="p-3 bg-surface-hover rounded-lg font-mono text-sm">{formData.subject}</div>
                )}
              </div>

              {/* Body */}
              <div className="form-group">
                <label className="form-label">Body (Markdown)</label>
                {editMode ? (
                  <textarea
                    className="form-input font-mono text-sm"
                    rows={12}
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  />
                ) : (
                  <pre className="p-3 bg-surface-hover rounded-lg font-mono text-sm whitespace-pre-wrap overflow-auto max-h-80">
                    {formData.body}
                  </pre>
                )}
              </div>

              {/* Active toggle */}
              {editMode && (
                <div className="form-group">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-text">Template is active</span>
                  </label>
                </div>
              )}

              {/* Test Email */}
              <div className="mt-6 pt-4 border-t border-border">
                <label className="form-label">Send Test Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    className="form-input flex-1"
                    placeholder="Enter email address"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <button onClick={handleTest} className="btn btn-outline">
                    <Send size={16} /> Send Test
                  </button>
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
    </AdminLayout>
  )
}
