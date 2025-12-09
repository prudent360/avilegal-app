import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor to add auth token
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

// Response interceptor to handle errors
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
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
  forgotPassword: (email) => api.post('/forgot-password', { email }),
}

// Profile APIs
export const profileAPI = {
  get: () => api.get('/customer/profile'),
  update: (data) => api.put('/customer/profile', data),
  updatePassword: (data) => api.put('/customer/profile/password', data),
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
  create: (data) => api.post('/customer/applications', data),
  update: (id, data) => api.put(`/customer/applications/${id}`, data),
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
  syncUserRoles: (userId, roles) => api.post(`/admin/users/${userId}/roles`, { roles }),
  
  // Applications
  getApplications: (params) => api.get('/admin/applications', { params }),
  getApplication: (id) => api.get(`/admin/applications/${id}`),
  approveApplication: (id) => api.post(`/admin/applications/${id}/approve`),
  rejectApplication: (id, reason) => api.post(`/admin/applications/${id}/reject`, { reason }),
  
  // KYC
  getKYCDocuments: (params) => api.get('/admin/kyc', { params }),
  approveKYC: (id) => api.post(`/admin/kyc/${id}/approve`),
  rejectKYC: (id, reason) => api.post(`/admin/kyc/${id}/reject`, { reason }),
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),

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

export default api
