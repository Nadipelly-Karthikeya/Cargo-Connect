import { createContext, useState, useEffect, useContext } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await authAPI.getMe()
      setUser(response.data.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const register = async (data) => {
    try {
      const response = await authAPI.register(data)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' }
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      setUser(user)
      
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' }
    }
  }

  const verifyEmail = async (email, token) => {
    try {
      const response = await authAPI.verifyEmail({ email, token })
      const { token: authToken, user } = response.data
      
      localStorage.setItem('token', authToken)
      setUser(user)
      
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Verification failed' }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  const updateUser = async (data) => {
    try {
      const response = await authAPI.updateProfile(data)
      setUser(response.data.user)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Update failed' }
    }
  }

  const value = {
    user,
    loading,
    register,
    login,
    verifyEmail,
    logout,
    updateUser,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
