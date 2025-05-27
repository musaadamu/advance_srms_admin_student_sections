import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../api/config'

export interface Payment {
  _id: string
  student: string
  amount: number
  type: 'tuition' | 'fees' | 'accommodation' | 'other'
  description: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod?: string
  transactionId?: string
  dueDate: string
  paidDate?: string
  semester: string
  year: number
  createdAt: string
  updatedAt: string
}

interface PaymentState {
  payments: Payment[]
  pendingPayments: Payment[]
  paymentHistory: Payment[]
  totalOwed: number
  totalPaid: number
  isLoading: boolean
  error: string | null
  filters: {
    status: string
    type: string
    semester: string
    year: string
  }
}

const initialState: PaymentState = {
  payments: [],
  pendingPayments: [],
  paymentHistory: [],
  totalOwed: 0,
  totalPaid: 0,
  isLoading: false,
  error: null,
  filters: {
    status: '',
    type: '',
    semester: '',
    year: '',
  },
}

// Async thunks
export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (params: { status?: string; type?: string; semester?: string; year?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.status) queryParams.append('status', params.status)
      if (params.type) queryParams.append('type', params.type)
      if (params.semester) queryParams.append('semester', params.semester)
      if (params.year) queryParams.append('year', params.year)

      const response = await apiClient.get(`/students/payments?${queryParams.toString()}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments')
    }
  }
)

export const fetchPendingPayments = createAsyncThunk(
  'payments/fetchPendingPayments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/students/payments/pending')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending payments')
    }
  }
)

export const makePayment = createAsyncThunk(
  'payments/makePayment',
  async (paymentData: { paymentId: string; paymentMethod: string; amount: number }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/students/payments/pay', paymentData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Payment failed')
    }
  }
)

export const fetchPaymentSummary = createAsyncThunk(
  'payments/fetchPaymentSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/students/payments/summary')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment summary')
    }
  }
)

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = { status: '', type: '', semester: '', year: '' }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payments
      .addCase(fetchPayments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.isLoading = false
        state.payments = action.payload.payments
        state.paymentHistory = action.payload.history || []
        state.error = null
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Pending Payments
      .addCase(fetchPendingPayments.fulfilled, (state, action) => {
        state.pendingPayments = action.payload
      })
      // Make Payment
      .addCase(makePayment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(makePayment.fulfilled, (state, action) => {
        state.isLoading = false
        // Update payment status in the arrays
        const paymentId = action.payload._id
        state.payments = state.payments.map(p => 
          p._id === paymentId ? action.payload : p
        )
        state.pendingPayments = state.pendingPayments.filter(p => p._id !== paymentId)
        state.error = null
      })
      .addCase(makePayment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Payment Summary
      .addCase(fetchPaymentSummary.fulfilled, (state, action) => {
        state.totalOwed = action.payload.totalOwed
        state.totalPaid = action.payload.totalPaid
      })
  },
})

export const { setFilters, clearFilters, clearError } = paymentSlice.actions
export default paymentSlice.reducer
