import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  CreditCardIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import api from '@/services/authService'

interface PaymentModalProps {
  payment: any
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
}

const PaymentModal = ({ payment, isOpen, onClose, onPaymentSuccess }: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })

  const payMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await api.post(`/payments/${payment._id}/pay`, paymentData)
      return response.data
    },
    onSuccess: () => {
      toast.success('Payment successful!')
      onPaymentSuccess()
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Payment failed')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    payMutation.mutate({
      paymentMethod,
      cardDetails: paymentMethod === 'credit_card' ? cardDetails : undefined
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Make Payment</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{payment?.description}</p>
            <p className="text-2xl font-bold text-gray-900">${payment?.amount}</p>
            <p className="text-sm text-gray-500">Due: {new Date(payment?.dueDate).toLocaleDateString()}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="input-field"
              >
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="online">Online Payment</option>
              </select>
            </div>

            {paymentMethod === 'credit_card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={cardDetails.cardholderName}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1234 5678 9012 3456"
                    className="input-field"
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      className="input-field"
                      value={cardDetails.expiryDate}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      className="input-field"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={payMutation.isPending}
                className="btn-primary flex-1"
              >
                {payMutation.isPending ? 'Processing...' : `Pay $${payment?.amount}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const Payments = () => {
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const queryClient = useQueryClient()

  // Get payment summary
  const { data: paymentSummary } = useQuery({
    queryKey: ['payment-summary'],
    queryFn: async () => {
      const response = await api.get('/payments/summary')
      return response.data.data
    }
  })

  // Get payment history
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['payments', filterStatus, filterType],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filterStatus) params.append('status', filterStatus)
      if (filterType) params.append('type', filterType)
      
      const response = await api.get(`/payments?${params.toString()}`)
      return response.data
    }
  })

  const handlePayment = (payment: any) => {
    setSelectedPayment(payment)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['payments'] })
    queryClient.invalidateQueries({ queryKey: ['payment-summary'] })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
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
            <h1 className="text-2xl font-bold">Payment Center</h1>
            <p className="mt-1 text-green-100">
              Manage your tuition and fee payments
            </p>
          </div>
          <CreditCardIcon className="h-16 w-16 text-green-200" />
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Due</p>
              <p className="text-2xl font-bold text-gray-900">
                ${paymentSummary?.totalDue || 0}
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
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${paymentSummary?.totalOverdue || 0}
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
              <p className="text-sm font-medium text-gray-500">Paid This Year</p>
              <p className="text-2xl font-bold text-gray-900">
                ${paymentSummary?.totalPaid || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Next Due</p>
              <p className="text-sm font-bold text-gray-900">
                {paymentSummary?.upcomingPayments?.[0] 
                  ? new Date(paymentSummary.upcomingPayments[0].dueDate).toLocaleDateString()
                  : 'None'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {paymentSummary?.totalOverdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Overdue Payments</h3>
              <p className="mt-1 text-sm text-red-700">
                You have ${paymentSummary.totalOverdue} in overdue payments. Please pay immediately to avoid late fees.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Payment History</h2>
          
          {/* Filters */}
          <div className="flex space-x-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="tuition">Tuition</option>
              <option value="registration">Registration</option>
              <option value="library">Library</option>
              <option value="laboratory">Laboratory</option>
              <option value="examination">Examination</option>
            </select>
          </div>
        </div>

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
                    Description
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {payment.status === 'pending' || payment.status === 'overdue' ? (
                        <button
                          onClick={() => handlePayment(payment)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Pay Now
                        </button>
                      ) : payment.status === 'paid' ? (
                        <span className="text-green-600">Paid</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        payment={selectedPayment}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

export default Payments
