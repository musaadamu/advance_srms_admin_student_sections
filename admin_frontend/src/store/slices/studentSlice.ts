import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../api/config'

export interface Student {
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
  studentId: string
  program: string
  department?: string
  faculty?: string
  year: number
  semester: number
  gpa: number
  status: string
  admissionDate: string
  expectedGraduation?: string
  // Additional fields from comprehensive form
  middleName?: string
  nationality?: string
  stateOfOrigin?: string
  localGovernment?: string
  religion?: string
  maritalStatus?: string
  bloodGroup?: string
  genotype?: string
  permanentAddress?: any
  contactAddress?: any
  nextOfKin?: any
  sponsor?: any
  parent?: any
  medicalInfo?: any
  createdAt: string
  updatedAt: string
}

interface StudentState {
  students: Student[]
  selectedStudent: Student | null
  studentStats: {
    totalStudents: number
    activeStudents: number
    newThisMonth: number
    programCount: number
    studentsByProgram: Array<{ _id: string; count: number }>
    studentsByYear: Array<{ _id: number; count: number }>
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
    program: string
    year: string
    status: string
  }
}

const initialState: StudentState = {
  students: [],
  selectedStudent: null,
  studentStats: null,
  pagination: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    program: '',
    year: '',
    status: '',
  },
}

// Async thunks
export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (params: { page?: number; limit?: number; search?: string; program?: string; year?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.search) queryParams.append('search', params.search)
      if (params.program) queryParams.append('program', params.program)
      if (params.year) queryParams.append('year', params.year)
      if (params.status) queryParams.append('status', params.status)

      const response = await apiClient.get(`/students?${queryParams.toString()}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch students')
    }
  }
)

export const fetchStudentById = createAsyncThunk(
  'students/fetchStudentById',
  async (studentId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/students/${studentId}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch student')
    }
  }
)

export const createStudent = createAsyncThunk(
  'students/createStudent',
  async (studentData: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/students', studentData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create student')
    }
  }
)

export const updateStudent = createAsyncThunk(
  'students/updateStudent',
  async ({ studentId, studentData }: { studentId: string; studentData: any }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/students/${studentId}`, studentData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update student')
    }
  }
)

export const deleteStudent = createAsyncThunk(
  'students/deleteStudent',
  async (studentId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/students/${studentId}`)
      return studentId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete student')
    }
  }
)

export const fetchStudentStats = createAsyncThunk(
  'students/fetchStudentStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/students/stats')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch student statistics')
    }
  }
)

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = { search: '', program: '', year: '', status: '' }
    },
    clearError: (state) => {
      state.error = null
    },
    setSelectedStudent: (state, action) => {
      state.selectedStudent = action.payload
    },
    clearSelectedStudent: (state) => {
      state.selectedStudent = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Students
      .addCase(fetchStudents.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.isLoading = false
        state.students = action.payload.data
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Student by ID
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.selectedStudent = action.payload
      })
      // Create Student
      .addCase(createStudent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.isLoading = false
        state.students.unshift(action.payload)
        state.error = null
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Student
      .addCase(updateStudent.fulfilled, (state, action) => {
        const index = state.students.findIndex(student => student._id === action.payload._id)
        if (index !== -1) {
          state.students[index] = action.payload
        }
        if (state.selectedStudent?._id === action.payload._id) {
          state.selectedStudent = action.payload
        }
      })
      // Delete Student
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.students = state.students.filter(student => student._id !== action.payload)
        if (state.selectedStudent?._id === action.payload) {
          state.selectedStudent = null
        }
      })
      // Fetch Student Stats
      .addCase(fetchStudentStats.fulfilled, (state, action) => {
        state.studentStats = action.payload
      })
  },
})

export const { setFilters, clearFilters, clearError, setSelectedStudent, clearSelectedStudent } = studentSlice.actions
export default studentSlice.reducer
