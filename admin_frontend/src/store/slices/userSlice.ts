import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../api/config'
import { User } from './authSlice'

interface UserState {
  users: User[]
  selectedUser: User | null
  userStats: {
    totalUsers: number
    activeUsers: number
    staffCount: number
    studentCount: number
    adminCount: number
    usersByRole: Array<{ _id: string; count: number }>
  } | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  } | null
  isLoading: boolean
  error: string | null
  filters: {
    search: string
    role: string
    status: string
  }
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  userStats: null,
  pagination: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    role: '',
    status: '',
  },
}

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: { page?: number; limit?: number; search?: string; role?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.search) queryParams.append('search', params.search)
      if (params.role) queryParams.append('role', params.role)
      if (params.status) queryParams.append('status', params.status)

      const response = await apiClient.get(`/users?${queryParams.toString()}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/users/${userId}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user')
    }
  }
)

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/register', userData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user')
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, userData }: { userId: string; userData: any }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/users/${userId}`, userData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user')
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/users/${userId}`)
      return userId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user')
    }
  }
)

export const updateUserRole = createAsyncThunk(
  'users/updateUserRole',
  async ({ userId, role }: { userId: string; role: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/users/${userId}/role`, { role })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user role')
    }
  }
)

export const resetUserPassword = createAsyncThunk(
  'users/resetUserPassword',
  async ({ email, newPassword }: { email: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { email, newPassword })
      return response.data.message
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password')
    }
  }
)

export const fetchUserStats = createAsyncThunk(
  'users/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/users/stats')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user statistics')
    }
  }
)

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = { search: '', role: '', status: '' }
    },
    clearError: (state) => {
      state.error = null
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = action.payload.data
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch User by ID
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.users.unshift(action.payload)
        state.error = null
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload._id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        if (state.selectedUser?._id === action.payload._id) {
          state.selectedUser = action.payload
        }
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user._id !== action.payload)
        if (state.selectedUser?._id === action.payload) {
          state.selectedUser = null
        }
      })
      // Update User Role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload._id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
      // Reset Password
      .addCase(resetUserPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch User Stats
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStats = action.payload
      })
  },
})

export const { setFilters, clearFilters, clearError, setSelectedUser, clearSelectedUser } = userSlice.actions
export default userSlice.reducer
