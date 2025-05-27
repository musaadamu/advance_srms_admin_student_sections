import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../api/config'

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
  prerequisites?: string[]
  createdAt: string
  updatedAt: string
}

interface CourseState {
  courses: Course[]
  selectedCourse: Course | null
  courseStats: {
    totalCourses: number
    activeCourses: number
    totalEnrollment: number
    departmentCount: number
    coursesByDepartment: Array<{ _id: string; count: number }>
    coursesByLevel: Array<{ _id: string; count: number }>
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
    level: string
    status: string
  }
}

const initialState: CourseState = {
  courses: [],
  selectedCourse: null,
  courseStats: null,
  pagination: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    department: '',
    level: '',
    status: '',
  },
}

// Async thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (params: { page?: number; limit?: number; search?: string; department?: string; level?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.search) queryParams.append('search', params.search)
      if (params.department) queryParams.append('department', params.department)
      if (params.level) queryParams.append('level', params.level)
      if (params.status) queryParams.append('status', params.status)

      const response = await apiClient.get(`/courses?${queryParams.toString()}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses')
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
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course')
    }
  }
)

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/courses', courseData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create course')
    }
  }
)

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ courseId, courseData }: { courseId: string; courseData: any }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/courses/${courseId}`, courseData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update course')
    }
  }
)

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (courseId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/courses/${courseId}`)
      return courseId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete course')
    }
  }
)

export const fetchCourseStats = createAsyncThunk(
  'courses/fetchCourseStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/courses/stats')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course statistics')
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
      state.filters = { search: '', department: '', level: '', status: '' }
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
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false
        state.courses = action.payload.data
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Course by ID
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.selectedCourse = action.payload
      })
      // Create Course
      .addCase(createCourse.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.isLoading = false
        state.courses.unshift(action.payload)
        state.error = null
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Course
      .addCase(updateCourse.fulfilled, (state, action) => {
        const index = state.courses.findIndex(course => course._id === action.payload._id)
        if (index !== -1) {
          state.courses[index] = action.payload
        }
        if (state.selectedCourse?._id === action.payload._id) {
          state.selectedCourse = action.payload
        }
      })
      // Delete Course
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter(course => course._id !== action.payload)
        if (state.selectedCourse?._id === action.payload) {
          state.selectedCourse = null
        }
      })
      // Fetch Course Stats
      .addCase(fetchCourseStats.fulfilled, (state, action) => {
        state.courseStats = action.payload
      })
  },
})

export const { setFilters, clearFilters, clearError, setSelectedCourse, clearSelectedCourse } = courseSlice.actions
export default courseSlice.reducer
