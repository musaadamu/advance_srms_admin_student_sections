import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BookOpenIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import api from '@/services/authService'

const Registration = () => {
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const queryClient = useQueryClient()

  // Get registration period info
  const { data: registrationInfo } = useQuery({
    queryKey: ['registration-info'],
    queryFn: async () => {
      const response = await api.get('/registration/info')
      return response.data.data
    }
  })

  // Get available courses
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['available-courses', search, departmentFilter, levelFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (departmentFilter) params.append('department', departmentFilter)
      if (levelFilter) params.append('level', levelFilter)
      params.append('available', 'true')
      
      const response = await api.get(`/courses?${params.toString()}`)
      return response.data
    }
  })

  // Get current registrations
  const { data: currentRegistrations } = useQuery({
    queryKey: ['current-registrations'],
    queryFn: async () => {
      const response = await api.get('/registration/current')
      return response.data.data
    }
  })

  // Register for courses mutation
  const registerMutation = useMutation({
    mutationFn: async (courseIds: string[]) => {
      const response = await api.post('/registration/register', { courseIds })
      return response.data
    },
    onSuccess: () => {
      toast.success('Successfully registered for courses!')
      queryClient.invalidateQueries({ queryKey: ['current-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['available-courses'] })
      setSelectedCourses([])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  })

  // Drop course mutation
  const dropMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      const response = await api.delete(`/registration/${registrationId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Course dropped successfully!')
      queryClient.invalidateQueries({ queryKey: ['current-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['available-courses'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to drop course')
    }
  })

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleRegister = () => {
    if (selectedCourses.length === 0) {
      toast.error('Please select at least one course')
      return
    }
    registerMutation.mutate(selectedCourses)
  }

  const getTotalCredits = () => {
    const currentCredits = currentRegistrations?.reduce((total: number, reg: any) => 
      total + (reg.course?.credits || 0), 0) || 0
    const selectedCredits = selectedCourses.reduce((total, courseId) => {
      const course = coursesData?.data?.find((c: any) => c._id === courseId)
      return total + (course?.credits || 0)
    }, 0)
    return currentCredits + selectedCredits
  }

  const isRegistrationOpen = registrationInfo?.isOpen
  const maxCredits = registrationInfo?.period?.maxCredits || 18
  const minCredits = registrationInfo?.period?.minCredits || 12

  if (!isRegistrationOpen) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Registration Closed</h3>
        <p className="mt-1 text-sm text-gray-500">
          Course registration is currently closed. Please check back during the registration period.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Course Registration</h1>
            <p className="mt-1 text-blue-100">
              {registrationInfo?.period?.semester} {registrationInfo?.period?.academicYear}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Registration Period</p>
            <p className="font-medium">
              {new Date(registrationInfo?.period?.startDate).toLocaleDateString()} - {' '}
              {new Date(registrationInfo?.period?.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Registration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalCredits()}</p>
              <p className="text-xs text-gray-500">Max: {maxCredits}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Registered Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {(currentRegistrations?.length || 0) + selectedCourses.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-lg font-bold text-gray-900">
                {getTotalCredits() >= minCredits ? 'Valid' : 'Incomplete'}
              </p>
              <p className="text-xs text-gray-500">Min: {minCredits} credits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Warning */}
      {getTotalCredits() > maxCredits && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Credit Limit Exceeded</h3>
              <p className="mt-1 text-sm text-red-700">
                You have selected {getTotalCredits()} credits, which exceeds the maximum of {maxCredits} credits.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Courses */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Available Courses</h2>
              <button
                onClick={handleRegister}
                disabled={selectedCourses.length === 0 || getTotalCredits() > maxCredits || registerMutation.isPending}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registerMutation.isPending ? 'Registering...' : `Register (${selectedCourses.length})`}
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="input-field pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="input-field"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Medicine">Medicine</option>
                <option value="Arts and Humanities">Arts and Humanities</option>
              </select>
              <select
                className="input-field"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="postgraduate">Postgraduate</option>
              </select>
            </div>

            {/* Course List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : (
                coursesData?.data?.map((course: any) => (
                  <div
                    key={course._id}
                    className={`border rounded-lg p-4 transition-colors ${
                      selectedCourses.includes(course._id)
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {course.courseCode} - {course.title}
                          </h3>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {course.credits} credits
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{course.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>Instructor: {course.instructor?.user?.firstName} {course.instructor?.user?.lastName}</span>
                          <span>•</span>
                          <span>Enrollment: {course.currentEnrollment}/{course.maxEnrollment}</span>
                          <span>•</span>
                          <span>{course.department}</span>
                        </div>
                        {course.schedule?.sessions?.length > 0 && (
                          <div className="mt-2 text-sm text-gray-500">
                            Schedule: {course.schedule.sessions.map((session: any) => 
                              `${session.day} ${session.startTime}-${session.endTime}`
                            ).join(', ')}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleCourseSelect(course._id)}
                        className={`ml-4 p-2 rounded-full ${
                          selectedCourses.includes(course._id)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {selectedCourses.includes(course._id) ? (
                          <MinusIcon className="h-5 w-5" />
                        ) : (
                          <PlusIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Current Registrations */}
        <div>
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Current Registrations</h2>
            <div className="space-y-3">
              {currentRegistrations?.map((registration: any) => (
                <div key={registration._id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {registration.course?.courseCode}
                      </h4>
                      <p className="text-xs text-gray-500">{registration.course?.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {registration.course?.credits} credits
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
                        registration.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : registration.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {registration.status}
                      </span>
                    </div>
                    {registration.status === 'pending' && (
                      <button
                        onClick={() => dropMutation.mutate(registration._id)}
                        disabled={dropMutation.isPending}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Drop
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {(!currentRegistrations || currentRegistrations.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No current registrations
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Registration
