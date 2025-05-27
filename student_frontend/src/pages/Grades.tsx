import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ChartBarIcon,
  DocumentTextIcon,
  TrophyIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import api from '@/services/authService'

const Grades = () => {
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

  // Get student transcript
  const { data: transcript, isLoading } = useQuery({
    queryKey: ['transcript'],
    queryFn: async () => {
      const response = await api.get('/students/transcript')
      return response.data.data
    }
  })

  // Get semester grades
  const { data: semesterGrades } = useQuery({
    queryKey: ['semester-grades', selectedSemester, selectedYear],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedSemester) params.append('semester', selectedSemester)
      if (selectedYear) params.append('year', selectedYear)

      const response = await api.get(`/students/grades?${params.toString()}`)
      return response.data.data
    },
    enabled: !!selectedSemester && !!selectedYear
  })

  const getGradeColor = (grade: string) => {
    if (['A+', 'A'].includes(grade)) return 'bg-green-100 text-green-800'
    if (['A-', 'B+', 'B'].includes(grade)) return 'bg-blue-100 text-blue-800'
    if (['B-', 'C+', 'C'].includes(grade)) return 'bg-yellow-100 text-yellow-800'
    if (['C-', 'D+', 'D'].includes(grade)) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.7) return 'text-green-600'
    if (gpa >= 3.0) return 'text-blue-600'
    if (gpa >= 2.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const downloadTranscript = async () => {
    try {
      const response = await api.get('/students/transcript/download', {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'transcript.pdf')
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
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Academic Records</h1>
            <p className="mt-1 text-purple-100">
              View your grades, GPA, and academic progress
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={downloadTranscript}
              className="bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Download Transcript</span>
            </button>
            <ChartBarIcon className="h-16 w-16 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Academic Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrophyIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overall GPA</p>
              <p className={`text-2xl font-bold ${getGPAColor(transcript?.overallGPA || 0)}`}>
                {transcript?.overallGPA?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900">
                {transcript?.totalCredits || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Courses Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {transcript?.grades?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Current Semester</p>
              <p className="text-lg font-bold text-gray-900">
                {transcript?.semesterGPAs?.[transcript.semesterGPAs.length - 1]?.semester || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Semester Selector & Grades */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Semester Grades</h2>
              <div className="flex space-x-3">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Semester</option>
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedSemester && selectedYear ? (
              <div className="space-y-4">
                {semesterGrades?.map((grade: any) => (
                  <div key={grade._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {grade.course.courseCode} - {grade.course.title}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{grade.credits} credits</span>
                          <span>•</span>
                          <span>Grade Points: {grade.gradePoints}</span>
                          <span>•</span>
                          <span>Instructor: {grade.course.instructor?.user?.firstName} {grade.course.instructor?.user?.lastName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {(!semesterGrades || semesterGrades.length === 0) && (
                  <p className="text-center text-gray-500 py-8">
                    No grades available for {selectedSemester} {selectedYear}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select Semester</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a semester and year to view your grades
                </p>
              </div>
            )}
          </div>
        </div>

        {/* GPA History */}
        <div>
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">GPA History</h2>
            <div className="space-y-3">
              {transcript?.semesterGPAs?.map((semesterGPA: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {semesterGPA.semester} {semesterGPA.year}
                    </p>
                    <p className="text-xs text-gray-500">
                      {semesterGPA.credits} credits
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getGPAColor(semesterGPA.gpa)}`}>
                      {semesterGPA.gpa.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {(!transcript?.semesterGPAs || transcript.semesterGPAs.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No GPA history available
                </p>
              )}
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="card mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution</h2>
            <div className="space-y-2">
              {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'].map(grade => {
                const count = transcript?.grades?.filter((g: any) => g.grade === grade).length || 0
                const percentage = transcript?.grades?.length ? (count / transcript.grades.length) * 100 : 0

                return (
                  <div key={grade} className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade)}`}>
                      {grade}
                    </span>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Complete Transcript */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Complete Academic Record</h2>
        </div>

        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transcript?.grades?.map((grade: any) => (
                <tr key={grade._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {grade.course.courseCode}
                      </div>
                      <div className="text-sm text-gray-500">
                        {grade.course.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {grade.credits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade.grade)}`}>
                      {grade.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {grade.gradePoints}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {grade.semester} {grade.year}
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

export default Grades
