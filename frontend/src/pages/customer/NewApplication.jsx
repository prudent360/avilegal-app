import CustomerLayout from '../../components/layouts/CustomerLayout'
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Loader, CreditCard, Check } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { servicesAPI, paymentAPI } from '../../services/api'

export default function NewApplication() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState([])
  const [paymentConfig, setPaymentConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ 
    service_id: null, 
    company_name: '', 
    business_type: '',
    gateway: 'paystack'
  })
  const [selectedService, setSelectedService] = useState(null)
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, configRes] = await Promise.all([
          servicesAPI.getAll(),
          paymentAPI.getConfig()
        ])
        setServices(servicesRes.data)
        setPaymentConfig(configRes.data)
      } catch (err) {
        toast.error('Failed to load services')
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

  const handlePayment = async () => {
    if (!formData.company_name) {
      toast.error('Please enter a business name')
      return
    }
    setSubmitting(true)
    try {
      const res = await paymentAPI.initialize({
        service_id: formData.service_id,
        gateway: formData.gateway,
        company_name: formData.company_name,
        business_type: formData.business_type,
      })
      
      if (res.data.success && res.data.authorization_url) {
        // Redirect to payment page
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
        <p className="text-text-muted mb-8">Choose a service and complete payment to submit.</p>

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
            <h2 className="text-lg font-semibold text-text mb-4">Review & Pay</h2>
            <div className="card mb-4">
              <h3 className="font-semibold text-text mb-4">Application Summary</h3>
              <div className="space-y-3 text-sm border-b border-border pb-4 mb-4">
                <div className="flex justify-between"><span className="text-text-muted">Service</span><span className="text-text">{selectedService?.name}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Business Name</span><span className="text-text">{formData.company_name}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Business Type</span><span className="text-text">{formData.business_type || '-'}</span></div>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-text">Total</span>
                <span className="text-primary-600">{formatPrice(selectedService?.price)}</span>
              </div>
            </div>

            <div className="card mb-4">
              <h3 className="font-semibold text-text mb-4">Select Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData({ ...formData, gateway: 'paystack' })}
                  className={`p-4 border rounded-lg text-center transition ${formData.gateway === 'paystack' ? 'border-primary-500 bg-primary-50' : 'border-border hover:border-primary-300'}`}
                >
                  <CreditCard size={24} className="mx-auto mb-2 text-primary-600" />
                  <span className="font-medium">Paystack</span>
                  {formData.gateway === 'paystack' && <Check size={16} className="inline ml-2 text-primary-600" />}
                </button>
                <button
                  onClick={() => setFormData({ ...formData, gateway: 'flutterwave' })}
                  className={`p-4 border rounded-lg text-center transition ${formData.gateway === 'flutterwave' ? 'border-primary-500 bg-primary-50' : 'border-border hover:border-primary-300'}`}
                >
                  <CreditCard size={24} className="mx-auto mb-2 text-orange-500" />
                  <span className="font-medium">Flutterwave</span>
                  {formData.gateway === 'flutterwave' && <Check size={16} className="inline ml-2 text-primary-600" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn btn-outline">Back</button>
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
