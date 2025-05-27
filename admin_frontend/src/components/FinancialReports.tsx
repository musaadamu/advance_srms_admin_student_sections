import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import api from '@/services/authService'

const FinancialReports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    endDate: new Date().toISOString().split('T')[0] // Today
  })
  const [reportType, setReportType] = useState('overview')

  // Get financial statistics
  const { data: financialStats, isLoading } = useQuery({
    queryKey: ['financial-stats', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      const response = await api.get(`/payments/financial-reports?${params.toString()}`)
      return response.data.data
    }
  })

  // Get payment trends
  const { data: paymentTrends } = useQuery({
    queryKey: ['payment-trends', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        groupBy: 'month'
      })
      const response = await api.get(`/payments/trends?${params.toString()}`)
      return response.data.data
    }
  })

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  const downloadReport = async (format: 'pdf' | 'excel') => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format,
        type: reportType
      })

      const response = await api.get(`/payments/reports/download?${params.toString()}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `financial-report-${new Date().toISOString().split('T')[0]}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Financial Reports</h1>
            <p className="mt-1 text-blue-100">
              Comprehensive financial analytics and reporting
            </p>
          </div>
          <ChartBarIcon className="h-16 w-16 text-blue-200" />
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Report Configuration</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => downloadReport('pdf')}
              className="btn-secondary flex items-center space-x-2"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => downloadReport('excel')}
              className="btn-secondary flex items-center space-x-2"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              className="input-field"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="overview">Overview</option>
              <option value="detailed">Detailed</option>
              <option value="by_department">By Department</option>
              <option value="by_student">By Student</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="input-field"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              className="input-field"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${financialStats?.totalRevenue?.toLocaleString() || 0}
              </p>
              <div className="flex items-center text-sm">
                {financialStats?.revenueGrowth >= 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={financialStats?.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(financialStats?.revenueGrowth || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">
                ${financialStats?.totalOutstanding?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-500">
                {financialStats?.outstandingCount || 0} payments
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${financialStats?.totalOverdue?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-500">
                {financialStats?.overdueCount || 0} payments
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Collection Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {financialStats?.collectionRate?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-gray-500">
                This period
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={paymentTrends?.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Types Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={financialStats?.paymentTypeDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {(financialStats?.paymentTypeDistribution || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Collections */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Collections</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentTrends?.monthlyCollections || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Collections']} />
              <Bar dataKey="collected" fill="#82ca9d" />
              <Bar dataKey="outstanding" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Summary */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status Summary</h3>
          <div className="space-y-4">
            {financialStats?.statusSummary?.map((status: any) => (
              <div key={status._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    status._id === 'paid' ? 'bg-green-500' :
                    status._id === 'pending' ? 'bg-yellow-500' :
                    status._id === 'overdue' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {status._id}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ${status.totalAmount?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {status.count} payments
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Outstanding Payments</h3>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Overdue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {financialStats?.topOutstanding?.map((payment: any) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.student?.user?.firstName} {payment.student?.user?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {payment.student?.studentId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                      {payment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${payment.amount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      payment.daysOverdue > 30 ? 'text-red-600' :
                      payment.daysOverdue > 0 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {payment.daysOverdue > 0 ? `${payment.daysOverdue} days` : 'On time'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FinancialReports
