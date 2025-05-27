import axios from 'axios'
import { AuthResponse, LoginCredentials, User } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    console.log('Attempting login with:', { email, apiUrl: API_URL })
    const response = await api.post('/auth/login', { email, password })
    console.log('Login response:', response.data)
    // Backend returns { success, message, data: { user, token } }
    return response.data.data
  },

  async register(userData: LoginCredentials & { firstName: string; lastName: string; role: string }): Promise<{ user: User; token: string }> {
    console.log('Attempting registration with:', { ...userData, password: '[HIDDEN]' })
    const response = await api.post('/auth/register', userData)
    console.log('Registration response:', response.data)
    // Backend returns { success, message, data: { user, token } }
    return response.data.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/profile')
    return response.data.data
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put('/auth/profile', userData)
    return response.data.data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    })
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
    localStorage.removeItem('token')
  },
}

export default api
