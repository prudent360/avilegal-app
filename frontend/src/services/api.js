import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/login', data),
  register: (data) => api.post('/register', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/user'),
  getUser: () => api.get('/user'),
  forgotPassword: (email) => api.post('/forgot-password', { email }),
  resetPassword: (data) => api.post('/reset-password', data),
  updateProfile: (data) => api.put('/user/profile', data),
  updatePassword: (data) => api.put('/user/password', data),
}

// KYC/Document APIs
export const kycAPI = {
  getDocuments: () => api.get('/customer/kyc'),
  uploadDocument: (formData) => api.post('/customer/kyc', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteDocument: (id) => api.delete(`/customer/kyc/${id}`),
}

// Application APIs (for business incorporation)
export const applicationAPI = {
  getAll: () => api.get('/customer/applications'),
  getOne: (id) => api.get(`/customer/applications/${id}`),
  getById: (id) => api.get(`/customer/applications/${id}`),
  create: (data) => api.post('/customer/applications', data),
  update: (id, data) => api.put(`/customer/applications/${id}`, data),
  delete: (id) => api.delete(`/customer/applications/${id}`),
}

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/customer/dashboard/stats'),
  getChartData: () => api.get('/customer/dashboard/chart'),
}

// Admin APIs
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getDashboardChart: () => api.get('/admin/dashboard/chart'),
  
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  syncUserRoles: (userId, roles) => api.post(`/admin/users/${userId}/roles`, { roles }),
  
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),

  // Applications
  getApplications: (params) => api.get('/admin/applications', { params }),
  getApplication: (id) => api.get(`/admin/applications/${id}`),
  approveApplication: (id) => api.post(`/admin/applications/${id}/approve`),
  rejectApplication: (id, reason) => api.post(`/admin/applications/${id}/reject`, { reason }),
  updateMilestone: (id, milestoneId) => api.post(`/admin/applications/${id}/update-milestone`, { milestone_id: milestoneId }),
  completeApplication: (id) => api.post(`/admin/applications/${id}/complete`),
  uploadDocumentForCustomer: (applicationId, formData) => api.post(`/admin/applications/${applicationId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Payments
  getPayments: () => api.get('/admin/payments'),

  // KYC
  getKYCDocuments: (params) => api.get('/admin/kyc', { params }),
  approveKYC: (id) => api.post(`/admin/kyc/${id}/approve`),
  rejectKYC: (id, reason) => api.post(`/admin/kyc/${id}/reject`, { reason }),

  // Documents
  getDocuments: () => api.get('/admin/documents'),
  approveDocument: (id) => api.post(`/admin/documents/${id}/approve`),
  rejectDocument: (id, reason) => api.post(`/admin/documents/${id}/reject`, { reason }),

  // Services
  getServices: () => api.get('/admin/services'),
  getService: (id) => api.get(`/admin/services/${id}`),
  createService: (data) => api.post('/admin/services', data),
  updateService: (id, data) => api.put(`/admin/services/${id}`, data),
  deleteService: (id) => api.delete(`/admin/services/${id}`),
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  uploadLogo: (formData) => api.post('/admin/settings/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteLogo: (type) => api.delete(`/admin/settings/logo/${type}`),
  testEmail: (email) => api.post('/admin/settings/test-email', { email }),

  // Email Templates
  getEmailTemplates: () => api.get('/admin/email-templates'),
  getEmailTemplate: (id) => api.get(`/admin/email-templates/${id}`),
  updateEmailTemplate: (id, data) => api.put(`/admin/email-templates/${id}`, data),
  resetEmailTemplate: (id) => api.post(`/admin/email-templates/${id}/reset`),
  testEmailTemplate: (id, email) => api.post(`/admin/email-templates/${id}/test`, { email }),

  // Roles & Permissions
  getRoles: () => api.get('/admin/roles'),
  getRole: (id) => api.get(`/admin/roles/${id}`),
  createRole: (data) => api.post('/admin/roles', data),
  updateRole: (id, data) => api.put(`/admin/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/admin/roles/${id}`),
  getPermissions: () => api.get('/admin/permissions'),
  
  // Staff
  getStaff: () => api.get('/admin/staff'),
  createStaff: (data) => api.post('/admin/staff', data),
}

// Payment APIs
export const paymentAPI = {
  getConfig: () => api.get('/customer/payments/config'),
  initialize: (data) => api.post('/customer/payments/initialize', data),
  verify: (data) => api.post('/customer/payments/verify', data),
  getHistory: () => api.get('/customer/payments/history'),
}

// Services API (for business services)
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getOne: (slug) => api.get(`/services/${slug}`),
}

// Document APIs
export const documentAPI = {
  getTypes: () => api.get('/customer/documents/types'),
  getAll: () => api.get('/customer/documents'),
  upload: (formData) => api.post('/customer/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadSignature: (signature, applicationId) => api.post('/customer/documents/signature', { 
    signature, 
    application_id: applicationId 
  }),
  delete: (id) => api.delete(`/customer/documents/${id}`),
}

export default api

// Public APIs (no auth required)
export const publicAPI = {
  getLogos: () => api.get('/logos'),
}
