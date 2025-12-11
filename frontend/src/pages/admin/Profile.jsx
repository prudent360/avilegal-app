import AdminLayout from '../../components/layouts/AdminLayout'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { authAPI } from '../../services/api'
import { User, Lock, Loader, Eye, EyeOff, Save } from 'lucide-react'
import PasswordStrength, { isPasswordStrong } from '../../components/PasswordStrength'

export default function AdminProfile() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  
  const [profileData, setProfileData] = useState({ name: '', email: '', phone: '' })
  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', new_password_confirmation: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', email: user.email || '', phone: user.phone || '' })
    }
  }, [user])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    if (!profileData.name || !profileData.email) {
      toast.error('Name and email are required')
      return
    }
    
    setSavingProfile(true)
    try {
      const res = await authAPI.updateProfile(profileData)
      updateUser(res.data.user)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!passwordData.current_password || !passwordData.new_password) {
      toast.error('Please fill in all password fields')
      return
    }
    if (!isPasswordStrong(passwordData.new_password)) {
      toast.error('Please use a stronger password')
      return
    }
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('Passwords do not match')
      return
    }
    
    setSavingPassword(true)
    try {
      await authAPI.updatePassword(passwordData)
      setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' })
      toast.success('Password changed successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">My Profile</h1>
        <p className="text-text-muted">Update your account information and password.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <User size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-text">Profile Information</h2>
          </div>
          
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="Your email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+234 xxx xxx xxxx"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? <><Loader size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-primary-600" />
              <h2 className="text-lg font-semibold text-text">Change Password</h2>
            </div>
            <button 
              type="button" 
              onClick={() => setShowPasswords(!showPasswords)}
              className="text-text-muted hover:text-text text-sm flex items-center gap-1"
            >
              {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPasswords ? 'Hide' : 'Show'}
            </button>
          </div>
          
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                className="form-input"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                className="form-input"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                placeholder="Enter new password"
              />
              <PasswordStrength password={passwordData.new_password} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                className="form-input"
                value={passwordData.new_password_confirmation}
                onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingPassword || !isPasswordStrong(passwordData.new_password)}>
              {savingPassword ? <><Loader size={16} className="animate-spin" /> Changing...</> : <><Lock size={16} /> Change Password</>}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
