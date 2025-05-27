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
let globalStudentAuthState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
}

let studentAuthStateListeners: Array<(state: AuthState) => void> = []

const notifyStudentListeners = (newState: AuthState) => {
  globalStudentAuthState = newState
  studentAuthStateListeners.forEach(listener => listener(newState))
}

export const useAuthStore = () => {
  const [authState, setAuthState] = useState<AuthState>(globalStudentAuthState)

  useEffect(() => {
    // Add this component as a listener
    studentAuthStateListeners.push(setAuthState)

    // Initialize auth only once globally
    if (globalStudentAuthState.isLoading) {
      initializeStudentAuth()
    }

    // Cleanup listener on unmount
    return () => {
      studentAuthStateListeners = studentAuthStateListeners.filter(listener => listener !== setAuthState)
    }
  }, [])

  const initializeStudentAuth = async () => {
    console.log('🔄 Initializing student authentication...')

    try {
      const token = localStorage.getItem('token')
      console.log('📋 Student token found in localStorage:', !!token)

      if (token) {
        console.log('👤 Fetching student user profile...')
        const user = await authService.getCurrentUser()
        console.log('✅ Student user profile retrieved:', user?.email)

        const newState: AuthState = {
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        }
        notifyStudentListeners(newState)
      } else {
        console.log('❌ No student token found, user not authenticated')
        const newState: AuthState = {
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        }
        notifyStudentListeners(newState)
      }
    } catch (error) {
      console.error('❌ Student auth initialization failed:', error)
      localStorage.removeItem('token')
      const newState: AuthState = {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      }
      notifyStudentListeners(newState)
    }
  }

  const login = async (email: string, password: string) => {
    console.log('🔐 Starting student login process for:', email)

    // Set loading state
    const loadingState: AuthState = {
      ...globalStudentAuthState,
      isLoading: true,
    }
    notifyStudentListeners(loadingState)

    try {
      const response = await authService.login(email, password)
      console.log('📨 Student login response received:', response)

      // AuthService returns { user, token } directly
      const { user, token } = response

      if (!user || !token) {
        console.error('❌ Invalid student response structure:', response)
        throw new Error('Invalid login response - missing user or token')
      }

      // Store token in localStorage
      localStorage.setItem('token', token)
      console.log('💾 Student token stored in localStorage')

      // Update global auth state
      const newState: AuthState = {
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      }

      console.log('✅ Student login successful, updating auth state')
      notifyStudentListeners(newState)

      return { user, token }
    } catch (error) {
      console.error('❌ Student login failed:', error)

      // Reset to unauthenticated state
      const errorState: AuthState = {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      }
      notifyStudentListeners(errorState)
      throw error
    }
  }

  const logout = () => {
    console.log('🚪 Starting student logout process...')

    // Clear token from localStorage
    localStorage.removeItem('token')
    console.log('🗑️ Student token removed from localStorage')

    // Reset global auth state
    const loggedOutState: AuthState = {
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    }

    console.log('✅ Student logout successful, auth state cleared')
    notifyStudentListeners(loggedOutState)
  }

  const updateUser = (updatedUser: User) => {
    const updatedState: AuthState = {
      ...globalStudentAuthState,
      user: updatedUser,
    }
    notifyStudentListeners(updatedState)
  }

  return {
    ...authState,
    login,
    logout,
    updateUser,
  }
}
