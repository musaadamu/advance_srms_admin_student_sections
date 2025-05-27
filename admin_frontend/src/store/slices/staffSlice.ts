import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../api/config'

export interface Staff {
  _id: string
  user: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    dateOfBirth?: string
    gender?: string
  }
  employeeId: string
  position: string
  department: string
  faculty?: string
  hireDate: string
  salary?: number
  status: string
  qualifications?: string[]
  specializations?: string[]
  officeLocation?: string
  officeHours?: string
  createdAt: string
  updatedAt: string
}

interface StaffState {
  staff: Staff[]
  selectedStaff: Staff | null
  staffStats: {
    totalStaff: number
    activeStaff: number
    staffByDepartment: Array<{ _id: string; count: number }>
    staffByPosition: Array<{ _id: string; count: number }>
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
    department: string
    position: string
    status: string
  }
}

const initialState: StaffState = {
  staff: [],
  selectedStaff: null,
  staffStats: null,
  pagination: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    department: '',
    position: '',
    status: '',
  },
}

// Async thunks
export const fetchStaff = createAsyncThunk(
  'staff/fetchStaff',
  async (params: { page?: number; limit?: number; search?: string; department?: string; position?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.search) queryParams.append('search', params.search)
      if (params.department) queryParams.append('department', params.department)
      if (params.position) queryParams.append('position', params.position)
      if (params.status) queryParams.append('status', params.status)

      const response = await apiClient.get(`/staff?${queryParams.toString()}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch staff')
    }
  }
)

export const fetchStaffById = createAsyncThunk(
  'staff/fetchStaffById',
  async (staffId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/staff/${staffId}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch staff member')
    }
  }
)

export const createStaff = createAsyncThunk(
  'staff/createStaff',
  async (staffData: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/staff', staffData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create staff member')
    }
  }
)

export const updateStaff = createAsyncThunk(
  'staff/updateStaff',
  async ({ staffId, staffData }: { staffId: string; staffData: any }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/staff/${staffId}`, staffData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update staff member')
    }
  }
)

export const deleteStaff = createAsyncThunk(
  'staff/deleteStaff',
  async (staffId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/staff/${staffId}`)
      return staffId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete staff member')
    }
  }
)

export const fetchStaffStats = createAsyncThunk(
  'staff/fetchStaffStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/staff/stats')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch staff statistics')
    }
  }
)

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = { search: '', department: '', position: '', status: '' }
    },
    clearError: (state) => {
      state.error = null
    },
    setSelectedStaff: (state, action) => {
      state.selectedStaff = action.payload
    },
    clearSelectedStaff: (state) => {
      state.selectedStaff = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Staff
      .addCase(fetchStaff.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.isLoading = false
        state.staff = action.payload.data
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Staff by ID
      .addCase(fetchStaffById.fulfilled, (state, action) => {
        state.selectedStaff = action.payload
      })
      // Create Staff
      .addCase(createStaff.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.isLoading = false
        state.staff.unshift(action.payload)
        state.error = null
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Staff
      .addCase(updateStaff.fulfilled, (state, action) => {
        const index = state.staff.findIndex(member => member._id === action.payload._id)
        if (index !== -1) {
          state.staff[index] = action.payload
        }
        if (state.selectedStaff?._id === action.payload._id) {
          state.selectedStaff = action.payload
        }
      })
      // Delete Staff
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.staff = state.staff.filter(member => member._id !== action.payload)
        if (state.selectedStaff?._id === action.payload) {
          state.selectedStaff = null
        }
      })
      // Fetch Staff Stats
      .addCase(fetchStaffStats.fulfilled, (state, action) => {
        state.staffStats = action.payload
      })
  },
})

export const { setFilters, clearFilters, clearError, setSelectedStaff, clearSelectedStaff } = staffSlice.actions
export default staffSlice.reducer
