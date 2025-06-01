import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  AcademicCapIcon,
  UserIcon,
  ClockIcon,
  MapPinIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import api from '@/services/authService'

interface CourseModalProps {
  course: any
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit' | 'view'
}

const CourseModal = ({ course, isOpen, onClose, mode }: CourseModalProps) => {
  const [formData, setFormData] = useState({
    courseCode: course?.courseCode || '',
    title: course?.title || '',
    description: course?.description || '',
    credits: course?.credits || 3,
    level: course?.level || 'undergraduate',
    department: course?.department || '',
    instructor: course?.instructor?._id || '',
    maxEnrollment: course?.maxEnrollment || 30,
    semester: course?.schedule?.semester || 'Fall',
    year: course?.schedule?.year || new Date().getFullYear(),
    sessions: course?.schedule?.sessions || [
      {
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:30',
        location: { building: '', room: '' },
        type: 'lecture'
      }
    ],
    prerequisites: course?.prerequisites || []
  })

  const queryClient = useQueryClient()

  // Get instructors for dropdown
  const { data: instructorsData } = useQuery({
    queryKey: ['instructors'],
    queryFn: async () => {
      const response = await api.get('/users?role=staff')
      return response.data
    },
    enabled: isOpen && (mode === 'create' || mode === 'edit')
  })

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (mode === 'create') {
        const response = await api.post('/courses', data)
        return response.data
      } else if (mode === 'edit') {
        const response = await api.put(`/courses/${course._id}`, data)
        return response.data
      }
    },
    onSuccess: () => {
      toast.success(`Course ${mode}d successfully!`)
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['course-stats'] })
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || `Failed to ${mode} course`)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      ...formData,
      schedule: {
        semester: formData.semester,
        year: parseInt(formData.year.toString()),
        sessions: formData.sessions
      }
    }

    mutation.mutate(submitData)
  }

  const addSession = () => {
    setFormData(prev => ({
      ...prev,
      sessions: [
        ...prev.sessions,
        {
          day: 'Monday',
          startTime: '09:00',
          endTime: '10:30',
          location: { building: '', room: '' },
          type: 'lecture'
        }
      ]
    }))
  }

const removeSession = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.filter((_, i: number) => i !== index)
    }))
  }

  const updateSession = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.map((session, i: number) =>
        i === index
          ? { ...session, [field]: value }
          : session
      )
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' && 'Add New Course'}
            {mode === 'edit' && 'Edit Course'}
            {mode === 'view' && 'Course Details'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {mode === 'view' ? (
          // View Mode
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Course Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Course Code</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{course?.courseCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Title</label>
                    <p className="mt-1 text-sm text-gray-900">{course?.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{course?.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Credits</label>
                      <p className="mt-1 text-sm text-gray-900">{course?.credits}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Level</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{course?.level}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Department</label>
                    <p className="mt-1 text-sm text-gray-900">{course?.department}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Instructor</h3>
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-10 w-10 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {course?.instructor?.user?.firstName} {course?.instructor?.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{course?.instructor?.position}</p>
                    <p className="text-sm text-gray-500">{course?.instructor?.user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Enrollment</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Enrollment:</span>
                    <span className="text-sm font-medium">{course?.currentEnrollment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Maximum Enrollment:</span>
                    <span className="text-sm font-medium">{course?.maxEnrollment}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((course?.currentEnrollment / course?.maxEnrollment) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Semester</label>
                      <p className="mt-1 text-sm text-gray-900">{course?.schedule?.semester}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Year</label>
                      <p className="mt-1 text-sm text-gray-900">{course?.schedule?.year}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Sessions</label>
                    {course?.schedule?.sessions?.map((session: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg mb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {session.day} • {session.startTime} - {session.endTime}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">{session.type}</p>
                          </div>
                          {session.location?.building && (
                            <div className="text-right">
                              <p className="text-sm text-gray-900">
                                {session.location.building} {session.location.room}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Create/Edit Mode
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.courseCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, courseCode: e.target.value.toUpperCase() }))}
                    placeholder="e.g., CS101, MATH1001"
                    pattern="[A-Z]{2,4}\d{3,4}"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Introduction to Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="input-field"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Course description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credits *
                    </label>
                    <select
                      className="input-field"
                      value={formData.credits}
                      onChange={(e) => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                    >
                      {[1, 2, 3, 4, 5, 6].map(credit => (
                        <option key={credit} value={credit}>{credit}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level *
                    </label>
                    <select
                      className="input-field"
                      value={formData.level}
                      onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                    >
                      <option value="undergraduate">Undergraduate</option>
                      <option value="graduate">Graduate</option>
                      <option value="postgraduate">Postgraduate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    className="input-field"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Arts and Humanities">Arts and Humanities</option>
                    <option value="Natural Sciences">Natural Sciences</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructor *
                  </label>
                  <select
                    className="input-field"
                    value={formData.instructor}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                  >
                    <option value="">Select Instructor</option>
                    {instructorsData?.data?.map((instructor: any) => (
                      <option key={instructor._id} value={instructor._id}>
                        {instructor.user?.firstName} {instructor.user?.lastName} - {instructor.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Enrollment *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="500"
                    className="input-field"
                    value={formData.maxEnrollment}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxEnrollment: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester *
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year *
                    </label>
                    <input
                      type="number"
                      required
                      min="2020"
                      max="2030"
                      className="input-field"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Class Sessions *
                    </label>
                    <button
                      type="button"
                      onClick={addSession}
                      className="text-primary-600 hover:text-primary-800 text-sm"
                    >
                      + Add Session
                    </button>
                  </div>
                  <div className="space-y-3">
              {formData.sessions.map((session, index: number) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <select
                            className="input-field"
                            value={session.day}
                            onChange={(e) => updateSession(index, 'day', e.target.value)}
                          >
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                          </select>
                          <select
                            className="input-field"
                            value={session.type}
                            onChange={(e) => updateSession(index, 'type', e.target.value)}
                          >
                            <option value="lecture">Lecture</option>
                            <option value="lab">Lab</option>
                            <option value="tutorial">Tutorial</option>
                            <option value="seminar">Seminar</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input
                            type="time"
                            className="input-field"
                            value={session.startTime}
                            onChange={(e) => updateSession(index, 'startTime', e.target.value)}
                          />
                          <input
                            type="time"
                            className="input-field"
                            value={session.endTime}
                            onChange={(e) => updateSession(index, 'endTime', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Building"
                            value={session.location.building}
                            onChange={(e) => updateSession(index, 'location', { ...session.location, building: e.target.value })}
                          />
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Room"
                            value={session.location.room}
                            onChange={(e) => updateSession(index, 'location', { ...session.location, room: e.target.value })}
                          />
                        </div>
                        {formData.sessions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSession(index)}
                            className="mt-2 text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove Session
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6 border-t">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isLoading}
                className="btn-primary flex-1"
              >
                {mutation.isLoading ? 'Saving...' : mode === 'create' ? 'Create Course' : 'Update Course'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

const Courses = () => {
  const [activeTab, setActiveTab] = useState<'manage' | 'print-all' | 'print-department'>('manage')
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [showModal, setShowModal] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const queryClient = useQueryClient()

  const { data: coursesData, isLoading, error } = useQuery({
    queryKey: ['courses', search, departmentFilter, levelFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (departmentFilter) params.append('department', departmentFilter)
      if (levelFilter) params.append('level', levelFilter)
      if (statusFilter) params.append('status', statusFilter)

      const response = await api.get(`/courses?${params.toString()}`)
      return response.data
    }
  })

  // Get course statistics
  const { data: courseStats } = useQuery({
    queryKey: ['course-stats'],
    queryFn: async () => {
      const response = await api.get('/courses/stats')
      return response.data.data
    }
  })

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await api.delete(`/courses/${courseId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Course deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['course-stats'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete course')
    }
  })

  const openModal = (mode: 'create' | 'edit' | 'view', course?: any) => {
    setModalMode(mode)
    setSelectedCourse(course)
    setShowModal(true)
  }

  const handleDelete = (course: any) => {
    if (window.confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
      deleteMutation.mutate(course._id)
    }
  }

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML
      const originalContent = document.body.innerHTML
      document.body.innerHTML = printContent
      window.print()
      document.body.innerHTML = originalContent
      window.location.reload()
    }
  }

  const getFilteredCourses = () => {
    if (activeTab === 'print-department' && departmentFilter) {
      return coursesData?.data?.filter((course: any) => course.department === departmentFilter) || []
    }
    return coursesData?.data || []
  }

  const departments = [
    'Computer Science', 'Engineering', 'Business Administration', 'Medicine',
    'Arts and Humanities', 'Natural Sciences', 'Mathematics', 'Physics',
    'Chemistry', 'Biology', 'Other'
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading courses. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Course Management</h1>
            <p className="mt-1 text-indigo-100">
              Manage courses, schedules, and academic programs
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => openModal('create')}
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Course</span>
            </button>
            <BookOpenIcon className="h-16 w-16 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Course Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {courseStats?.totalCourses || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {courseStats?.activeCourses || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Enrollment</p>
              <p className="text-2xl font-bold text-gray-900">
                {courseStats?.totalEnrollment || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Departments</p>
              <p className="text-2xl font-bold text-gray-900">
                {courseStats?.departmentCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manage'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BookOpenIcon className="h-5 w-5 inline mr-2" />
            Manage Courses
          </button>
          <button
            onClick={() => setActiveTab('print-all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'print-all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <PrinterIcon className="h-5 w-5 inline mr-2" />
            Print All Courses
          </button>
          <button
            onClick={() => setActiveTab('print-department')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'print-department'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <DocumentArrowDownIcon className="h-5 w-5 inline mr-2" />
            Print by Department
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'manage' && (
        <>
          {/* Filters */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
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
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Courses Table */}
          <div className="card">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coursesData?.data?.map((course: any) => (
                    <tr key={course._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <BookOpenIcon className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {course.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {course.level} • {course.credits} credits
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {course.courseCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.instructor?.user?.firstName} {course.instructor?.user?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {course.currentEnrollment}/{course.maxEnrollment}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min((course.currentEnrollment / course.maxEnrollment) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.credits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          course.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : course.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('view', course)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openModal('edit', course)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(course)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {coursesData?.pagination && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((coursesData.pagination.page - 1) * coursesData.pagination.limit) + 1} to{' '}
                  {Math.min(coursesData.pagination.page * coursesData.pagination.limit, coursesData.pagination.total)} of{' '}
                  {coursesData.pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    disabled={coursesData.pagination.page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    disabled={coursesData.pagination.page === coursesData.pagination.pages}
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

      {/* Print All Courses Tab */}
      {activeTab === 'print-all' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">All Courses Report</h2>
            <button
              onClick={handlePrint}
              className="btn-primary flex items-center space-x-2"
            >
              <PrinterIcon className="h-4 w-4" />
              <span>Print Report</span>
            </button>
          </div>

          <div ref={printRef} className="print-content">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Course Catalog Report</h1>
              <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
              <p className="text-gray-600">Total Courses: {coursesData?.data?.length || 0}</p>
            </div>

            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Enrollment</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coursesData?.data?.map((course: any) => (
                    <tr key={course._id}>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{course.courseCode}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{course.title}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{course.department}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{course.credits}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 capitalize">{course.level}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {course.instructor?.user?.firstName} {course.instructor?.user?.lastName}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {course.currentEnrollment}/{course.maxEnrollment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Print by Department Tab */}
      {activeTab === 'print-department' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Department Courses Report</h2>
            <div className="flex items-center space-x-4">
              <select
                className="input-field"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <button
                onClick={handlePrint}
                disabled={!departmentFilter}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <PrinterIcon className="h-4 w-4" />
                <span>Print Report</span>
              </button>
            </div>
          </div>

          {departmentFilter && (
            <div ref={printRef} className="print-content">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{departmentFilter} Department</h1>
                <h2 className="text-xl font-semibold text-gray-700">Course Catalog</h2>
                <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                <p className="text-gray-600">Total Courses: {getFilteredCourses().length}</p>
              </div>

              <div className="space-y-6">
                {getFilteredCourses().map((course: any) => (
                  <div key={course._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {course.courseCode} - {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2">{course.description}</p>
                        <div className="mt-3 space-y-1">
                          <p className="text-sm"><span className="font-medium">Credits:</span> {course.credits}</p>
                          <p className="text-sm"><span className="font-medium">Level:</span> {course.level}</p>
                          <p className="text-sm"><span className="font-medium">Status:</span> {course.status}</p>
                        </div>
                      </div>
                      <div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Instructor</p>
                            <p className="text-sm text-gray-600">
                              {course.instructor?.user?.firstName} {course.instructor?.user?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{course.instructor?.position}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Enrollment</p>
                            <p className="text-sm text-gray-600">
                              {course.currentEnrollment} / {course.maxEnrollment} students
                            </p>
                          </div>
                          {course.schedule?.sessions?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Schedule</p>
                              {course.schedule.sessions.map((session: any, index: number) => (
                                <p key={index} className="text-sm text-gray-600">
                                  {session.day} {session.startTime}-{session.endTime}
                                  {session.location?.building && ` (${session.location.building} ${session.location.room})`}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!departmentFilter && (
            <div className="text-center py-12">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Select Department</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a department to generate the course report
              </p>
            </div>
          )}
        </div>
      )}

      {/* Course Modal */}
      <CourseModal
        course={selectedCourse}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
      />
    </div>
  )
}

export default Courses
