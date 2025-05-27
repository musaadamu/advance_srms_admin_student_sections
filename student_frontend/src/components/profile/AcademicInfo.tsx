import { useState } from 'react'
import { useAuthStore } from '@/hooks/useAuthStore'
import { 
  AcademicCapIcon, 
  CalendarDaysIcon, 
  BookOpenIcon,
  TrophyIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface AcademicRecord {
  id: string
  semester: string
  year: string
  courses: Course[]
  gpa: number
  credits: number
  status: 'completed' | 'in-progress' | 'planned'
}

interface Course {
  id: string
  code: string
  name: string
  credits: number
  grade?: string
  instructor: string
  status: 'completed' | 'in-progress' | 'dropped'
}

const AcademicInfo = () => {
  const { user } = useAuthStore()
  const [selectedSemester, setSelectedSemester] = useState<string>('current')

  // Mock academic data - replace with actual API calls
  const academicInfo = {
    program: 'Bachelor of Science in Computer Science',
    major: 'Computer Science',
    minor: 'Mathematics',
    enrollmentDate: '2023-09-01',
    expectedGraduation: '2027-05-15',
    currentYear: 'Sophomore',
    currentSemester: 'Fall 2024',
    overallGPA: 3.75,
    totalCredits: 45,
    requiredCredits: 120,
    academicStatus: 'Good Standing'
  }

  const academicRecords: AcademicRecord[] = [
    {
      id: '1',
      semester: 'Fall',
      year: '2024',
      gpa: 3.8,
      credits: 15,
      status: 'in-progress',
      courses: [
        {
          id: '1',
          code: 'CS301',
          name: 'Data Structures and Algorithms',
          credits: 3,
          instructor: 'Dr. Smith',
          status: 'in-progress'
        },
        {
          id: '2',
          code: 'MATH201',
          name: 'Calculus II',
          credits: 4,
          instructor: 'Prof. Johnson',
          status: 'in-progress'
        },
        {
          id: '3',
          code: 'ENG102',
          name: 'Technical Writing',
          credits: 3,
          instructor: 'Dr. Brown',
          status: 'in-progress'
        },
        {
          id: '4',
          code: 'CS250',
          name: 'Computer Organization',
          credits: 3,
          instructor: 'Prof. Davis',
          status: 'in-progress'
        },
        {
          id: '5',
          code: 'PHYS101',
          name: 'Physics I',
          credits: 4,
          instructor: 'Dr. Wilson',
          status: 'in-progress'
        }
      ]
    },
    {
      id: '2',
      semester: 'Spring',
      year: '2024',
      gpa: 3.7,
      credits: 15,
      status: 'completed',
      courses: [
        {
          id: '6',
          code: 'CS200',
          name: 'Programming Fundamentals',
          credits: 3,
          grade: 'A',
          instructor: 'Dr. Anderson',
          status: 'completed'
        },
        {
          id: '7',
          code: 'MATH101',
          name: 'Calculus I',
          credits: 4,
          grade: 'B+',
          instructor: 'Prof. Taylor',
          status: 'completed'
        },
        {
          id: '8',
          code: 'ENG101',
          name: 'English Composition',
          credits: 3,
          grade: 'A-',
          instructor: 'Dr. Miller',
          status: 'completed'
        },
        {
          id: '9',
          code: 'CS150',
          name: 'Introduction to Computer Science',
          credits: 3,
          grade: 'A',
          instructor: 'Prof. Garcia',
          status: 'completed'
        },
        {
          id: '10',
          code: 'HIST101',
          name: 'World History',
          credits: 3,
          grade: 'B',
          instructor: 'Dr. Lee',
          status: 'completed'
        }
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'in-progress':
        return 'text-blue-600 bg-blue-100'
      case 'planned':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600'
    if (grade.startsWith('B')) return 'text-blue-600'
    if (grade.startsWith('C')) return 'text-yellow-600'
    if (grade.startsWith('D')) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Academic Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <AcademicCapIcon className="h-5 w-5 mr-2" />
          Academic Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <TrophyIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Overall GPA</p>
                <p className="text-2xl font-bold text-gray-900">{academicInfo.overallGPA}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Credits Earned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {academicInfo.totalCredits}/{academicInfo.requiredCredits}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Current Year</p>
                <p className="text-lg font-bold text-gray-900">{academicInfo.currentYear}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-lg font-bold text-green-600">{academicInfo.academicStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Program Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Program Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Program</label>
            <p className="mt-1 text-sm text-gray-900">{academicInfo.program}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Major</label>
            <p className="mt-1 text-sm text-gray-900">{academicInfo.major}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Minor</label>
            <p className="mt-1 text-sm text-gray-900">{academicInfo.minor}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Expected Graduation</label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(academicInfo.expectedGraduation).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Academic Records */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Academic Records</h4>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="text-sm border-gray-300 rounded-md"
          >
            <option value="current">Current Semester</option>
            <option value="all">All Semesters</option>
          </select>
        </div>

        <div className="space-y-6">
          {academicRecords.map((record) => (
            <div key={record.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h5 className="text-lg font-medium text-gray-900">
                    {record.semester} {record.year}
                  </h5>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                    {record.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">GPA: <span className="font-medium">{record.gpa}</span></p>
                  <p className="text-sm text-gray-500">Credits: <span className="font-medium">{record.credits}</span></p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {record.courses.map((course) => (
                      <tr key={course.id}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{course.code}</div>
                            <div className="text-sm text-gray-500">{course.name}</div>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {course.credits}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {course.instructor}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {course.grade ? (
                            <span className={`text-sm font-medium ${getGradeColor(course.grade)}`}>
                              {course.grade}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">In Progress</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AcademicInfo
