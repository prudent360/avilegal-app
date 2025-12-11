import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

// Pages
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard'
import CustomerApplications from './pages/customer/Applications'
import ApplicationDetails from './pages/customer/ApplicationDetails'
import NewApplication from './pages/customer/NewApplication'
import EditApplication from './pages/customer/EditApplication'
import Documents from './pages/customer/Documents'
import Profile from './pages/customer/Profile'
import PaymentCallback from './pages/customer/PaymentCallback'
import PaymentHistory from './pages/customer/PaymentHistory'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminApplications from './pages/admin/Applications'
import AdminApplicationDetails from './pages/admin/ApplicationDetails'
import AdminDocuments from './pages/admin/DocumentReview'
import AdminSettings from './pages/admin/Settings'
import AdminRoles from './pages/admin/Roles'
import AdminPayments from './pages/admin/Payments'
import AdminPaymentConfig from './pages/admin/PaymentConfig'
import AdminEmailConfig from './pages/admin/EmailConfig'
import AdminServices from './pages/admin/Services'
import AdminProfile from './pages/admin/Profile'

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin, isCustomer } = useAuth()
  
  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If adminOnly route, check if user is admin
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }

  // If customer-only route and user is admin, redirect to admin
  if (!adminOnly && isAdmin() && !isCustomer()) {
    return <Navigate to="/admin" replace />
  }
  
  return children
}

// Public Route (redirect if authenticated)
function PublicRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()
  
  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader"></div>
      </div>
    )
  }
  
  if (user) {
    return <Navigate to={isAdmin() ? '/admin' : '/dashboard'} replace />
  }
  
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      
      {/* Customer Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute><CustomerApplications /></ProtectedRoute>} />
      <Route path="/applications/new" element={<ProtectedRoute><NewApplication /></ProtectedRoute>} />
      <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetails /></ProtectedRoute>} />
      <Route path="/applications/:id/edit" element={<ProtectedRoute><EditApplication /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
      <Route path="/payment/callback" element={<ProtectedRoute><PaymentCallback /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/applications" element={<ProtectedRoute adminOnly><AdminApplications /></ProtectedRoute>} />
      <Route path="/admin/applications/:id" element={<ProtectedRoute adminOnly><AdminApplicationDetails /></ProtectedRoute>} />
      <Route path="/admin/documents" element={<ProtectedRoute adminOnly><AdminDocuments /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute adminOnly><AdminPayments /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
      <Route path="/admin/roles" element={<ProtectedRoute adminOnly><AdminRoles /></ProtectedRoute>} />
      <Route path="/admin/payment-config" element={<ProtectedRoute adminOnly><AdminPaymentConfig /></ProtectedRoute>} />
      <Route path="/admin/email-config" element={<ProtectedRoute adminOnly><AdminEmailConfig /></ProtectedRoute>} />
      <Route path="/admin/services" element={<ProtectedRoute adminOnly><AdminServices /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute adminOnly><AdminProfile /></ProtectedRoute>} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
