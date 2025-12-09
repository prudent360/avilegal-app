import CustomerLayout from '../../components/layouts/CustomerLayout'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Loader, CreditCard, Check, Upload, Users } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { servicesAPI, paymentAPI } from '../../services/api'
import api from '../../services/api'

const EMPTY_PERSON = {
  full_name: '',
  phone: '',
  email: '',
  gender: '',
  dob: '',
  residential_address: '',
  nin: '',
  occupation: '',
  share_percentage: '',
  // Documents per person
  nin_doc: null,
  signature_doc: null,
  photo_doc: null,
}

export default function NewApplication() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(null)
  
  const [formData, setFormData] = useState({ 
    service_id: null, 
    company_name: '', 
    company_name_option2: '',
    business_type: '',
    business_address: '',
    nature_of_business: '',
    gateway: 'paystack',
    // Primary applicant
    applicant: { ...EMPTY_PERSON },
    // Partners (for partnership)
    partners: [],
    partner_count: 0,
  })
  
  const [selectedService, setSelectedService] = useState(null)
  const toast = useToast()
  const navigate = useNavigate()

  const isPartnership = formData.business_type === 'Partnership'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, configRes] = await Promise.all([
          servicesAPI.getAll(),
          paymentAPI.getConfig()
        ])
        setServices(servicesRes.data)
      } catch (err) {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSelectService = (service) => {
    setFormData({ ...formData, service_id: service.id })
    setSelectedService(service)
    setStep(2)
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

  const handlePartnerCountChange = (count) => {
    const num = parseInt(count) || 0
    setFormData(prev => {
      const partners = [...prev.partners]
      while (partners.length < num) partners.push({ ...EMPTY_PERSON })
      while (partners.length > num) partners.pop()
      return { ...prev, partner_count: num, partners }
    })
  }

  // Upload document for a person (applicant or partner)
  const handleDocUpload = async (e, docType, personType, partnerIndex = null) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be less than 5MB')
      return
    }
    
    const uploadKey = `${personType}-${partnerIndex ?? 'main'}-${docType}`
    setUploading(uploadKey)
    
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('type', docType)
      
      const res = await api.post('/customer/documents/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (personType === 'applicant') {
        updateApplicant(`${docType}_doc`, res.data.document)
      } else {
        updatePartner(partnerIndex, `${docType}_doc`, res.data.document)
      }
      toast.success('Document uploaded')
    } catch (err) {
      toast.error('Upload failed')
    } finally {
      setUploading(null)
    }
  }

  const isPersonDocsComplete = (person) => {
    return person.nin_doc && person.signature_doc && person.photo_doc
  }

  const allDocsUploaded = () => {
    if (!isPersonDocsComplete(formData.applicant)) return false
    if (isPartnership) {
      return formData.partners.every(p => isPersonDocsComplete(p))
    }
    return true
  }

  const isStep2Valid = formData.applicant.full_name && formData.applicant.phone && 
    formData.applicant.email && formData.applicant.gender && formData.applicant.dob &&
    formData.applicant.residential_address && formData.applicant.nin && formData.applicant.occupation

  const isStep3Valid = formData.company_name && formData.business_type && formData.nature_of_business &&
    (!isPartnership || (formData.partners.length >= 2 && formData.partners.every(p => 
      p.full_name && p.phone && p.email && p.share_percentage
    )))

  const handlePayment = async () => {
    setSubmitting(true)
    try {
      const details = {
        applicant: formData.applicant,
        business_address: formData.business_address,
        nature_of_business: formData.nature_of_business,
        company_name_option2: formData.company_name_option2,
        partners: isPartnership ? formData.partners : [],
      }
      
      const res = await paymentAPI.initialize({
        service_id: formData.service_id,
        gateway: formData.gateway,
        company_name: formData.company_name,
        business_type: formData.business_type,
        details,
      })
      
      if (res.data.success && res.data.authorization_url) {
        window.location.href = res.data.authorization_url
      } else {
        toast.error('Failed to initialize payment')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initialization failed')
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)
  }

  // Document upload card component
  const DocUploadCard = ({ label, description, docType, person, personType, partnerIndex = null }) => {
    const doc = person[`${docType}_doc`]
    const uploadKey = `${personType}-${partnerIndex ?? 'main'}-${docType}`
    const isUploading = uploading === uploadKey
    
    return (
      <div className={`p-3 border rounded-lg ${doc ? 'border-green-200 bg-green-50' : 'border-border'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text text-sm">{label}</p>
            <p className="text-xs text-text-muted">{description}</p>
          </div>
          {doc ? (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <Check size={16} /> Uploaded
            </div>
          ) : (
            <label className="btn btn-outline btn-sm cursor-pointer">
              {isUploading ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
              <span className="text-xs">{isUploading ? 'Uploading...' : 'Upload'}</span>
              <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" 
                onChange={(e) => handleDocUpload(e, docType, personType, partnerIndex)} 
                disabled={isUploading} />
            </label>
          )}
        </div>
      </div>
    )
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
      <Link to="/applications" className="inline-flex items-center gap-2 text-text-muted hover:text-text mb-6">
        <ArrowLeft size={18} /> Back to Applications
      </Link>

      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-text mb-2">CAC Registration</h1>
        <p className="text-text-muted mb-8">Complete all steps to submit your application.</p>

        {/* Progress - 5 steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`flex-1 h-2 rounded-full transition-colors ${step >= s ? 'bg-primary-600' : 'bg-border'}`} />
          ))}
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Step 1: Select Registration Type</h2>
            <div className="grid gap-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleSelectService(service)}
                  className={`card text-left flex justify-between items-center hover:border-primary-500 ${formData.service_id === service.id ? 'border-primary-500' : ''}`}
                >
                  <div>
                    <h3 className="font-semibold text-text">{service.name}</h3>
                    <p className="text-sm text-text-muted">{service.description}</p>
                    <p className="text-xs text-text-muted mt-1">{service.duration} processing</p>
                  </div>
                  <p className="font-bold text-primary-600 text-lg">{formatPrice(service.price)}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Personal Details */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Step 2: Your Personal Details</h2>
            <div className="card">
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
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn btn-outline">Back</button>
                <button onClick={() => setStep(3)} className="btn btn-primary" disabled={!isStep2Valid}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Business Details */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Step 3: Business Details</h2>
            <div className="card mb-4">
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
            {isPartnership && (
              <div className="card mb-4 border-blue-200 bg-blue-50/50">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={20} className="text-blue-600" />
                  <h3 className="font-semibold text-text">Partner Details</h3>
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">Number of Partners (including yourself)</label>
                  <select className="form-input form-select w-32" value={formData.partner_count} onChange={(e) => handlePartnerCountChange(e.target.value)}>
                    <option value="0">Select</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>

                {formData.partners.map((partner, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-lg border border-border mb-3">
                    <h4 className="font-medium text-text mb-3">Partner {idx + 1} {idx === 0 && '(You)'}</h4>
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

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn btn-outline">Back</button>
              <button onClick={() => setStep(4)} className="btn btn-primary" disabled={!isStep3Valid}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Upload Documents */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Step 4: Upload Documents</h2>
            <p className="text-sm text-text-muted mb-4">Accepted formats: JPG, PNG, PDF (max 5MB each)</p>
            
            {/* Applicant Documents */}
            <div className="card mb-4">
              <h3 className="font-semibold text-text mb-3">Your Documents</h3>
              <div className="space-y-3">
                <DocUploadCard 
                  label="Photo of NIN (Means of ID) *" 
                  description="Clear photo of your NIN slip or card"
                  docType="nin" person={formData.applicant} personType="applicant" />
                <DocUploadCard 
                  label="Signature on White Paper *" 
                  description="Photo of your signature on plain white paper"
                  docType="signature" person={formData.applicant} personType="applicant" />
                <DocUploadCard 
                  label="Passport Photograph *" 
                  description="Recent white background passport photo"
                  docType="photo" person={formData.applicant} personType="applicant" />
              </div>
            </div>

            {/* Partner Documents (if partnership) */}
            {isPartnership && formData.partners.map((partner, idx) => (
              <div key={idx} className="card mb-4 border-blue-200">
                <h3 className="font-semibold text-text mb-3">Partner {idx + 1} Documents: {partner.full_name || `Partner ${idx + 1}`}</h3>
                <div className="space-y-3">
                  <DocUploadCard 
                    label="Photo of NIN *" 
                    description="NIN slip or card"
                    docType="nin" person={partner} personType="partner" partnerIndex={idx} />
                  <DocUploadCard 
                    label="Signature *" 
                    description="Signature on white paper"
                    docType="signature" person={partner} personType="partner" partnerIndex={idx} />
                  <DocUploadCard 
                    label="Passport Photo *" 
                    description="White background"
                    docType="photo" person={partner} personType="partner" partnerIndex={idx} />
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn btn-outline">Back</button>
              <button onClick={() => setStep(5)} className="btn btn-primary" disabled={!allDocsUploaded()}>
                {allDocsUploaded() ? 'Continue' : 'Upload all documents'} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review & Pay */}
        {step === 5 && (
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Step 5: Review & Pay</h2>
            
            <div className="card mb-4">
              <h3 className="font-semibold text-text mb-3">Personal Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-text-muted">Name:</div><div className="text-text">{formData.applicant.full_name}</div>
                <div className="text-text-muted">Phone:</div><div className="text-text">{formData.applicant.phone}</div>
                <div className="text-text-muted">Email:</div><div className="text-text">{formData.applicant.email}</div>
                <div className="text-text-muted">NIN:</div><div className="text-text">{formData.applicant.nin}</div>
              </div>
            </div>

            <div className="card mb-4">
              <h3 className="font-semibold text-text mb-3">Business Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-text-muted">Service:</div><div className="text-text">{selectedService?.name}</div>
                <div className="text-text-muted">Business Name:</div><div className="text-text">{formData.company_name}</div>
                {formData.company_name_option2 && <><div className="text-text-muted">Alternative:</div><div className="text-text">{formData.company_name_option2}</div></>}
                <div className="text-text-muted">Type:</div><div className="text-text">{formData.business_type}</div>
                <div className="text-text-muted">Nature:</div><div className="text-text">{formData.nature_of_business}</div>
              </div>
              {isPartnership && formData.partners.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-medium text-text mb-2">Partners ({formData.partners.length})</h4>
                  {formData.partners.map((p, i) => (
                    <div key={i} className="text-sm text-text-muted">{p.full_name} - {p.share_percentage}%</div>
                  ))}
                </div>
              )}
            </div>

            <div className="card mb-4">
              <h3 className="font-semibold text-text mb-3">Documents</h3>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-success">Your docs ✓</span>
                {isPartnership && formData.partners.map((_, i) => (
                  <span key={i} className="badge badge-success">Partner {i+1} docs ✓</span>
                ))}
              </div>
            </div>

            <div className="card mb-4">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total Amount</span>
                <span className="text-primary-600">{formatPrice(selectedService?.price)}</span>
              </div>
              <h3 className="font-semibold text-text mb-3">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData({ ...formData, gateway: 'paystack' })}
                  className={`p-3 border rounded-lg text-center transition ${formData.gateway === 'paystack' ? 'border-primary-500 bg-primary-50' : 'border-border'}`}
                >
                  <CreditCard size={20} className="mx-auto mb-1 text-primary-600" />
                  <span className="text-sm font-medium">Paystack</span>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, gateway: 'flutterwave' })}
                  className={`p-3 border rounded-lg text-center transition ${formData.gateway === 'flutterwave' ? 'border-primary-500 bg-primary-50' : 'border-border'}`}
                >
                  <CreditCard size={20} className="mx-auto mb-1 text-orange-500" />
                  <span className="text-sm font-medium">Flutterwave</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(4)} className="btn btn-outline">Back</button>
              <button onClick={handlePayment} className="btn btn-primary flex-1" disabled={submitting}>
                {submitting ? 'Processing...' : `Pay ${formatPrice(selectedService?.price)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}
