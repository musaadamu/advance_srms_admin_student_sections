import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../api/config'

export interface Grade {
  _id: string
  student: string
  course: {
    _id: string
    courseCode: string
    title: string
    credits: number
  }
  semester: string
  year: number
  assignments: Array<{
    name: string
    score: number
    maxScore: number
    weight: number
  }>
  midtermScore?: number
  finalScore?: number
  totalScore: number
  letterGrade: string
  gpa: number
  status: string
  createdAt: string
  updatedAt: string
}

interface GradeState {
  grades: Grade[]
  currentSemesterGrades: Grade[]
  transcript: Grade[]
  gpaHistory: Array<{
    semester: string
    year: number
    gpa: number
    credits: number
  }>
  overallGPA: number
  isLoading: boolean
  error: string | null
  filters: {
    semester: string
    year: string
    course: string
  }
}

const initialState: GradeState = {
  grades: [],
  currentSemesterGrades: [],
  transcript: [],
  gpaHistory: [],
  overallGPA: 0,
  isLoading: false,
  error: null,
  filters: {
    semester: '',
    year: '',
    course: '',
  },
}

// Async thunks
export const fetchGrades = createAsyncThunk(
  'grades/fetchGrades',
  async (params: { semester?: string; year?: string; course?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.semester) queryParams.append('semester', params.semester)
      if (params.year) queryParams.append('year', params.year)
      if (params.course) queryParams.append('course', params.course)

      const response = await apiClient.get(`/students/grades?${queryParams.toString()}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch grades')
    }
  }
)

export const fetchTranscript = createAsyncThunk(
  'grades/fetchTranscript',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/students/transcript')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transcript')
    }
  }
)

export const fetchGPAHistory = createAsyncThunk(
  'grades/fetchGPAHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/students/gpa-history')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch GPA history')
    }
  }
)

const gradeSlice = createSlice({
  name: 'grades',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = { semester: '', year: '', course: '' }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Grades
      .addCase(fetchGrades.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGrades.fulfilled, (state, action) => {
        state.isLoading = false
        state.grades = action.payload.grades
        state.currentSemesterGrades = action.payload.currentSemester || []
        state.overallGPA = action.payload.overallGPA || 0
        state.error = null
      })
      .addCase(fetchGrades.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Transcript
      .addCase(fetchTranscript.fulfilled, (state, action) => {
        state.transcript = action.payload
      })
      // Fetch GPA History
      .addCase(fetchGPAHistory.fulfilled, (state, action) => {
        state.gpaHistory = action.payload
      })
  },
})

export const { setFilters, clearFilters, clearError } = gradeSlice.actions
export default gradeSlice.reducer
