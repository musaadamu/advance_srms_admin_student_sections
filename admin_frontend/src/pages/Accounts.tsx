import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  CreditCardIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import api from '@/services/authService'
import PaymentDetails from '@/components/PaymentDetails'
import FinancialReports from '@/components/FinancialReports'

interface PaymentModalProps {
  payment: any
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit' | 'process' | 'refund'
}

const PaymentModal = ({ payment, isOpen, onClose, mode }: PaymentModalProps) => {
  const [formData, setFormData] = useState({
    student: payment?.student?._id || '',
    type: payment?.type || 'tuition',
    amount: payment?.amount || '',
    description: payment?.description || '',
    dueDate: payment?.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : '',
    semester: payment?.semester || 'Fall',
    academicYear: payment?.academicYear || '2024-2025',
    paymentMethod: 'credit_card',
    transactionId: '',
    notes: '',
    refundAmount: payment?.amount || '',
    refundReason: ''
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (mode === 'create') {
        const response = await api.post('/payments', data)
        return response.data
      } else if (mode === 'edit') {
        const response = await api.put(`/payments/${payment._id}`, data)
        return response.data
      } else if (mode === 'process') {
        const response = await api.post(`/payments/${payment._id}/process`, data)
        return response.data
      } else if (mode === 'refund') {
        const response = await api.post(`/payments/${payment._id}/refund`, data)
        return response.data
      }
    },
    onSuccess: () => {
      toast.success(`Payment ${mode}d successfully!`)
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['payment-stats'] })
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || `Failed to ${mode} payment`)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {mode === 'create' && 'Create Payment'}
              {mode === 'edit' && 'Edit Payment'}
              {mode === 'process' && 'Process Payment'}
              {mode === 'refund' && 'Refund Payment'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'create' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.student}
                    onChange={(e) => setFormData(prev => ({ ...prev, student: e.target.value }))}
                    placeholder="Enter student ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                  <select
                    className="input-field"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="tuition">Tuition</option>
                    <option value="registration">Registration</option>
                    <option value="library">Library</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="examination">Examination</option>
                    <option value="accommodation">Accommodation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="input-field"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    className="input-field"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <select
                      className="input-field"
                      value={formData.semester}
                      onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                    >
                      <option value="Fall">Fall</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                    <input
                      type="text"
                      required
                      pattern="\d{4}-\d{4}"
                      placeholder="2024-2025"
                      className="input-field"
                      value={formData.academicYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            )}

            {mode === 'process' && (
              <>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{payment?.description}</p>
                  <p className="text-2xl font-bold text-gray-900">${payment?.amount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    className="input-field"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.transactionId}
                    onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optional notes"
                  />
                </div>
              </>
            )}

            {mode === 'refund' && (
              <>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{payment?.description}</p>
                  <p className="text-2xl font-bold text-gray-900">Original: ${payment?.amount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={payment?.amount}
                    step="0.01"
                    className="input-field"
                    value={formData.refundAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, refundAmount: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Refund Reason</label>
                  <textarea
                    required
                    className="input-field"
                    rows={3}
                    value={formData.refundReason}
                    onChange={(e) => setFormData(prev => ({ ...prev, refundReason: e.target.value }))}
                    placeholder="Reason for refund"
                  />
                </div>
              </>
            )}

            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="btn-primary flex-1"
              >
                {mutation.isPending ? 'Processing...' :
                  mode === 'create' ? 'Create Payment' :
                  mode === 'edit' ? 'Update Payment' :
                  mode === 'process' ? 'Process Payment' :
                  'Process Refund'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const Accounts = () => {
  const [activeTab, setActiveTab] = useState<'payments' | 'reports'>('payments')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('')
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'process' | 'refund'>('create')
  const [showModal, setShowModal] = useState(false)
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)

  // Get payment statistics
  const { data: paymentStats } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: async () => {
      const response = await api.get('/payments/stats')
      return response.data.data
    }
  })

  // Get payments with filtering
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['payments', search, statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)

      const response = await api.get(`/payments?${params.toString()}`)
      return response.data
    }
  })

  const openModal = (mode: 'create' | 'edit' | 'process' | 'refund', payment?: any) => {
    setModalMode(mode)
    setSelectedPayment(payment)
    setShowModal(true)
  }

  const openPaymentDetails = (paymentId: string) => {
    setSelectedPaymentId(paymentId)
    setShowPaymentDetails(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tuition':
        return <CreditCardIcon className="h-5 w-5" />
      case 'registration':
        return <DocumentTextIcon className="h-5 w-5" />
      case 'refund':
        return <ArrowPathIcon className="h-5 w-5" />
      default:
        return <BanknotesIcon className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Accounts & Payment Management</h1>
            <p className="mt-1 text-green-100">
              Manage student payments, process transactions, and handle financial adjustments
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => openModal('create')}
              className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create Payment</span>
            </button>
            <CreditCardIcon className="h-16 w-16 text-green-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payments'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CreditCardIcon className="h-5 w-5 inline mr-2" />
            Payment Management
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ChartBarIcon className="h-5 w-5 inline mr-2" />
            Financial Reports
          </button>
        </nav>
      </div>

      {activeTab === 'reports' ? (
        <FinancialReports />
      ) : (
        <>
          {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                {paymentStats?.totalPayments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Paid</p>
              <p className="text-2xl font-bold text-gray-900">
                ${paymentStats?.statusStats?.find((s: any) => s._id === 'paid')?.totalAmount?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                ${paymentStats?.statusStats?.find((s: any) => s._id === 'pending')?.totalAmount?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${paymentStats?.statusStats?.find((s: any) => s._id === 'overdue')?.totalAmount?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Payment Records</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            className="input-field"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="tuition">Tuition</option>
            <option value="registration">Registration</option>
            <option value="library">Library</option>
            <option value="laboratory">Laboratory</option>
            <option value="examination">Examination</option>
            <option value="accommodation">Accommodation</option>
            <option value="refund">Refund</option>
          </select>
          <button
            onClick={() => openModal('create')}
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Payment
          </button>
        </div>

        {/* Payment Table */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentsData?.data?.map((payment: any) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.userData?.firstName} {payment.userData?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {payment.studentData?.studentId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.userData?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {getTypeIcon(payment.type)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.description}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.type} • {payment.semester} {payment.academicYear}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${payment.amount}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.dueDate).toLocaleDateString()}
                      {payment.paidDate && (
                        <div className="text-green-600">
                          Paid: {new Date(payment.paidDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openPaymentDetails(payment._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>

                        {payment.status === 'pending' || payment.status === 'overdue' ? (
                          <button
                            onClick={() => openModal('process', payment)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Process
                          </button>
                        ) : null}

                        <button
                          onClick={() => openModal('edit', payment)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>

                        {payment.status === 'paid' && payment.type !== 'refund' && (
                          <button
                            onClick={() => openModal('refund', payment)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {paymentsData?.pagination && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((paymentsData.pagination.page - 1) * paymentsData.pagination.limit) + 1} to{' '}
              {Math.min(paymentsData.pagination.page * paymentsData.pagination.limit, paymentsData.pagination.total)} of{' '}
              {paymentsData.pagination.total} payments
            </div>
            <div className="flex space-x-2">
              <button
                disabled={paymentsData.pagination.page === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={paymentsData.pagination.page === paymentsData.pagination.pages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
        </>
      )}

      {/* Payment Modal */}
      <PaymentModal
        payment={selectedPayment}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
      />

      {/* Payment Details Modal */}
      <PaymentDetails
        paymentId={selectedPaymentId}
        isOpen={showPaymentDetails}
        onClose={() => setShowPaymentDetails(false)}
      />
    </div>
  )
}

export default Accounts
