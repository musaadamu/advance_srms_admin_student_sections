import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../api/config'
import { mockApiService } from '@/services/mockData'

export interface Course {
  _id: string
  courseCode: string
  title: string
  description: string
  credits: number
  level: string
  department: string
  instructor?: {
    _id: string
    user: {
      firstName: string
      lastName: string
    }
    position: string
  }
  maxEnrollment: number
  currentEnrollment: number
  status: string
  schedule?: {
    sessions: Array<{
      day: string
      startTime: string
      endTime: string
      location?: {
        building: string
        room: string
      }
    }>
  }
  prerequisites?: Array<{
    course: {
      courseCode: string
    } | string
    minimumGrade: string
  }>
  materials?: Array<{
    title: string
    author?: string
    isRequired: boolean
  }>
  createdAt: string
  updatedAt: string
}

interface CourseState {
  courses: Course[]
  enrolledCourses: Course[]
  availableCourses: Course[]
  selectedCourse: Course | null
  isLoading: boolean
  error: string | null
  filters: {
    search: string
    department: string
    level: string
  }
}

const initialState: CourseState = {
  courses: [],
  enrolledCourses: [],
  availableCourses: [],
  selectedCourse: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    department: '',
    level: '',
  },
}

// Async thunks
export const fetchAvailableCourses = createAsyncThunk(
  'courses/fetchAvailableCourses',
  async (params: { search?: string; department?: string; level?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.search) queryParams.append('search', params.search)
      if (params.department) queryParams.append('department', params.department)
      if (params.level) queryParams.append('level', params.level)

      const response = await apiClient.get(`/courses/available?${queryParams.toString()}`)
      return response.data.data
    } catch (error: any) {
      // Fallback to mock data for development
      console.warn('API failed, using mock data:', error.message)
      const mockResponse = await mockApiService.getAvailableCourses(params)
      return mockResponse.data.data
    }
  }
)

export const fetchEnrolledCourses = createAsyncThunk(
  'courses/fetchEnrolledCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/students/courses')
      return response.data.data
    } catch (error: any) {
      // Fallback to mock data for development
      console.warn('API failed, using mock data:', error.message)
      const mockResponse = await mockApiService.getEnrolledCourses()
      return mockResponse.data.data
    }
  }
)

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}`)
      return response.data.data
    } catch (error: any) {
      // Fallback to mock data for development
      console.warn('API failed, using mock data:', error.message)
      const mockResponse = await mockApiService.getCourseById(courseId)
      return mockResponse.data.data
    }
  }
)

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = { search: '', department: '', level: '' }
    },
    clearError: (state) => {
      state.error = null
    },
    setSelectedCourse: (state, action) => {
      state.selectedCourse = action.payload
    },
    clearSelectedCourse: (state) => {
      state.selectedCourse = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Available Courses
      .addCase(fetchAvailableCourses.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAvailableCourses.fulfilled, (state, action) => {
        state.isLoading = false
        state.availableCourses = action.payload
        state.error = null
      })
      .addCase(fetchAvailableCourses.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Enrolled Courses
      .addCase(fetchEnrolledCourses.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
        state.isLoading = false
        state.enrolledCourses = action.payload
        state.error = null
      })
      .addCase(fetchEnrolledCourses.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Course by ID
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.selectedCourse = action.payload
      })
  },
})

export const { setFilters, clearFilters, clearError, setSelectedCourse, clearSelectedCourse } = courseSlice.actions
export default courseSlice.reducer
