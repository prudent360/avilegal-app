import CustomerLayout from '../../components/layouts/CustomerLayout'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Loader } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { applicationAPI, servicesAPI } from '../../services/api'

export default function NewApplication() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ service_id: null, company_name: '', business_type: '' })
  const [selectedService, setSelectedService] = useState(null)
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await servicesAPI.getAll()
        setServices(res.data)
      } catch (err) {
        toast.error('Failed to load services')
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const handleSelectService = (service) => {
    setFormData({ ...formData, service_id: service.id })
    setSelectedService(service)
    setStep(2)
  }

  const handleSubmit = async () => {
    if (!formData.company_name) {
      toast.error('Please enter a business name')
      return
    }
    setSubmitting(true)
    try {
      await applicationAPI.create({
        service_id: formData.service_id,
        company_name: formData.company_name,
        business_type: formData.business_type,
      })
      toast.success('Application submitted successfully!')
      navigate('/applications')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)
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

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-text mb-2">New Application</h1>
        <p className="text-text-muted mb-8">Choose a service and provide your business details.</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-2 rounded-full ${step >= s ? 'bg-primary-600' : 'bg-border'}`} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Select Service</h2>
            <div className="grid gap-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleSelectService(service)}
                  className={`card text-left flex justify-between items-center hover:border-primary-500 ${formData.service_id === service.id ? 'border-primary-500' : ''}`}
                >
                  <div>
                    <h3 className="font-semibold text-text">{service.name}</h3>
                    <p className="text-sm text-text-muted">{service.duration} processing</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">{formatPrice(service.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Business Details</h2>
            <div className="card">
              <div className="form-group">
                <label className="form-label">Proposed Business Name</label>
                <input type="text" className="form-input" placeholder="Enter business name" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Business Type</label>
                <select className="form-input form-select" value={formData.business_type} onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}>
                  <option value="">Select business type</option>
                  <option value="Private Limited Company">Private Limited Company</option>
                  <option value="Non-Governmental Organization">Non-Governmental Organization</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn btn-outline">Back</button>
                <button onClick={() => setStep(3)} className="btn btn-primary" disabled={!formData.company_name}>Continue <ArrowRight size={16} /></button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Review & Submit</h2>
            <div className="card mb-4">
              <h3 className="font-semibold text-text mb-4">Application Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-text-muted">Service</span><span className="text-text">{selectedService?.name}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Price</span><span className="text-text font-semibold">{formatPrice(selectedService?.price)}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Business Name</span><span className="text-text">{formData.company_name}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Business Type</span><span className="text-text">{formData.business_type || '-'}</span></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn btn-outline">Back</button>
              <button onClick={handleSubmit} className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}
