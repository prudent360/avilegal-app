import CustomerLayout from '../../components/layouts/CustomerLayout'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { authAPI } from '../../services/api'
import { User, Lock, Loader, Eye, EyeOff } from 'lucide-react'
import PasswordStrength, { isPasswordStrong } from '../../components/PasswordStrength'

export default function Profile() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({})
  
  const [formData, setFormData] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    phone: user?.phone || '' 
  })
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  })

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await authAPI.updateProfile(formData)
      setUser(res.data.user || { ...user, ...formData })
      localStorage.setItem('user', JSON.stringify(res.data.user || { ...user, ...formData }))
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('New passwords do not match')
      return
    }
    if (!isPasswordStrong(passwordData.new_password)) {
      toast.error('Please use a stronger password')
      return
    }
    
    setChangingPassword(true)
    try {
      await authAPI.updatePassword(passwordData)
      toast.success('Password updated successfully!')
      setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password')
    } finally {
      setChangingPassword(false)
    }
  }

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <CustomerLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">Profile Settings</h1>
        <p className="text-text-muted">Manage your account information.</p>
      </div>

      <div className="max-w-xl space-y-6">
        {/* Personal Information */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <User size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-text">Personal Information</h2>
          </div>
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                className="form-input" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><Loader size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Lock size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-text">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div className="relative">
                <input 
                  type={showPasswords.current ? 'text' : 'password'} 
                  className="form-input pr-10" 
                  placeholder="••••••••" 
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                />
                <button type="button" onClick={() => toggleShowPassword('current')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="relative">
                <input 
                  type={showPasswords.new ? 'text' : 'password'} 
                  className="form-input pr-10" 
                  placeholder="••••••••" 
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                />
                <button type="button" onClick={() => toggleShowPassword('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <PasswordStrength password={passwordData.new_password} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="relative">
                <input 
                  type={showPasswords.confirm ? 'text' : 'password'} 
                  className="form-input pr-10" 
                  placeholder="••••••••" 
                  value={passwordData.new_password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                />
                <button type="button" onClick={() => toggleShowPassword('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-outline" disabled={changingPassword || !isPasswordStrong(passwordData.new_password)}>
              {changingPassword ? <><Loader size={16} className="animate-spin" /> Updating...</> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </CustomerLayout>
  )
}
