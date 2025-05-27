import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  XMarkIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import api from '@/services/authService'

interface PaymentDetailsProps {
  paymentId: string
  isOpen: boolean
  onClose: () => void
}

const PaymentDetails = ({ paymentId, isOpen, onClose }: PaymentDetailsProps) => {
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'late_fee',
    amount: '',
    reason: ''
  })

  const queryClient = useQueryClient()

  // Get payment details
  const { data: payment, isLoading } = useQuery({
    queryKey: ['payment-details', paymentId],
    queryFn: async () => {
      const response = await api.get(`/payments/${paymentId}`)
      return response.data.data
    },
    enabled: !!paymentId && isOpen
  })

  // Apply late fee mutation
  const applyLateFee = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/payments/${paymentId}/late-fee`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Late fee applied successfully')
      queryClient.invalidateQueries({ queryKey: ['payment-details', paymentId] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setShowAdjustmentModal(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to apply late fee')
    }
  })

  // Waive late fee mutation
  const waiveLateFee = useMutation({
    mutationFn: async (reason: string) => {
      const response = await api.post(`/payments/${paymentId}/waive-late-fee`, { reason })
      return response.data
    },
    onSuccess: () => {
      toast.success('Late fee waived successfully')
      queryClient.invalidateQueries({ queryKey: ['payment-details', paymentId] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to waive late fee')
    }
  })

  // Apply discount mutation
  const applyDiscount = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/payments/${paymentId}/discount`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Discount applied successfully')
      queryClient.invalidateQueries({ queryKey: ['payment-details', paymentId] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setShowAdjustmentModal(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to apply discount')
    }
  })

  const handleAdjustment = () => {
    if (adjustmentData.type === 'late_fee') {
      applyLateFee.mutate({
        amount: parseFloat(adjustmentData.amount),
        reason: adjustmentData.reason
      })
    } else if (adjustmentData.type === 'discount_fixed') {
      applyDiscount.mutate({
        type: 'fixed',
        value: parseFloat(adjustmentData.amount),
        reason: adjustmentData.reason
      })
    } else if (adjustmentData.type === 'discount_percentage') {
      applyDiscount.mutate({
        type: 'percentage',
        value: parseFloat(adjustmentData.amount),
        reason: adjustmentData.reason
      })
    }
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Details */}
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Payment ID</label>
                      <p className="mt-1 text-sm text-gray-900 font-mono">{payment?._id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Type</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{payment?.type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Amount</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        ${payment?.amount} {payment?.currency}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment?.status)}`}>
                        {payment?.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Due Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {payment?.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Paid Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {payment?.paidDate ? new Date(payment.paidDate).toLocaleDateString() : 'Not paid'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{payment?.description}</p>
                  </div>
                </div>

                {/* Academic Period */}
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Period</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Semester</label>
                      <p className="mt-1 text-sm text-gray-900">{payment?.semester}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Academic Year</label>
                      <p className="mt-1 text-sm text-gray-900">{payment?.academicYear}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Method & Transaction */}
                {payment?.paymentMethod && (
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Payment Method</label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">
                          {payment.paymentMethod.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Transaction ID</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">
                          {payment.transactionId || 'N/A'}
                        </p>
                      </div>
                    </div>
                    {payment.notes && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-500">Notes</label>
                        <p className="mt-1 text-sm text-gray-900">{payment.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Late Fee & Discount Information */}
                {(payment?.lateFee?.amount > 0 || payment?.discount) && (
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Adjustments</h3>
                    
                    {payment?.lateFee?.amount > 0 && (
                      <div className="mb-4 p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-800">Late Fee</p>
                            <p className="text-lg font-semibold text-red-900">
                              ${payment.lateFee.amount}
                            </p>
                            <p className="text-xs text-red-600">
                              Applied: {new Date(payment.lateFee.appliedDate).toLocaleDateString()}
                            </p>
                          </div>
                          {!payment.lateFee.waived && payment.status !== 'paid' && (
                            <button
                              onClick={() => waiveLateFee.mutate('Administrative waiver')}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Waive Fee
                            </button>
                          )}
                          {payment.lateFee.waived && (
                            <span className="text-green-600 text-sm">Waived</span>
                          )}
                        </div>
                      </div>
                    )}

                    {payment?.discount && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Discount Applied</p>
                        <p className="text-lg font-semibold text-green-900">
                          {payment.discount.type === 'percentage' 
                            ? `${payment.discount.value}%` 
                            : `$${payment.discount.value}`
                          }
                        </p>
                        <p className="text-xs text-green-600">
                          Reason: {payment.discount.reason}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Audit Log */}
                {payment?.auditLog?.length > 0 && (
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Log</h3>
                    <div className="space-y-3">
                      {payment.auditLog.map((log: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {log.action.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-600">{log.details}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Student Information & Actions */}
              <div className="space-y-6">
                {/* Student Details */}
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {payment?.student?.user?.firstName} {payment?.student?.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {payment?.student?.studentId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-900">{payment?.student?.user?.email}</p>
                        <p className="text-sm text-gray-500">{payment?.student?.program}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {payment?.status === 'pending' || payment?.status === 'overdue' ? (
                      <button className="w-full btn-primary">
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Process Payment
                      </button>
                    ) : null}
                    
                    <button
                      onClick={() => setShowAdjustmentModal(true)}
                      className="w-full btn-secondary"
                    >
                      <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                      Apply Adjustment
                    </button>
                    
                    {payment?.status === 'paid' && payment?.type !== 'refund' && (
                      <button className="w-full btn-secondary">
                        <BanknotesIcon className="h-4 w-4 mr-2" />
                        Process Refund
                      </button>
                    )}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Original Amount:</span>
                      <span className="text-sm font-medium">${payment?.amount}</span>
                    </div>
                    {payment?.lateFee?.amount > 0 && !payment?.lateFee?.waived && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Late Fee:</span>
                        <span className="text-sm font-medium text-red-600">+${payment.lateFee.amount}</span>
                      </div>
                    )}
                    {payment?.discount && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Discount:</span>
                        <span className="text-sm font-medium text-green-600">
                          -{payment.discount.type === 'percentage' 
                            ? `${payment.discount.value}%` 
                            : `$${payment.discount.value}`
                          }
                        </span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between">
                      <span className="text-base font-medium text-gray-900">Total Amount:</span>
                      <span className="text-base font-bold text-gray-900">
                        ${payment?.finalAmount || payment?.amount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Adjustment Modal */}
        {showAdjustmentModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Apply Adjustment</h3>
                  <button
                    onClick={() => setShowAdjustmentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adjustment Type
                    </label>
                    <select
                      className="input-field"
                      value={adjustmentData.type}
                      onChange={(e) => setAdjustmentData(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="late_fee">Late Fee</option>
                      <option value="discount_fixed">Fixed Discount</option>
                      <option value="discount_percentage">Percentage Discount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount {adjustmentData.type === 'discount_percentage' ? '(%)' : '($)'}
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="input-field"
                      value={adjustmentData.amount}
                      onChange={(e) => setAdjustmentData(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <textarea
                      required
                      className="input-field"
                      rows={3}
                      value={adjustmentData.reason}
                      onChange={(e) => setAdjustmentData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Reason for adjustment"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowAdjustmentModal(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAdjustment}
                      className="btn-primary flex-1"
                    >
                      Apply Adjustment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentDetails
