import { useState, useEffect } from 'react'
import { User } from '@/types'
import { authService } from '@/services/authService'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Create a singleton-like behavior for auth state
let globalAuthState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
}

let authStateListeners: Array<(state: AuthState) => void> = []

const notifyListeners = (newState: AuthState) => {
  globalAuthState = newState
  authStateListeners.forEach(listener => listener(newState))
}

export const useAuthStore = () => {
  const [authState, setAuthState] = useState<AuthState>(globalAuthState)

  useEffect(() => {
    // Add this component as a listener
    authStateListeners.push(setAuthState)

    // Initialize auth only once globally
    if (globalAuthState.isLoading) {
      initializeAuth()
    }

    // Cleanup listener on unmount
    return () => {
      authStateListeners = authStateListeners.filter(listener => listener !== setAuthState)
    }
  }, [])

  const initializeAuth = async () => {
    console.log('🔄 Initializing authentication...')

    try {
      const token = localStorage.getItem('token')
      console.log('📋 Token found in localStorage:', !!token)

      if (token) {
        console.log('👤 Fetching user profile...')
        const user = await authService.getCurrentUser()
        console.log('✅ User profile retrieved:', user?.email)

        const newState: AuthState = {
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        }
        notifyListeners(newState)
      } else {
        console.log('❌ No token found, user not authenticated')
        const newState: AuthState = {
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        }
        notifyListeners(newState)
      }
    } catch (error) {
      console.error('❌ Auth initialization failed:', error)
      localStorage.removeItem('token')
      const newState: AuthState = {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      }
      notifyListeners(newState)
    }
  }

  const login = async (email: string, password: string) => {
    console.log('🔐 Starting login process for:', email)

    // Set loading state
    const loadingState: AuthState = {
      ...globalAuthState,
      isLoading: true,
    }
    notifyListeners(loadingState)

    try {
      const response = await authService.login(email, password)
      console.log('📨 Login response received:', response)

      // AuthService returns { user, token } directly
      const { user, token } = response

      if (!user || !token) {
        console.error('❌ Invalid response structure:', response)
        throw new Error('Invalid login response - missing user or token')
      }

      // Store token in localStorage
      localStorage.setItem('token', token)
      console.log('💾 Token stored in localStorage')

      // Update global auth state
      const newState: AuthState = {
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      }

      console.log('✅ Login successful, updating auth state')
      notifyListeners(newState)

      return { user, token }
    } catch (error) {
      console.error('❌ Login failed:', error)

      // Reset to unauthenticated state
      const errorState: AuthState = {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      }
      notifyListeners(errorState)
      throw error
    }
  }

  const logout = () => {
    console.log('🚪 Starting logout process...')

    // Clear token from localStorage
    localStorage.removeItem('token')
    console.log('🗑️ Token removed from localStorage')

    // Reset global auth state
    const loggedOutState: AuthState = {
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    }

    console.log('✅ Logout successful, auth state cleared')
    notifyListeners(loggedOutState)
  }

  const updateUser = (updatedUser: User) => {
    const updatedState: AuthState = {
      ...globalAuthState,
      user: updatedUser,
    }
    notifyListeners(updatedState)
  }

  return {
    ...authState,
    login,
    logout,
    updateUser,
  }
}
