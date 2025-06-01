import { useState, useEffect } from 'react'
import { Tab } from '@headlessui/react'
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface CourseAssignment {
  _id: string
  course: {
    courseCode: string
    title: string
    credits: number
  }
  academicYear: string
  semester: string
  expectedStudents: number
  actualStudents: number
  resultsSubmitted: boolean
}

interface Student {
  _id: string
  studentId: string
  name: string
  email: string
}

interface Assessment {
  type: string
  name: string
  score: number
  maxScore: number
  weight: number
  date: string
}

interface StudentResult {
  student: Student
  result: {
    _id?: string
    assessments: Assessment[]
    totalScore?: number
    grade?: string
    attendance?: number
    remarks?: string
    status?: string
  } | null
}

const ResultsUpload = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [assignments, setAssignments] = useState<CourseAssignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<string>('')
  const [studentsWithResults, setStudentsWithResults] = useState<StudentResult[]>([])
  const [loading, setLoading] = useState(false)
  const [editingStudent, setEditingStudent] = useState<string | null>(null)

  const tabs = [
    {
      name: 'My Courses',
      icon: DocumentTextIcon,
      description: 'View assigned courses and upload results'
    },
    {
      name: 'Results Entry',
      icon: CloudArrowUpIcon,
      description: 'Enter and manage student results'
    }
  ]

  useEffect(() => {
    fetchMyAssignments()
  }, [])

  useEffect(() => {
    if (selectedAssignment) {
      fetchCourseResults()
    }
  }, [selectedAssignment])

  const fetchMyAssignments = async () => {
    try {
      setLoading(true)
      // Get current user's staff ID first
      const userResponse = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!userResponse.ok) return

      const userData = await userResponse.json()

      // Check if staffId exists
      if (!userData.data.staffId) {
        console.error('Staff ID not found in user profile:', userData.data)
        toast.error('Staff profile not found. Please contact administrator.')
        return
      }

      // Fetch lecturer's assignments
      const response = await fetch(
        `/api/course-assignments/lecturer/${userData.data.staffId}?academicYear=2024/2025&semester=First`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAssignments(data.data.assignments || [])
      } else {
        console.error('Failed to fetch assignments:', response.status)
        toast.error('Failed to fetch course assignments')
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast.error('Failed to fetch course assignments')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourseResults = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/results/course/${selectedAssignment}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStudentsWithResults(data.data.studentsWithResults || [])
      }
    } catch (error) {
      console.error('Error fetching course results:', error)
      toast.error('Failed to fetch course results')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveResult = async (studentId: string, resultData: any) => {
    try {
      const response = await fetch(`/api/results/course/${selectedAssignment}/student/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(resultData)
      })

      if (response.ok) {
        toast.success('Result saved successfully!')
        fetchCourseResults()
        setEditingStudent(null)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to save result')
      }
    } catch (error) {
      console.error('Error saving result:', error)
      toast.error('Failed to save result')
    }
  }

  const handleSubmitAllResults = async () => {
    try {
      const response = await fetch(`/api/results/course/${selectedAssignment}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        toast.success('All results submitted successfully!')
        fetchMyAssignments()
        fetchCourseResults()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to submit results')
      }
    } catch (error) {
      console.error('Error submitting results:', error)
      toast.error('Failed to submit results')
    }
  }

  const getGradeColor = (grade: string) => {
    if (['A+', 'A', 'A-'].includes(grade)) return 'text-green-600'
    if (['B+', 'B', 'B-'].includes(grade)) return 'text-blue-600'
    if (['C+', 'C', 'C-'].includes(grade)) return 'text-yellow-600'
    if (['D+', 'D'].includes(grade)) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Results Management</h1>
        <p className="mt-2 text-gray-600">
          Upload and manage student results for your assigned courses.
        </p>
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
            {/* My Courses Tab */}
            <Tab.Panel>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">My Course Assignments</h3>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading assignments...</p>
                    </div>
                  ) : assignments.length === 0 ? (
                    <div className="text-center py-8">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        You have no course assignments for this semester.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {assignments.map((assignment) => (
                        <div
                          key={assignment._id}
                          className={`border rounded-lg p-6 cursor-pointer transition-colors ${
                            selectedAssignment === assignment._id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            setSelectedAssignment(assignment._id)
                            setSelectedIndex(1)
                          }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-medium text-gray-900">
                              {assignment.course.courseCode}
                            </h4>
                            {assignment.resultsSubmitted ? (
                              <CheckCircleIcon className="h-6 w-6 text-green-500" />
                            ) : (
                              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            {assignment.course.title}
                          </p>

                          <div className="space-y-1 text-sm text-gray-500">
                            <p>{assignment.academicYear} - {assignment.semester} Semester</p>
                            <p>{assignment.course.credits} Credits</p>
                            <p>{assignment.actualStudents || assignment.expectedStudents} Students</p>
                          </div>

                          <div className="mt-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              assignment.resultsSubmitted
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {assignment.resultsSubmitted ? 'Results Submitted' : 'Pending Results'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Tab.Panel>

            {/* Results Entry Tab */}
            <Tab.Panel>
              {selectedAssignment ? (
                <ResultsEntryTab
                  assignment={assignments.find(a => a._id === selectedAssignment)}
                  studentsWithResults={studentsWithResults}
                  editingStudent={editingStudent}
                  setEditingStudent={setEditingStudent}
                  onSaveResult={handleSaveResult}
                  onSubmitAllResults={handleSubmitAllResults}
                  loading={loading}
                />
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Select a course</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a course from the "My Courses" tab to enter results.
                  </p>
                </div>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  )
}

// Results Entry Tab Component
interface ResultsEntryTabProps {
  assignment?: CourseAssignment
  studentsWithResults: StudentResult[]
  editingStudent: string | null
  setEditingStudent: (id: string | null) => void
  onSaveResult: (studentId: string, resultData: any) => void
  onSubmitAllResults: () => void
  loading: boolean
}

const ResultsEntryTab = ({
  assignment,
  studentsWithResults,
  editingStudent,
  setEditingStudent,
  onSaveResult,
  onSubmitAllResults,
  loading
}: ResultsEntryTabProps) => {
  if (!assignment) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {assignment.course.courseCode} - {assignment.course.title}
          </h3>
          <p className="text-sm text-gray-500">
            {assignment.academicYear} - {assignment.semester} Semester
          </p>
        </div>

        {!assignment.resultsSubmitted && (
          <button
            onClick={onSubmitAllResults}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Submit All Results
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading students...</p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
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
              {studentsWithResults.map((studentResult) => (
                <tr key={studentResult.student._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {studentResult.student.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {studentResult.student.studentId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {studentResult.result?.totalScore?.toFixed(1) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                  {studentResult.result?.grade ? (
                      <span className={`text-sm font-medium ${
                        ['A+', 'A', 'A-'].includes(studentResult.result.grade)
                          ? 'text-green-600'
                          : ['B+', 'B', 'B-'].includes(studentResult.result.grade)
                          ? 'text-blue-600'
                          : ['C+', 'C', 'C-'].includes(studentResult.result.grade)
                          ? 'text-yellow-600'
                          : ['D+', 'D'].includes(studentResult.result.grade)
                          ? 'text-orange-600'
                          : 'text-red-600'
                      }`}>
                        {studentResult.result.grade}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Not graded</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      studentResult.result?.status === 'submitted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {studentResult.result?.status || 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setEditingStudent(studentResult.student._id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {studentResult.result ? 'Edit' : 'Add'} Results
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Result Entry Modal */}
      {editingStudent && (
        <ResultEntryModal
          student={studentsWithResults.find(s => s.student._id === editingStudent)}
          onSave={(resultData) => onSaveResult(editingStudent, resultData)}
          onClose={() => setEditingStudent(null)}
        />
      )}
    </div>
  )
}

// Result Entry Modal Component
interface ResultEntryModalProps {
  student?: StudentResult
  onSave: (resultData: any) => void
  onClose: () => void
}

const ResultEntryModal = ({ student, onSave, onClose }: ResultEntryModalProps) => {
  const [assessments, setAssessments] = useState<Assessment[]>(
    student?.result?.assessments || [
      { type: 'assignment', name: 'Assignment 1', score: 0, maxScore: 100, weight: 20, date: new Date().toISOString().split('T')[0] },
      { type: 'midterm', name: 'Midterm Exam', score: 0, maxScore: 100, weight: 30, date: new Date().toISOString().split('T')[0] },
      { type: 'final', name: 'Final Exam', score: 0, maxScore: 100, weight: 50, date: new Date().toISOString().split('T')[0] }
    ]
  )
  const [attendance, setAttendance] = useState(student?.result?.attendance || 100)
  const [remarks, setRemarks] = useState(student?.result?.remarks || '')

  const addAssessment = () => {
    setAssessments([
      ...assessments,
      { type: 'assignment', name: '', score: 0, maxScore: 100, weight: 0, date: new Date().toISOString().split('T')[0] }
    ])
  }

  const removeAssessment = (index: number) => {
    setAssessments(assessments.filter((_, i) => i !== index))
  }

  const updateAssessment = (index: number, field: string, value: any) => {
    const updated = [...assessments]
    updated[index] = { ...updated[index], [field]: value }
    setAssessments(updated)
  }

  const handleSave = () => {
    const totalWeight = assessments.reduce((sum, assessment) => sum + assessment.weight, 0)

    if (Math.abs(totalWeight - 100) > 0.1) {
      toast.error('Assessment weights must total 100%')
      return
    }

    onSave({
      assessments,
      attendance,
      remarks
    })
  }

  if (!student) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Enter Results for {student.student.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Assessments */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-900">Assessments</h4>
                <button
                  onClick={addAssessment}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Assessment
                </button>
              </div>

              <div className="space-y-4">
                {assessments.map((assessment, index) => (
                  <div key={index} className="grid grid-cols-6 gap-4 items-center p-4 border rounded-lg">
                    <div>
                      <select
                        value={assessment.type}
                        onChange={(e) => updateAssessment(index, 'type', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                      >
                        <option value="assignment">Assignment</option>
                        <option value="quiz">Quiz</option>
                        <option value="test">Test</option>
                        <option value="midterm">Midterm</option>
                        <option value="final">Final</option>
                        <option value="project">Project</option>
                        <option value="practical">Practical</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Assessment name"
                        value={assessment.name}
                        onChange={(e) => updateAssessment(index, 'name', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        placeholder="Score"
                        value={assessment.score}
                        onChange={(e) => updateAssessment(index, 'score', parseFloat(e.target.value) || 0)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        min="0"
                        max={assessment.maxScore}
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        placeholder="Max Score"
                        value={assessment.maxScore}
                        onChange={(e) => updateAssessment(index, 'maxScore', parseFloat(e.target.value) || 100)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        min="1"
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        placeholder="Weight %"
                        value={assessment.weight}
                        onChange={(e) => updateAssessment(index, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div>
                      <button
                        onClick={() => removeAssessment(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-sm text-gray-500 mt-2">
                Total Weight: {assessments.reduce((sum, assessment) => sum + assessment.weight, 0)}%
              </div>
            </div>

            {/* Attendance and Remarks */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attendance (%)
                </label>
                <input
                  type="number"
                  value={attendance}
                  onChange={(e) => setAttendance(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Save Results
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsUpload
