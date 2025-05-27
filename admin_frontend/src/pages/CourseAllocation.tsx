import { useState, useEffect } from 'react'
import { Tab } from '@headlessui/react'
import {
  PlusIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface CourseAssignment {
  _id: string
  course: {
    _id: string
    courseCode: string
    title: string
    credits: number
    department: string
  }
  lecturer: {
    _id: string
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }
  academicYear: string
  semester: string
  status: string
  expectedStudents: number
  actualStudents: number
  resultsSubmitted: boolean
  resultsApproved: boolean
  assignmentDate: string
}

interface Lecturer {
  _id: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  position: string
  department: string
  workload?: {
    totalCourses: number
    totalCredits: number
    totalStudents: number
  }
}

interface Course {
  _id: string
  courseCode: string
  title: string
  credits: number
  level: string
  description: string
}

const CourseAllocation = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [assignments, setAssignments] = useState<CourseAssignment[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [academicYear, setAcademicYear] = useState('2024/2025')
  const [semester, setSemester] = useState('First')
  const [department, setDepartment] = useState('Computer Science')
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState({
    courseId: '',
    lecturerId: '',
    expectedStudents: 0,
    notes: ''
  })

  const tabs = [
    {
      name: 'Course Assignments',
      icon: ClipboardDocumentListIcon,
      description: 'View and manage course assignments'
    },
    {
      name: 'Assign Courses',
      icon: PlusIcon,
      description: 'Assign courses to lecturers'
    },
    {
      name: 'Lecturer Workload',
      icon: UserGroupIcon,
      description: 'View lecturer workload and assignments'
    }
  ]

  useEffect(() => {
    fetchAssignments()
    fetchLecturers()
    fetchAvailableCourses()
  }, [department, academicYear, semester])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/course-assignments/department?department=${department}&academicYear=${academicYear}&semester=${semester}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setAssignments(data.data)
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast.error('Failed to fetch course assignments')
    } finally {
      setLoading(false)
    }
  }

  const fetchLecturers = async () => {
    try {
      const response = await fetch(
        `/api/course-assignments/available-lecturers?department=${department}&academicYear=${academicYear}&semester=${semester}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setLecturers(data.data)
      }
    } catch (error) {
      console.error('Error fetching lecturers:', error)
    }
  }

  const fetchAvailableCourses = async () => {
    try {
      const response = await fetch(
        `/api/course-assignments/available-courses?department=${department}&academicYear=${academicYear}&semester=${semester}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setAvailableCourses(data.data)
      }
    } catch (error) {
      console.error('Error fetching available courses:', error)
    }
  }

  const handleAssignCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!assignmentForm.courseId || !assignmentForm.lecturerId) {
      toast.error('Please select both course and lecturer')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/course-assignments/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseId: assignmentForm.courseId,
          lecturerId: assignmentForm.lecturerId,
          academicYear,
          semester,
          expectedStudents: assignmentForm.expectedStudents,
          notes: assignmentForm.notes
        })
      })

      if (response.ok) {
        toast.success('Course assigned successfully!')
        setShowAssignForm(false)
        setAssignmentForm({ courseId: '', lecturerId: '', expectedStudents: 0, notes: '' })
        fetchAssignments()
        fetchAvailableCourses()
        fetchLecturers()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to assign course')
      }
    } catch (error) {
      console.error('Error assigning course:', error)
      toast.error('Failed to assign course')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (assignment: CourseAssignment) => {
    if (assignment.resultsApproved) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />
    } else if (assignment.resultsSubmitted) {
      return <ClockIcon className="h-5 w-5 text-yellow-500" />
    } else {
      return <XCircleIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (assignment: CourseAssignment) => {
    if (assignment.resultsApproved) return 'Results Approved'
    if (assignment.resultsSubmitted) return 'Results Submitted'
    return 'Pending Results'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Course Allocation & Management</h1>
        <p className="mt-2 text-gray-600">
          Assign courses to lecturers and manage academic workload distribution.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="2024/2025">2024/2025</option>
              <option value="2023/2024">2023/2024</option>
              <option value="2025/2026">2025/2026</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="First">First Semester</option>
              <option value="Second">Second Semester</option>
              <option value="Summer">Summer Semester</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                fetchAssignments()
                fetchLecturers()
                fetchAvailableCourses()
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex space-x-1 rounded-t-lg bg-gray-50 p-1">
            {tabs.map((tab, index) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-3 px-4 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-blue-700 shadow'
                      : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                  )
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels className="p-6">
            {/* Course Assignments Tab */}
            <Tab.Panel>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Course Assignments ({assignments.length})
                  </h3>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading assignments...</p>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-8">
                    <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No courses have been assigned for the selected period.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lecturer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Students
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
                        {assignments.map((assignment) => (
                          <tr key={assignment._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {assignment.course.courseCode}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {assignment.course.title}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {assignment.course.credits} credits
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {assignment.lecturer.user.firstName} {assignment.lecturer.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {assignment.lecturer.user.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {assignment.actualStudents || assignment.expectedStudents || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(assignment)}
                                <span className="ml-2 text-sm text-gray-900">
                                  {getStatusText(assignment)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">
                                View Results
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Tab.Panel>

            {/* Assign Courses Tab */}
            <Tab.Panel>
              <AssignCoursesTab
                availableCourses={availableCourses}
                lecturers={lecturers}
                assignmentForm={assignmentForm}
                setAssignmentForm={setAssignmentForm}
                onSubmit={handleAssignCourse}
                loading={loading}
              />
            </Tab.Panel>

            {/* Lecturer Workload Tab */}
            <Tab.Panel>
              <LecturerWorkloadTab lecturers={lecturers} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  )
}

// Sub-components for better organization
interface AssignCoursesTabProps {
  availableCourses: Course[]
  lecturers: Lecturer[]
  assignmentForm: any
  setAssignmentForm: (form: any) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

const AssignCoursesTab = ({ 
  availableCourses, 
  lecturers, 
  assignmentForm, 
  setAssignmentForm, 
  onSubmit, 
  loading 
}: AssignCoursesTabProps) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Course to Lecturer</h3>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <select
              value={assignmentForm.courseId}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, courseId: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Choose a course...</option>
              {availableCourses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseCode} - {course.title} ({course.credits} credits)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Lecturer
            </label>
            <select
              value={assignmentForm.lecturerId}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, lecturerId: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Choose a lecturer...</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer._id} value={lecturer._id}>
                  {lecturer.user.firstName} {lecturer.user.lastName} - {lecturer.position}
                  {lecturer.workload && ` (${lecturer.workload.totalCourses} courses)`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Students
            </label>
            <input
              type="number"
              value={assignmentForm.expectedStudents}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, expectedStudents: parseInt(e.target.value) || 0 })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={assignmentForm.notes}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Assigning...' : 'Assign Course'}
          </button>
        </div>
      </form>
    </div>

    {availableCourses.length === 0 && (
      <div className="text-center py-8">
        <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No available courses</h3>
        <p className="mt-1 text-sm text-gray-500">
          All courses for this period have been assigned.
        </p>
      </div>
    )}
  </div>
)

interface LecturerWorkloadTabProps {
  lecturers: Lecturer[]
}

const LecturerWorkloadTab = ({ lecturers }: LecturerWorkloadTabProps) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Lecturer Workload Overview</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lecturers.map((lecturer) => (
        <div key={lecturer._id} className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {lecturer.user.firstName[0]}{lecturer.user.lastName[0]}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-900">
                {lecturer.user.firstName} {lecturer.user.lastName}
              </h4>
              <p className="text-sm text-gray-500">{lecturer.position}</p>
            </div>
          </div>
          
          {lecturer.workload ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Courses:</span>
                <span className="font-medium">{lecturer.workload.totalCourses}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Credits:</span>
                <span className="font-medium">{lecturer.workload.totalCredits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Students:</span>
                <span className="font-medium">{lecturer.workload.totalStudents}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No assignments this semester</p>
          )}
        </div>
      ))}
    </div>
  </div>
)

export default CourseAllocation
