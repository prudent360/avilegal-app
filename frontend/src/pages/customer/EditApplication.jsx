import CustomerLayout from '../../components/layouts/CustomerLayout'
import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader, Save, Users } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { applicationAPI } from '../../services/api'

export default function EditApplication() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [application, setApplication] = useState(null)
  
  const [formData, setFormData] = useState({
    company_name: '',
    company_name_option2: '',
    business_type: '',
    business_address: '',
    nature_of_business: '',
    applicant: {
      full_name: '',
      phone: '',
      email: '',
      gender: '',
      dob: '',
      residential_address: '',
      nin: '',
      occupation: '',
      share_percentage: '',
    },
    partners: [],
  })

  const isPartnership = formData.business_type === 'Partnership'

  useEffect(() => {
    fetchApplication()
  }, [id])

  const fetchApplication = async () => {
    try {
      const res = await applicationAPI.getOne(id)
      const app = res.data
      
      // Check if application is editable
      if (app.status !== 'pending_payment') {
        toast.error('This application cannot be edited')
        navigate('/applications')
        return
      }

      setApplication(app)
      
      // Parse details from the application
      const details = app.details || {}
      
      setFormData({
        company_name: app.company_name || '',
        company_name_option2: details.company_name_option2 || '',
        business_type: app.business_type || '',
        business_address: details.business_address || '',
        nature_of_business: details.nature_of_business || '',
        applicant: details.applicant || {
          full_name: '',
          phone: '',
          email: '',
          gender: '',
          dob: '',
          residential_address: '',
          nin: '',
          occupation: '',
          share_percentage: '',
        },
        partners: details.partners || [],
      })
    } catch (err) {
      toast.error('Failed to load application')
      navigate('/applications')
    } finally {
      setLoading(false)
    }
  }

  const updateApplicant = (field, value) => {
    setFormData(prev => ({
      ...prev,
      applicant: { ...prev.applicant, [field]: value }
    }))
  }

  const updatePartner = (index, field, value) => {
    setFormData(prev => {
      const partners = [...prev.partners]
      partners[index] = { ...partners[index], [field]: value }
      return { ...prev, partners }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const details = {
        applicant: formData.applicant,
        business_address: formData.business_address,
        nature_of_business: formData.nature_of_business,
        company_name_option2: formData.company_name_option2,
        partners: isPartnership ? formData.partners : [],
      }
      
      await applicationAPI.update(id, {
        company_name: formData.company_name,
        business_type: formData.business_type,
        details,
      })
      
      toast.success('Application updated successfully')
      navigate(`/applications/${id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update application')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center py-20">
          <Loader size={32} className="animate-spin text-primary-600" />
        </div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <Link to={`/applications/${id}`} className="inline-flex items-center gap-2 text-text-muted hover:text-text mb-6">
        <ArrowLeft size={18} /> Back to Application
      </Link>

      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-text mb-2">Edit Application</h1>
        <p className="text-text-muted mb-8">Update your application details before payment.</p>

        {/* Personal Details */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">Personal Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="form-group sm:col-span-2">
              <label className="form-label">Full Name (Surname First) *</label>
              <input type="text" className="form-input" placeholder="SURNAME Firstname Middlename" 
                value={formData.applicant.full_name} onChange={(e) => updateApplicant('full_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input type="tel" className="form-input" placeholder="08012345678" 
                value={formData.applicant.phone} onChange={(e) => updateApplicant('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" className="form-input" placeholder="email@example.com" 
                value={formData.applicant.email} onChange={(e) => updateApplicant('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select className="form-input form-select" value={formData.applicant.gender} onChange={(e) => updateApplicant('gender', e.target.value)}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input type="date" className="form-input" value={formData.applicant.dob} onChange={(e) => updateApplicant('dob', e.target.value)} />
            </div>
            <div className="form-group sm:col-span-2">
              <label className="form-label">Residential Address *</label>
              <input type="text" className="form-input" placeholder="Full address" 
                value={formData.applicant.residential_address} onChange={(e) => updateApplicant('residential_address', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">NIN Number *</label>
              <input type="text" className="form-input" placeholder="11 digit NIN" maxLength={11}
                value={formData.applicant.nin} onChange={(e) => updateApplicant('nin', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Occupation *</label>
              <input type="text" className="form-input" placeholder="Your occupation" 
                value={formData.applicant.occupation} onChange={(e) => updateApplicant('occupation', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">Business Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="form-group">
              <label className="form-label">Business Name (Option 1) *</label>
              <input type="text" className="form-input" placeholder="Preferred business name" 
                value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Business Name (Option 2)</label>
              <input type="text" className="form-input" placeholder="Alternative name" 
                value={formData.company_name_option2} onChange={(e) => setFormData({...formData, company_name_option2: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Business Type *</label>
              <select className="form-input form-select" value={formData.business_type} onChange={(e) => setFormData({...formData, business_type: e.target.value})}>
                <option value="">Select business type</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="Private Limited Company">Private Limited Company</option>
                <option value="Non-Governmental Organization">Non-Governmental Organization</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nature of Business *</label>
              <input type="text" className="form-input" placeholder="e.g. General Merchandise, IT Services" 
                value={formData.nature_of_business} onChange={(e) => setFormData({...formData, nature_of_business: e.target.value})} />
            </div>
            <div className="form-group sm:col-span-2">
              <label className="form-label">Business Address (if different from residential)</label>
              <input type="text" className="form-input" placeholder="Leave empty if same as residential" 
                value={formData.business_address} onChange={(e) => setFormData({...formData, business_address: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Partnership Section */}
        {isPartnership && formData.partners.length > 0 && (
          <div className="card mb-6 border-blue-200 bg-blue-50/50">
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-text">Partner Details</h2>
            </div>
            
            {formData.partners.map((partner, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg border border-border mb-3">
                <h4 className="font-medium text-text mb-3">Partner {idx + 1}</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="form-group">
                    <label className="form-label text-sm">Full Name *</label>
                    <input type="text" className="form-input" placeholder="SURNAME Firstname" 
                      value={partner.full_name} onChange={(e) => updatePartner(idx, 'full_name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-sm">Phone *</label>
                    <input type="tel" className="form-input" placeholder="08012345678" 
                      value={partner.phone} onChange={(e) => updatePartner(idx, 'phone', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-sm">Email *</label>
                    <input type="email" className="form-input" placeholder="email@example.com" 
                      value={partner.email} onChange={(e) => updatePartner(idx, 'email', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-sm">Share Percentage *</label>
                    <input type="number" className="form-input" placeholder="e.g. 50" min="1" max="100"
                      value={partner.share_percentage} onChange={(e) => updatePartner(idx, 'share_percentage', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-sm">NIN</label>
                    <input type="text" className="form-input" placeholder="11 digit NIN" maxLength={11}
                      value={partner.nin} onChange={(e) => updatePartner(idx, 'nin', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-sm">Address</label>
                    <input type="text" className="form-input" placeholder="Residential address" 
                      value={partner.residential_address} onChange={(e) => updatePartner(idx, 'residential_address', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link to={`/applications/${id}`} className="btn btn-outline">Cancel</Link>
          <button onClick={handleSave} className="btn btn-primary flex-1" disabled={saving}>
            {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </CustomerLayout>
  )
}
