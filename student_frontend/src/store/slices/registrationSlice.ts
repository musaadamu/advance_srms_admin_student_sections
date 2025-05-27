import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../api/config'

export interface Registration {
  _id: string
  student: string
  course: {
    _id: string
    courseCode: string
    title: string
    credits: number
    instructor?: {
      user: {
        firstName: string
        lastName: string
      }
    }
  }
  semester: string
  year: number
  status: 'enrolled' | 'dropped' | 'completed' | 'failed'
  enrollmentDate: string
  dropDate?: string
  grade?: string
  createdAt: string
  updatedAt: string
}

interface RegistrationState {
  registrations: Registration[]
  currentRegistrations: Registration[]
  availableSlots: number
  maxCredits: number
  currentCredits: number
  registrationPeriod: {
    startDate: string
    endDate: string
    isOpen: boolean
  } | null
  isLoading: boolean
  error: string | null
}

const initialState: RegistrationState = {
  registrations: [],
  currentRegistrations: [],
  availableSlots: 0,
  maxCredits: 21,
  currentCredits: 0,
  registrationPeriod: null,
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchRegistrations = createAsyncThunk(
  'registration/fetchRegistrations',
  async (params: { semester?: string; year?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.semester) queryParams.append('semester', params.semester)
      if (params.year) queryParams.append('year', params.year)

      const response = await apiClient.get(`/students/registrations?${queryParams.toString()}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch registrations')
    }
  }
)

export const registerForCourse = createAsyncThunk(
  'registration/registerForCourse',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/students/register', { courseId })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Course registration failed')
    }
  }
)

export const dropCourse = createAsyncThunk(
  'registration/dropCourse',
  async (registrationId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/students/registrations/${registrationId}`)
      return registrationId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to drop course')
    }
  }
)

export const fetchRegistrationPeriod = createAsyncThunk(
  'registration/fetchRegistrationPeriod',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/students/registration-period')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch registration period')
    }
  }
)

export const fetchRegistrationSummary = createAsyncThunk(
  'registration/fetchRegistrationSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/students/registration-summary')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch registration summary')
    }
  }
)

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Registrations
      .addCase(fetchRegistrations.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchRegistrations.fulfilled, (state, action) => {
        state.isLoading = false
        state.registrations = action.payload.registrations
        state.currentRegistrations = action.payload.current || []
        state.error = null
      })
      .addCase(fetchRegistrations.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Register for Course
      .addCase(registerForCourse.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerForCourse.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentRegistrations.push(action.payload)
        state.currentCredits += action.payload.course.credits
        state.error = null
      })
      .addCase(registerForCourse.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Drop Course
      .addCase(dropCourse.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(dropCourse.fulfilled, (state, action) => {
        state.isLoading = false
        const droppedRegistration = state.currentRegistrations.find(r => r._id === action.payload)
        if (droppedRegistration) {
          state.currentCredits -= droppedRegistration.course.credits
        }
        state.currentRegistrations = state.currentRegistrations.filter(r => r._id !== action.payload)
        state.error = null
      })
      .addCase(dropCourse.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Registration Period
      .addCase(fetchRegistrationPeriod.fulfilled, (state, action) => {
        state.registrationPeriod = action.payload
      })
      // Fetch Registration Summary
      .addCase(fetchRegistrationSummary.fulfilled, (state, action) => {
        state.currentCredits = action.payload.currentCredits
        state.maxCredits = action.payload.maxCredits
        state.availableSlots = action.payload.availableSlots
      })
  },
})

export const { clearError } = registrationSlice.actions
export default registrationSlice.reducer
