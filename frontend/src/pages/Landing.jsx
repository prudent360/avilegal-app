import { Link } from 'react-router-dom'
import { Building2, Shield, Clock, CheckCircle, ArrowRight, Sparkles, FileText, Users, Award } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Landing() {
  const [logoUrl, setLogoUrl] = useState(null)

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await api.get('/logo')
        if (res.data.logo_url) {
          setLogoUrl(`http://localhost:8000${res.data.logo_url}`)
        }
      } catch (err) {
        console.error('Failed to fetch logo:', err)
      }
    }
    fetchLogo()
  }, [])

  const services = [
    { name: 'Company Registration', price: '₦85,000', duration: '7 days' },
    { name: 'Business Name Registration', price: '₦25,000', duration: '3 days' },
    { name: 'Trademark Registration', price: '₦150,000', duration: '14 days' },
    { name: 'SCUML Registration', price: '₦45,000', duration: '5 days' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Building2 size={18} className="text-white" />
              </div>
            )}
            <span className="text-lg font-semibold text-text">AviLegal</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#services" className="text-sm text-text-muted hover:text-text">Services</a>
            <a href="#how-it-works" className="text-sm text-text-muted hover:text-text">How it Works</a>
            <a href="#why-us" className="text-sm text-text-muted hover:text-text">Why Us</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-full text-primary-600 text-sm font-medium mb-6">
            <Sparkles size={14} /> Fast & Reliable Registration
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text mb-6 leading-tight">
            Incorporate Your <span className="text-primary-600">Business in Nigeria</span>
          </h1>
          <p className="text-lg text-text-muted mb-8 max-w-lg mx-auto">
            Register your company with CAC, get your business name, trademark, and all compliance documents. Start your business journey today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link to="/register" className="btn btn-primary btn-lg">Start Registration <ArrowRight size={18} /></Link>
            <a href="#services" className="btn btn-outline btn-lg">View Services</a>
          </div>
          <div className="flex items-center justify-center gap-8 text-center">
            <div><p className="text-2xl font-bold text-text">5,000+</p><p className="text-sm text-text-muted">Businesses Registered</p></div>
            <div className="w-px h-10 bg-border"></div>
            <div><p className="text-2xl font-bold text-text">98%</p><p className="text-sm text-text-muted">Success Rate</p></div>
            <div className="w-px h-10 bg-border"></div>
            <div><p className="text-2xl font-bold text-text">7 days</p><p className="text-sm text-text-muted">Avg. Processing</p></div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-6 bg-muted/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-text mb-2">Our Services</h2>
            <p className="text-text-muted">Comprehensive business registration services in Nigeria</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map(({ name, price, duration }) => (
              <div key={name} className="card flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-text mb-1">{name}</h3>
                  <p className="text-sm text-text-muted">{duration} processing</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">{price}</p>
                  <Link to="/register" className="text-xs text-primary-600 hover:underline">Apply →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-text mb-2">Why Choose AviLegal?</h2>
            <p className="text-text-muted">We make business registration simple and stress-free</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Clock, title: 'Fast Processing', desc: 'Get your registration done in as little as 3-7 days.' },
              { icon: Shield, title: 'Secure & Confidential', desc: 'Your documents and data are protected with bank-level security.' },
              { icon: Users, title: 'Expert Support', desc: 'Dedicated team of legal experts to guide you.' },
              { icon: Award, title: 'Guaranteed Results', desc: '98% success rate with full money-back guarantee.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-text mb-1">{title}</h3>
                  <p className="text-sm text-text-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-muted/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-text mb-2">How It Works</h2>
            <p className="text-text-muted">Get your business registered in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Create Account', desc: 'Sign up in just 2 minutes' },
              { step: 2, title: 'Choose Service', desc: 'Select your registration type' },
              { step: 3, title: 'Submit Details', desc: 'Fill in your business info' },
              { step: 4, title: 'Get Registered', desc: 'Receive your documents' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">{step}</div>
                <h3 className="font-semibold text-text mb-1">{title}</h3>
                <p className="text-sm text-text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="summary-card text-center py-12 px-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">Ready to Register Your Business?</h2>
            <p className="text-primary-100 mb-6 max-w-md mx-auto">Join thousands of Nigerian entrepreneurs who have successfully incorporated their businesses with AviLegal.</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-600 font-medium px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors">
              Start Your Application <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                ) : (
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <Building2 size={18} className="text-white" />
                  </div>
                )}
                <span className="text-lg font-semibold text-text">AviLegal</span>
              </Link>
              <p className="text-sm text-text-muted max-w-xs">Professional business registration and legal services in Nigeria.</p>
            </div>
            <div className="flex gap-12">
              <div>
                <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">Services</h4>
                <div className="space-y-2">
                  <a href="#services" className="block text-sm text-text hover:text-primary-600">Company Registration</a>
                  <a href="#services" className="block text-sm text-text hover:text-primary-600">Business Name</a>
                  <a href="#services" className="block text-sm text-text hover:text-primary-600">Trademark</a>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">Legal</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-sm text-text hover:text-primary-600">Privacy</a>
                  <a href="#" className="block text-sm text-text hover:text-primary-600">Terms</a>
                  <a href="#" className="block text-sm text-text hover:text-primary-600">FAQ</a>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-border text-center">
            <p className="text-sm text-text-muted">© 2024 AviLegal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
