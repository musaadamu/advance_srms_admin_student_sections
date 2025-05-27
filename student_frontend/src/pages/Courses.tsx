import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchAvailableCourses, fetchEnrolledCourses, setFilters, Course } from '@/store/slices/courseSlice'
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  UserIcon,
  ClockIcon,
  MapPinIcon,
  AcademicCapIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const Courses = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'enrolled'>('catalog')
  const dispatch = useAppDispatch()
  const {
    availableCourses,
    enrolledCourses,
    isLoading,
    filters
  } = useAppSelector(state => state.courses)

  // Fetch data when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'catalog') {
      dispatch(fetchAvailableCourses(filters))
    } else {
      dispatch(fetchEnrolledCourses())
    }
  }, [dispatch, activeTab, filters])

  const handleFilterChange = (filterType: string, value: string) => {
    dispatch(setFilters({ [filterType]: value }))
  }

  const coursesData = {
    data: activeTab === 'catalog' ? availableCourses : enrolledCourses
  }

  // For pagination (mock data for now)
  const catalogData = {
    pagination: {
      page: 1,
      limit: 10,
      total: availableCourses.length,
      pages: Math.ceil(availableCourses.length / 10)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Course Catalog</h1>
            <p className="mt-1 text-indigo-100">
              Browse available courses and manage your enrollments
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/registration"
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg"
            >
              Register for Courses
            </Link>
            <BookOpenIcon className="h-16 w-16 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'catalog'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Course Catalog
          </button>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'enrolled'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Courses
          </button>
        </nav>
      </div>

      {activeTab === 'catalog' && (
        /* Filters for catalog */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="input-field pl-10"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <select
            className="input-field"
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Business Administration">Business Administration</option>
            <option value="Medicine">Medicine</option>
            <option value="Arts and Humanities">Arts and Humanities</option>
            <option value="Natural Sciences">Natural Sciences</option>
          </select>
          <select
            className="input-field"
            value={filters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="graduate">Graduate</option>
            <option value="postgraduate">Postgraduate</option>
          </select>
        </div>
      )}

      {/* Course List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          coursesData?.data?.map((course: Course) => (
            <div key={course._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <BookOpenIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {course.courseCode} - {course.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <AcademicCapIcon className="h-4 w-4 mr-1" />
                          {course.credits} credits
                        </span>
                        <span>•</span>
                        <span>{course.department}</span>
                        <span>•</span>
                        <span className="capitalize">{course.level}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3">{course.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Instructor Info */}
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {course.instructor?.user?.firstName} {course.instructor?.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{course.instructor?.position}</p>
                      </div>
                    </div>

                    {/* Schedule Info */}
                    {course.schedule?.sessions && course.schedule.sessions.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">
                            {course.schedule.sessions.map((session) =>
                              `${session.day} ${session.startTime}-${session.endTime}`
                            ).join(', ')}
                          </p>
                          {course.schedule.sessions[0]?.location && (
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPinIcon className="h-3 w-3 mr-1" />
                              {course.schedule.sessions[0].location.building} {course.schedule.sessions[0].location.room}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Prerequisites */}
                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Prerequisites:</p>
                      <div className="flex flex-wrap gap-2">
                        {course.prerequisites.map((prereq, index: number) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            {typeof prereq.course === 'object' ? prereq.course?.courseCode : prereq.course} (Min: {prereq.minimumGrade})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Course Materials */}
                  {course.materials && course.materials.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Required Materials:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {course.materials.filter((m) => m.isRequired).slice(0, 2).map((material, index: number) => (
                          <li key={index}>{material.title} {material.author && `by ${material.author}`}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex flex-col items-end space-y-3">
                  {/* Enrollment Status */}
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Enrollment</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {course.currentEnrollment}/{course.maxEnrollment}
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((course.currentEnrollment / course.maxEnrollment) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    activeTab === 'enrolled'
                      ? 'bg-green-100 text-green-800'
                      : course.currentEnrollment >= course.maxEnrollment
                      ? 'bg-red-100 text-red-800'
                      : course.status === 'active'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {activeTab === 'enrolled' ? (
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Enrolled
                      </div>
                    ) : course.currentEnrollment >= course.maxEnrollment ? (
                      'Full'
                    ) : (
                      course.status
                    )}
                  </span>

                  {/* Action Button */}
                  {activeTab === 'catalog' && (
                    <Link
                      to="/registration"
                      className="btn-primary text-sm"
                    >
                      View Details
                    </Link>
                  )}

                  {activeTab === 'enrolled' && (
                    <div className="flex flex-col space-y-2">
                      <button className="btn-secondary text-sm">
                        Course Materials
                      </button>
                      <button className="btn-secondary text-sm">
                        Assignments
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {!isLoading && (!coursesData?.data || coursesData.data.length === 0) && (
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {activeTab === 'catalog' ? 'No courses found' : 'No enrolled courses'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'catalog'
                ? 'Try adjusting your search filters'
                : 'You are not currently enrolled in any courses'
              }
            </p>
            {activeTab === 'enrolled' && (
              <Link
                to="/registration"
                className="mt-4 inline-flex items-center btn-primary"
              >
                Register for Courses
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Pagination for catalog */}
      {activeTab === 'catalog' && catalogData?.pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((catalogData.pagination.page - 1) * catalogData.pagination.limit) + 1} to{' '}
            {Math.min(catalogData.pagination.page * catalogData.pagination.limit, catalogData.pagination.total)} of{' '}
            {catalogData.pagination.total} courses
          </div>
          <div className="flex space-x-2">
            <button
              disabled={catalogData.pagination.page === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={catalogData.pagination.page === catalogData.pagination.pages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Courses
