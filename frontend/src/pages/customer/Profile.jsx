import CustomerLayout from '../../components/layouts/CustomerLayout'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { User, Mail, Phone, Lock } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('Profile updated successfully!')
  }

  return (
    <CustomerLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">Profile Settings</h1>
        <p className="text-text-muted">Manage your account information.</p>
      </div>

      <div className="max-w-xl">
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">Personal Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Change Password</h2>
          <form>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-outline">Update Password</button>
          </form>
        </div>
      </div>
    </CustomerLayout>
  )
}
