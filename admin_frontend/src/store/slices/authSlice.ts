import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../api/config'

export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: 'student' | 'staff' | 'admin'
  phone?: string
  isActive: boolean
  isEmailVerified: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('token'),
  error: null,
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      const { user, token } = response.data.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      return { user, token }
    } catch (error: any) {
      return error.response?.data?.message || 'Login failed'
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/register', userData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/auth/profile', profileData)
      const updatedUser = response.data.data
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return updatedUser
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed')
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/auth/change-password', passwordData)
      return response.data.message
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Password change failed')
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/auth/logout')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return null
    } catch (error: any) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return null
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
      })
  },
})

export const { clearError, clearAuth } = authSlice.actions
export default authSlice.reducer
