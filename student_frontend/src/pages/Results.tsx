import { useState, useEffect } from 'react'
import { Tab } from '@headlessui/react'
import { useQuery } from '@tanstack/react-query'
import {
  AcademicCapIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  TrophyIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface Result {
  _id: string
  course: {
    courseCode: string
    title: string
    credits: number
    department: string
  }
  courseAssignment: {
    academicYear: string
    semester: string
  }
  assessments: Array<{
    type: string
    name: string
    score: number
    maxScore: number
    weight: number
    date: string
  }>
  totalScore: number
  grade: string
  gradePoint: number
  attendance: number
  remarks: string
  status: string
}

interface GPAInfo {
  gpa: number
  totalCredits: number
}

interface SemesterResults {
  academicYear: string
  semester: string
  results: Result[]
  gpaInfo: GPAInfo
}

const Results = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [allResults, setAllResults] = useState<Result[]>([])
  const [semesterResults, setSemesterResults] = useState<SemesterResults[]>([])
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024/2025')
  const [selectedSemester, setSelectedSemester] = useState('First')
  const [loading, setLoading] = useState(false)
  const [overallGPA, setOverallGPA] = useState<number>(0)

  // React Query for better caching and error handling
  const { data: transcript, isLoading: transcriptLoading } = useQuery({
    queryKey: ['transcript'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/api/students/transcript', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        return data.data
      }
      return null
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Fetch semester grades for detailed view
  const { data: semesterGrades = [] } = useQuery({
    queryKey: ['semester-grades', selectedAcademicYear, selectedSemester],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:5000/api/results/student?academicYear=${selectedAcademicYear}&semester=${selectedSemester}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        return data.data.results || []
      }
      return []
    },
    enabled: !!selectedAcademicYear && !!selectedSemester,
    retry: 1,
  })

  const tabs = [
    {
      name: 'Current Semester',
      icon: DocumentTextIcon,
      description: 'View results for current semester'
    },
    {
      name: 'Academic Transcript',
      icon: AcademicCapIcon,
      description: 'Complete academic record and transcript'
    },
    {
      name: 'Grade Analytics',
      icon: ChartBarIcon,
      description: 'GPA trends and grade distribution'
    },
    {
      name: 'Detailed Results',
      icon: EyeIcon,
      description: 'View detailed assessment breakdowns'
    }
  ]

  useEffect(() => {
    fetchCurrentSemesterResults()
    fetchAllResults()
  }, [selectedAcademicYear, selectedSemester])

  const fetchCurrentSemesterResults = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:5000/api/results/student?academicYear=${selectedAcademicYear}&semester=${selectedSemester}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        // Update current semester results in the semesterResults array
        const newSemesterResult: SemesterResults = {
          academicYear: selectedAcademicYear,
          semester: selectedSemester,
          results: data.data.results,
          gpaInfo: data.data.gpaInfo || { gpa: 0, totalCredits: 0 }
        }

        setSemesterResults(prev => {
          const filtered = prev.filter(sr =>
            !(sr.academicYear === selectedAcademicYear && sr.semester === selectedSemester)
          )
          return [...filtered, newSemesterResult]
        })
      }
    } catch (error) {
      console.error('Error fetching current semester results:', error)
      toast.error('Failed to fetch current semester results')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllResults = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/results/student', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAllResults(data.data.results)

        // Calculate overall GPA
        if (data.data.results.length > 0) {
          const totalPoints = data.data.results.reduce((sum: number, result: Result) =>
            sum + (result.gradePoint * result.course.credits), 0)
          const totalCredits = data.data.results.reduce((sum: number, result: Result) =>
            sum + result.course.credits, 0)
          setOverallGPA(totalCredits > 0 ? totalPoints / totalCredits : 0)
        }

        // Group results by semester
        const grouped = data.data.results.reduce((acc: any, result: Result) => {
          const key = `${result.courseAssignment.academicYear}-${result.courseAssignment.semester}`
          if (!acc[key]) {
            acc[key] = {
              academicYear: result.courseAssignment.academicYear,
              semester: result.courseAssignment.semester,
              results: [],
              gpaInfo: { gpa: 0, totalCredits: 0 }
            }
          }
          acc[key].results.push(result)
          return acc
        }, {})

        // Calculate GPA for each semester
        Object.values(grouped).forEach((semester: any) => {
          const totalPoints = semester.results.reduce((sum: number, result: Result) =>
            sum + (result.gradePoint * result.course.credits), 0)
          const totalCredits = semester.results.reduce((sum: number, result: Result) =>
            sum + result.course.credits, 0)
          semester.gpaInfo = {
            gpa: totalCredits > 0 ? totalPoints / totalCredits : 0,
            totalCredits
          }
        })

        setSemesterResults(Object.values(grouped))
      }
    } catch (error) {
      console.error('Error fetching all results:', error)
      toast.error('Failed to fetch results')
    }
  }

  const getGradeColor = (grade: string) => {
    if (['A+', 'A', 'A-'].includes(grade)) return 'text-green-600 bg-green-100'
    if (['B+', 'B', 'B-'].includes(grade)) return 'text-blue-600 bg-blue-100'
    if (['C+', 'C', 'C-'].includes(grade)) return 'text-yellow-600 bg-yellow-100'
    if (['D+', 'D'].includes(grade)) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-green-600'
    if (gpa >= 3.0) return 'text-blue-600'
    if (gpa >= 2.5) return 'text-yellow-600'
    if (gpa >= 2.0) return 'text-orange-600'
    return 'text-red-600'
  }

  const getCurrentSemesterResults = () => {
    return semesterResults.find(sr =>
      sr.academicYear === selectedAcademicYear && sr.semester === selectedSemester
    ) || { academicYear: selectedAcademicYear, semester: selectedSemester, results: [], gpaInfo: { gpa: 0, totalCredits: 0 } }
  }

  const downloadTranscript = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/students/transcript/download', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'academic_transcript.pdf')
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Transcript downloaded successfully!')
      } else {
        throw new Error('Download failed')
      }
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Transcript download feature coming soon!')
    }
  }

  if (transcriptLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Beautiful Gradient Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Academic Results & Transcript</h1>
            <p className="mt-2 text-blue-100">
              View your grades, GPA, detailed assessments, and academic progress
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={downloadTranscript}
              className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Download Transcript</span>
            </button>
            <TrophyIcon className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Academic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrophyIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overall GPA</p>
              <p className={`text-2xl font-bold ${getGPAColor(transcript?.overallGPA || overallGPA)}`}>
                {(transcript?.overallGPA || overallGPA).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900">
                {transcript?.totalCredits || semesterResults.reduce((sum, semester) => sum + semester.gpaInfo.totalCredits, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Courses Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {transcript?.grades?.length || allResults.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Current Semester</p>
              <p className="text-lg font-bold text-gray-900">
                {selectedAcademicYear} - {selectedSemester}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Period Selector */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="2024/2025">2024/2025</option>
              <option value="2023/2024">2023/2024</option>
              <option value="2022/2023">2022/2023</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="First">First Semester</option>
              <option value="Second">Second Semester</option>
              <option value="Summer">Summer Semester</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall GPA
              </label>
              <div className={`text-2xl font-bold ${getGPAColor(overallGPA)}`}>
                {overallGPA.toFixed(2)}
              </div>
            </div>
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
            {/* Current Semester Tab */}
            <Tab.Panel>
              <CurrentSemesterTab
                semesterData={getCurrentSemesterResults()}
                loading={loading}
                getGradeColor={getGradeColor}
              />
            </Tab.Panel>

            {/* Academic Transcript Tab */}
            <Tab.Panel>
              <AcademicTranscriptTab
                transcript={transcript}
                allResults={allResults}
                getGradeColor={getGradeColor}
                getGPAColor={getGPAColor}
              />
            </Tab.Panel>

            {/* Grade Analytics Tab */}
            <Tab.Panel>
              <GradeAnalyticsTab
                transcript={transcript}
                semesterResults={semesterResults}
                overallGPA={overallGPA}
                getGradeColor={getGradeColor}
                getGPAColor={getGPAColor}
              />
            </Tab.Panel>

            {/* Detailed Results Tab */}
            <Tab.Panel>
              <DetailedResultsTab
                semesterGrades={semesterGrades}
                selectedAcademicYear={selectedAcademicYear}
                selectedSemester={selectedSemester}
                getGradeColor={getGradeColor}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  )
}

// Current Semester Tab Component
interface CurrentSemesterTabProps {
  semesterData: SemesterResults
  loading: boolean
  getGradeColor: (grade: string) => string
}

const CurrentSemesterTab = ({ semesterData, loading, getGradeColor }: CurrentSemesterTabProps) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-900">
        {semesterData.academicYear} - {semesterData.semester} Semester
      </h3>
      <div className="text-right">
        <div className="text-sm text-gray-500">Semester GPA</div>
        <div className="text-2xl font-bold text-blue-600">
          {semesterData.gpaInfo.gpa.toFixed(2)}
        </div>
        <div className="text-sm text-gray-500">
          {semesterData.gpaInfo.totalCredits} Credits
        </div>
      </div>
    </div>

    {loading ? (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading results...</p>
      </div>
    ) : semesterData.results.length === 0 ? (
      <div className="text-center py-8">
        <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No results available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Results for this semester have not been published yet.
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
                Credits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {semesterData.results.map((result) => (
              <tr key={result._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {result.course.courseCode}
                    </div>
                    <div className="text-sm text-gray-500">
                      {result.course.title}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.course.credits}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.totalScore.toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
                    {result.grade}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.gradePoint.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.attendance}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)

// Academic Transcript Tab Component
interface AcademicTranscriptTabProps {
  transcript: any
  allResults: Result[]
  getGradeColor: (grade: string) => string
  getGPAColor: (gpa: number) => string
}

const AcademicTranscriptTab = ({ transcript, allResults, getGradeColor, getGPAColor }: AcademicTranscriptTabProps) => (
  <div className="space-y-6">
    {/* GPA History */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {/* Complete Academic Record */}
        <div className="bg-white rounded-lg shadow p-6">
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
                {(transcript?.grades || allResults)?.map((grade: any) => (
                  <tr key={grade._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {grade.course?.courseCode}
                        </div>
                        <div className="text-sm text-gray-500">
                          {grade.course?.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.course?.credits || grade.credits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade.grade)}`}>
                        {grade.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.gradePoint || grade.gradePoints}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {grade.courseAssignment?.academicYear} - {grade.courseAssignment?.semester || grade.semester}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* GPA History Sidebar */}
      <div>
        <div className="bg-white rounded-lg shadow p-6">
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
      </div>
    </div>
  </div>
)

// Grade Analytics Tab Component
interface GradeAnalyticsTabProps {
  transcript: any
  semesterResults: SemesterResults[]
  overallGPA: number
  getGradeColor: (grade: string) => string
  getGPAColor: (gpa: number) => string
}

const GradeAnalyticsTab = ({ transcript, semesterResults, overallGPA, getGradeColor, getGPAColor }: GradeAnalyticsTabProps) => {
  const totalCredits = transcript?.totalCredits || semesterResults.reduce((sum, semester) => sum + semester.gpaInfo.totalCredits, 0)
  const completedSemesters = transcript?.semesterGPAs?.length || semesterResults.length

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Overall GPA</p>
              <p className={`text-2xl font-bold ${getGPAColor(transcript?.overallGPA || overallGPA)}`}>
                {(transcript?.overallGPA || overallGPA).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Total Credits</p>
              <p className="text-2xl font-bold text-green-900">{totalCredits}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Semesters</p>
              <p className="text-2xl font-bold text-purple-900">{completedSemesters}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Avg Credits/Sem</p>
              <p className="text-2xl font-bold text-yellow-900">
                {completedSemesters > 0 ? (totalCredits / completedSemesters).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution</h2>
          <div className="space-y-2">
            {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'].map(grade => {
              const count = (transcript?.grades || []).filter((g: any) => g.grade === grade).length
              const percentage = (transcript?.grades?.length || 0) > 0 ? (count / transcript.grades.length) * 100 : 0

              return (
                <div key={grade} className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade)}`}>
                    {grade}
                  </span>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Semester-wise GPA Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Semester-wise GPA Trend</h4>
          <div className="space-y-3">
            {(transcript?.semesterGPAs || semesterResults)?.map((semester: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">
                    {semester.academicYear || `${semester.year}`} - {semester.semester}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({semester.gpaInfo?.totalCredits || semester.credits} credits)
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((semester.gpaInfo?.gpa || semester.gpa) / 4) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`font-bold ${getGPAColor(semester.gpaInfo?.gpa || semester.gpa)}`}>
                    {(semester.gpaInfo?.gpa || semester.gpa).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Academic Standing */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-blue-900 mb-2">Academic Standing</h4>
        <p className="text-blue-800 text-lg font-semibold">
          {(transcript?.overallGPA || overallGPA) >= 3.5 ? 'Excellent - Dean\'s List' :
           (transcript?.overallGPA || overallGPA) >= 3.0 ? 'Good Standing' :
           (transcript?.overallGPA || overallGPA) >= 2.5 ? 'Satisfactory' :
           (transcript?.overallGPA || overallGPA) >= 2.0 ? 'Academic Warning' :
           'Academic Probation'}
        </p>
        <p className="text-sm text-blue-600 mt-2">
          {(transcript?.overallGPA || overallGPA) >= 3.5 ? 'Congratulations! You are performing exceptionally well.' :
           (transcript?.overallGPA || overallGPA) >= 3.0 ? 'You are maintaining good academic performance.' :
           (transcript?.overallGPA || overallGPA) >= 2.5 ? 'Your performance is satisfactory. Consider improving study habits.' :
           (transcript?.overallGPA || overallGPA) >= 2.0 ? 'Warning: Your GPA is below expectations. Seek academic support.' :
           'Critical: Immediate academic intervention required.'}
        </p>
      </div>
    </div>
  )
}

// Detailed Results Tab Component
interface DetailedResultsTabProps {
  semesterGrades: Result[]
  selectedAcademicYear: string
  selectedSemester: string
  getGradeColor: (grade: string) => string
}

const DetailedResultsTab = ({ semesterGrades, selectedAcademicYear, selectedSemester, getGradeColor }: DetailedResultsTabProps) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium text-gray-900">
        Detailed Assessment Results - {selectedAcademicYear} {selectedSemester} Semester
      </h3>
    </div>

    {!semesterGrades || semesterGrades.length === 0 ? (
      <div className="text-center py-8">
        <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No detailed results available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Detailed assessment results for this semester have not been published yet.
        </p>
      </div>
    ) : (
      <div className="space-y-6">
        {semesterGrades.map((result) => (
          <div key={result._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {result.course.courseCode} - {result.course.title}
                </h4>
                <p className="text-sm text-gray-500">
                  {result.course.credits} Credits • {result.course.department}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(result.grade)}`}>
                  {result.grade}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  {result.totalScore.toFixed(1)}% • {result.gradePoint.toFixed(1)} GP
                </p>
              </div>
            </div>

            {/* Assessment Breakdown */}
            {result.assessments && result.assessments.length > 0 && (
              <div>
                <h5 className="text-md font-medium text-gray-900 mb-3">Assessment Breakdown</h5>
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assessment
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Weight
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contribution
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.assessments.map((assessment, index) => {
                        const percentage = (assessment.score / assessment.maxScore) * 100
                        const contribution = (percentage * assessment.weight) / 100

                        return (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {assessment.name}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 capitalize">
                              {assessment.type}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {assessment.score}/{assessment.maxScore} ({percentage.toFixed(1)}%)
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {assessment.weight}%
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {contribution.toFixed(1)}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Attendance:</span>
                <span className="ml-2 text-gray-900">{result.attendance}%</span>
              </div>
              {result.remarks && (
                <div>
                  <span className="font-medium text-gray-500">Remarks:</span>
                  <span className="ml-2 text-gray-900">{result.remarks}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)

// All Results Tab Component (keeping for compatibility)
interface AllResultsTabProps {
  semesterResults: SemesterResults[]
  getGradeColor: (grade: string) => string
  getGPAColor: (gpa: number) => string
}

const AllResultsTab = ({ semesterResults, getGradeColor, getGPAColor }: AllResultsTabProps) => (
  <div className="space-y-8">
    {semesterResults.length === 0 ? (
      <div className="text-center py-8">
        <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have any published results yet.
        </p>
      </div>
    ) : (
      semesterResults.map((semester) => (
        <div key={`${semester.academicYear}-${semester.semester}`} className="border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              {semester.academicYear} - {semester.semester} Semester
            </h4>
            <div className="text-right">
              <div className="text-sm text-gray-500">GPA</div>
              <div className={`text-xl font-bold ${getGPAColor(semester.gpaInfo.gpa)}`}>
                {semester.gpaInfo.gpa.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">
                {semester.gpaInfo.totalCredits} Credits
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {semester.results.map((result) => (
              <div key={result._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-medium text-gray-900">{result.course.courseCode}</h5>
                    <p className="text-sm text-gray-500">{result.course.title}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
                    {result.grade}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Score:</span>
                    <span className="font-medium">{result.totalScore.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Credits:</span>
                    <span className="font-medium">{result.course.credits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Grade Points:</span>
                    <span className="font-medium">{result.gradePoint.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))
    )}
  </div>
)

// GPA Analysis Tab Component
interface GPAAnalysisTabProps {
  semesterResults: SemesterResults[]
  overallGPA: number
  getGPAColor: (gpa: number) => string
}

const GPAAnalysisTab = ({ semesterResults, overallGPA, getGPAColor }: GPAAnalysisTabProps) => {
  const totalCredits = semesterResults.reduce((sum, semester) => sum + semester.gpaInfo.totalCredits, 0)
  const completedSemesters = semesterResults.length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Overall GPA</p>
              <p className={`text-2xl font-bold ${getGPAColor(overallGPA)}`}>
                {overallGPA.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Total Credits</p>
              <p className="text-2xl font-bold text-green-900">{totalCredits}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Semesters</p>
              <p className="text-2xl font-bold text-purple-900">{completedSemesters}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Avg Credits/Sem</p>
              <p className="text-2xl font-bold text-yellow-900">
                {completedSemesters > 0 ? (totalCredits / completedSemesters).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Semester-wise GPA Trend</h4>
        <div className="space-y-3">
          {semesterResults.map((semester) => (
            <div key={`${semester.academicYear}-${semester.semester}`} className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div>
                <span className="font-medium text-gray-900">
                  {semester.academicYear} - {semester.semester}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  ({semester.gpaInfo.totalCredits} credits)
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(semester.gpaInfo.gpa / 4) * 100}%` }}
                  ></div>
                </div>
                <span className={`font-bold ${getGPAColor(semester.gpaInfo.gpa)}`}>
                  {semester.gpaInfo.gpa.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-blue-900 mb-2">Academic Standing</h4>
        <p className="text-blue-800">
          {overallGPA >= 3.5 ? 'Excellent - Dean\'s List' :
           overallGPA >= 3.0 ? 'Good Standing' :
           overallGPA >= 2.5 ? 'Satisfactory' :
           overallGPA >= 2.0 ? 'Academic Warning' :
           'Academic Probation'}
        </p>
        <p className="text-sm text-blue-600 mt-2">
          {overallGPA >= 3.5 ? 'Congratulations! You are performing exceptionally well.' :
           overallGPA >= 3.0 ? 'You are maintaining good academic performance.' :
           overallGPA >= 2.5 ? 'Your performance is satisfactory. Consider improving study habits.' :
           overallGPA >= 2.0 ? 'Warning: Your GPA is below expectations. Seek academic support.' :
           'Critical: Immediate academic intervention required.'}
        </p>
      </div>
    </div>
  )
}

export default Results
