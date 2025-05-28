import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/hooks/useAuthStore'
import { getDashboardWidgets } from '@/config/roles'
import api from '@/services/authService'
import {
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  DocumentTextIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

interface DashboardWidgetProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<any>
  color: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend
}) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend.isPositive ? '+' : ''}{trend.value}%
                  </div>
                )}
              </dd>
              {subtitle && (
                <dd className="text-sm text-gray-500">{subtitle}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

const DashboardWidgets: React.FC = () => {
  const { user } = useAuthStore()

  if (!user) return null

  const allowedWidgets = getDashboardWidgets(user.role)

  // Fetch dashboard statistics
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/statistics/dashboard')
      return response.data.data
    },
    enabled: !!user
  })

  // Fetch individual stats for fallback
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await api.get('/users/stats')
      return response.data.data
    },
    enabled: !!user
  })

  const { data: studentStats } = useQuery({
    queryKey: ['student-stats'],
    queryFn: async () => {
      const response = await api.get('/students/stats')
      return response.data.data
    },
    enabled: !!user
  })

  const { data: courseStats } = useQuery({
    queryKey: ['course-stats'],
    queryFn: async () => {
      const response = await api.get('/courses/stats')
      return response.data.data
    },
    enabled: !!user
  })

  const renderWidget = (widgetType: string) => {
    switch (widgetType) {
      case 'system_overview':
        return (
          <DashboardWidget
            key="system_overview"
            title="System Status"
            value="Operational"
            subtitle="All systems running"
            icon={ChartBarIcon}
            color="text-green-600"
          />
        )

      case 'user_statistics':
        return (
          <DashboardWidget
            key="user_statistics"
            title="Total Users"
            value={dashboardStats?.users?.total || userStats?.totalUsers || 0}
            subtitle="Active users"
            icon={UsersIcon}
            color="text-blue-600"
            trend={{ value: 12, isPositive: true }}
          />
        )

      case 'academic_overview':
        return (
          <DashboardWidget
            key="academic_overview"
            title="Active Courses"
            value={dashboardStats?.academic?.courses?.active || courseStats?.activeCourses || 0}
            subtitle="This semester"
            icon={BookOpenIcon}
            color="text-purple-600"
          />
        )

      case 'financial_summary':
        return (
          <DashboardWidget
            key="financial_summary"
            title="Fee Collection"
            value={dashboardStats?.financial?.summary?.paidAmount ?
              `₦${(dashboardStats.financial.summary.paidAmount / 1000000).toFixed(1)}M` :
              '₦0'
            }
            subtitle="This semester"
            icon={CurrencyDollarIcon}
            color="text-green-600"
            trend={{ value: 8, isPositive: true }}
          />
        )

      case 'student_statistics':
        return (
          <DashboardWidget
            key="student_statistics"
            title="Total Students"
            value={dashboardStats?.users?.students || studentStats?.totalStudents || 0}
            subtitle="Enrolled students"
            icon={AcademicCapIcon}
            color="text-indigo-600"
            trend={{ value: 5, isPositive: true }}
          />
        )

      case 'enrollment_overview':
        return (
          <DashboardWidget
            key="enrollment_overview"
            title="New Enrollments"
            value={studentStats?.newThisMonth || 0}
            subtitle="This month"
            icon={AcademicCapIcon}
            color="text-blue-600"
          />
        )

      case 'department_overview':
        return (
          <DashboardWidget
            key="department_overview"
            title="Department Staff"
            value={dashboardStats?.department?.staff || 0}
            subtitle="Active faculty"
            icon={BuildingOfficeIcon}
            color="text-orange-600"
          />
        )

      case 'course_assignments':
        return (
          <DashboardWidget
            key="course_assignments"
            title="Course Assignments"
            value={dashboardStats?.academic?.assignments || 0}
            subtitle="This semester"
            icon={ClipboardDocumentListIcon}
            color="text-purple-600"
          />
        )

      case 'examination_overview':
        return (
          <DashboardWidget
            key="examination_overview"
            title="Upcoming Exams"
            value={dashboardStats?.exams?.upcoming || 0}
            subtitle="Next 30 days"
            icon={ClipboardDocumentListIcon}
            color="text-red-600"
          />
        )

      case 'results_processing':
        return (
          <DashboardWidget
            key="results_processing"
            title="Pending Results"
            value={dashboardStats?.results?.pending || 0}
            subtitle="Awaiting approval"
            icon={DocumentTextIcon}
            color="text-yellow-600"
          />
        )

      case 'payment_overview':
        return (
          <DashboardWidget
            key="payment_overview"
            title="Monthly Payments"
            value={dashboardStats?.financial?.monthly?.monthlyTotal ?
              `₦${(dashboardStats.financial.monthly.monthlyTotal / 1000000).toFixed(1)}M` :
              '₦0'
            }
            subtitle={`${dashboardStats?.financial?.monthly?.monthlyCount || 0} transactions`}
            icon={CurrencyDollarIcon}
            color="text-green-600"
          />
        )

      case 'outstanding_payments':
        return (
          <DashboardWidget
            key="outstanding_payments"
            title="Outstanding Fees"
            value={dashboardStats?.financial?.summary?.pendingAmount ?
              `₦${(dashboardStats.financial.summary.pendingAmount / 1000000).toFixed(1)}M` :
              '₦0'
            }
            subtitle={`${dashboardStats?.financial?.payments?.pending || 0} pending`}
            icon={CurrencyDollarIcon}
            color="text-red-600"
          />
        )

      case 'student_activities':
        return (
          <DashboardWidget
            key="student_activities"
            title="Active Programs"
            value={dashboardStats?.programs?.active || 0}
            subtitle="Student activities"
            icon={HeartIcon}
            color="text-pink-600"
          />
        )

      case 'academic_calendar':
        return (
          <DashboardWidget
            key="academic_calendar"
            title="Calendar Events"
            value={dashboardStats?.calendar?.events || 0}
            subtitle="This month"
            icon={CalendarIcon}
            color="text-indigo-600"
          />
        )

      case 'my_courses':
        return (
          <DashboardWidget
            key="my_courses"
            title="My Courses"
            value={dashboardStats?.lecturer?.courses || 0}
            subtitle="This semester"
            icon={BookOpenIcon}
            color="text-blue-600"
          />
        )

      case 'assigned_students':
        return (
          <DashboardWidget
            key="assigned_students"
            title="My Students"
            value={dashboardStats?.lecturer?.students || 0}
            subtitle="Across all courses"
            icon={AcademicCapIcon}
            color="text-green-600"
          />
        )

      case 'results_pending':
        return (
          <DashboardWidget
            key="results_pending"
            title="Results Pending"
            value={dashboardStats?.lecturer?.pendingResults || 0}
            subtitle="Courses to grade"
            icon={DocumentTextIcon}
            color="text-orange-600"
          />
        )

      case 'system_analytics':
        return (
          <DashboardWidget
            key="system_analytics"
            title="System Performance"
            value="98.5%"
            subtitle="Uptime this month"
            icon={ChartBarIcon}
            color="text-green-600"
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {allowedWidgets.map(widgetType => renderWidget(widgetType))}
    </div>
  )
}

export default DashboardWidgets
