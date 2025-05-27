import { useQuery } from '@tanstack/react-query'
import {
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import api from '@/services/authService'
import { useAuthStore } from '@/hooks/useAuthStore'
import { getRoleByName } from '@/config/roles'
import DashboardWidgets from '@/components/dashboard/DashboardWidgets'

const Dashboard = () => {
  const { user } = useAuthStore()
  const userRoleInfo = user ? getRoleByName(user.role) : null
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await api.get('/users/stats')
      return response.data.data
    }
  })

  const { data: studentStats } = useQuery({
    queryKey: ['student-stats'],
    queryFn: async () => {
      const response = await api.get('/students/stats')
      return response.data.data
    }
  })

  const { data: courseStats } = useQuery({
    queryKey: ['course-stats'],
    queryFn: async () => {
      const response = await api.get('/courses/stats')
      return response.data.data
    }
  })

  const stats = [
    {
      name: 'Total Users',
      value: userStats?.totalUsers || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Active Students',
      value: studentStats?.activeStudents || 0,
      icon: AcademicCapIcon,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Total Courses',
      value: courseStats?.totalCourses || 0,
      icon: BookOpenIcon,
      color: 'bg-purple-500',
      change: '+3%',
      changeType: 'positive'
    },
    {
      name: 'Active Courses',
      value: courseStats?.activeCourses || 0,
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      change: '+5%',
      changeType: 'positive'
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {userRoleInfo?.displayName || 'Dashboard'}
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome to the College Management System. {userRoleInfo?.description}
        </p>
      </div>

      {/* Role-based Dashboard Widgets */}
      <DashboardWidgets />

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button className="card hover:bg-gray-50 transition-colors duration-200 text-left">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Add New User</h3>
                <p className="text-sm text-gray-500">Create a new user account</p>
              </div>
            </div>
          </button>

          <button className="card hover:bg-gray-50 transition-colors duration-200 text-left">
            <div className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Add New Student</h3>
                <p className="text-sm text-gray-500">Register a new student</p>
              </div>
            </div>
          </button>

          <button className="card hover:bg-gray-50 transition-colors duration-200 text-left">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Add New Course</h3>
                <p className="text-sm text-gray-500">Create a new course</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="card">
          <div className="flow-root">
            <ul className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                        <UsersIcon className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          New student <span className="font-medium text-gray-900">John Doe</span> registered
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        2 hours ago
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <BookOpenIcon className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Course <span className="font-medium text-gray-900">CS101</span> was updated
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        4 hours ago
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white">
                        <AcademicCapIcon className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium text-gray-900">25 students</span> enrolled in new courses
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        1 day ago
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
