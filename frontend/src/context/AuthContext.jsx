import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token and validate
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
      // Validate token with backend
      authAPI.getUser()
        .then(res => {
          const userData = res.data.user
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
        })
        .catch(() => {
          // Token invalid
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (data) => {
    const response = await authAPI.login(data)
    const { token, user } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    return user
  }

  const register = async (data) => {
    const response = await authAPI.register(data)
    const { token, user } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    return user
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (e) {
      // Ignore errors
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  // Helper functions for role checking
  const hasRole = (roleName) => {
    if (!user?.roles) return false
    return user.roles.some(r => r.name === roleName)
  }

  const hasAnyRole = (roleNames) => {
    if (!user?.roles) return false
    return user.roles.some(r => roleNames.includes(r.name))
  }

  const isAdmin = () => hasAnyRole(['super_admin', 'admin', 'manager', 'support'])
  const isSuperAdmin = () => hasRole('super_admin')
  const isCustomer = () => hasRole('customer')

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      updateUser,
      hasRole,
      hasAnyRole,
      isAdmin,
      isSuperAdmin,
      isCustomer
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
