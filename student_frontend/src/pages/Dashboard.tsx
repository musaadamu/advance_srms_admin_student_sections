import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/hooks/useAuthStore'
import api from '@/services/authService'

const Dashboard = () => {
  const { user } = useAuthStore()

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const response = await api.get('/students/dashboard')
      return response.data.data
    }
  })

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      const response = await api.get('/students/profile')
      return response.data.data
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const quickStats = [
    {
      name: 'Current GPA',
      value: studentProfile?.gpa?.toFixed(2) || '0.00',
      icon: ChartBarIcon,
      color: 'bg-green-500',
      description: 'Cumulative GPA'
    },
    {
      name: 'Enrolled Courses',
      value: dashboardData?.enrolledCourses?.length || 0,
      icon: BookOpenIcon,
      color: 'bg-blue-500',
      description: 'This semester'
    },
    {
      name: 'Total Credits',
      value: studentProfile?.totalCredits || 0,
      icon: AcademicCapIcon,
      color: 'bg-purple-500',
      description: 'Completed credits'
    },
    {
      name: 'Pending Payments',
      value: `$${dashboardData?.paymentSummary?.totalDue || 0}`,
      icon: CreditCardIcon,
      color: 'bg-orange-500',
      description: 'Outstanding balance'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
            <p className="mt-1 text-primary-100">
              Student ID: {studentProfile?.studentId} • {studentProfile?.program} • Year {studentProfile?.year}
            </p>
          </div>
          <div className="hidden md:block">
            <AcademicCapIcon className="h-16 w-16 text-primary-200" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </dd>
                  <dd className="text-xs text-gray-500">
                    {stat.description}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Important Alerts */}
      {(dashboardData?.paymentSummary?.totalOverdue > 0 || dashboardData?.registrationStatus?.isOpen) && (
        <div className="space-y-3">
          {dashboardData?.paymentSummary?.totalOverdue > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Overdue Payment Alert
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    You have ${dashboardData.paymentSummary.totalOverdue} in overdue payments.
                    <Link to="/payments" className="font-medium underline ml-1">
                      Pay now
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}

          {dashboardData?.registrationStatus?.isOpen && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <ClipboardDocumentListIcon className="h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Course Registration Open
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Registration for {dashboardData.registrationStatus.period?.semester} semester is now open.
                    <Link to="/registration" className="font-medium underline ml-1">
                      Register for courses
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Courses */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Current Courses</h2>
            <Link to="/courses" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData?.enrolledCourses?.slice(0, 4).map((course: any) => (
              <div key={course._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <BookOpenIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{course.courseCode}</p>
                    <p className="text-xs text-gray-500">{course.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{course.credits} credits</p>
                  <p className="text-xs text-gray-500">{course.schedule?.sessions?.[0]?.day}</p>
                </div>
              </div>
            ))}
            {(!dashboardData?.enrolledCourses || dashboardData.enrolledCourses.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">
                No courses enrolled for this semester
              </p>
            )}
          </div>
        </div>

        {/* Recent Grades */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Grades</h2>
            <Link to="/grades" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData?.recentGrades?.slice(0, 4).map((grade: any) => (
              <div key={grade._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{grade.course.courseCode}</p>
                    <p className="text-xs text-gray-500">{grade.course.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    grade.grade === 'A+' || grade.grade === 'A'
                      ? 'bg-green-100 text-green-800'
                      : grade.grade === 'B+' || grade.grade === 'B' || grade.grade === 'B-'
                      ? 'bg-blue-100 text-blue-800'
                      : grade.grade === 'C+' || grade.grade === 'C' || grade.grade === 'C-'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {grade.grade}
                  </span>
                </div>
              </div>
            ))}
            {(!dashboardData?.recentGrades || dashboardData.recentGrades.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">
                No grades available yet
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Deadlines</h2>
            <Link to="/schedule" className="text-sm text-primary-600 hover:text-primary-500">
              View calendar
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData?.upcomingAssessments?.slice(0, 3).map((assessment: any) => (
              <div key={assessment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-orange-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{assessment.title}</p>
                    <p className="text-xs text-gray-500">{assessment.course?.courseCode}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    {new Date(assessment.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">{assessment.type}</p>
                </div>
              </div>
            ))}
            {(!dashboardData?.upcomingAssessments || dashboardData.upcomingAssessments.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">
                No upcoming deadlines
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/registration"
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">Register Courses</span>
            </Link>

            <Link
              to="/payments"
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <CreditCardIcon className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Make Payment</span>
            </Link>

            <Link
              to="/grades"
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <ChartBarIcon className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">View Grades</span>
            </Link>

            <Link
              to="/schedule"
              className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <CalendarDaysIcon className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-900">View Schedule</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Announcements</h2>
        </div>
        <div className="space-y-4">
          {dashboardData?.announcements?.slice(0, 3).map((announcement: any) => (
            <div key={announcement._id} className="border-l-4 border-primary-400 pl-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">{announcement.title}</h3>
                <span className="text-xs text-gray-500">
                  {new Date(announcement.date).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{announcement.content}</p>
            </div>
          ))}
          {(!dashboardData?.announcements || dashboardData.announcements.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-4">
              No recent announcements
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
