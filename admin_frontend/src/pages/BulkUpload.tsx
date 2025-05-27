import { useState } from 'react'
import { Tab } from '@headlessui/react'
import {
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { TemplateService, TEMPLATES } from '@/services/templateService'
import { toast } from 'react-hot-toast'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface UploadResult {
  success: number
  failed: number
  errors: Array<{
    row: number
    field: string
    message: string
    data: any
  }>
}

const BulkUpload = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [uploadResults, setUploadResults] = useState<UploadResult | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const tabs = [
    {
      name: 'Users',
      icon: UsersIcon,
      templateType: 'users' as const,
      description: 'Upload multiple users (students, staff, admins) at once'
    },
    {
      name: 'Students',
      icon: AcademicCapIcon,
      templateType: 'students' as const,
      description: 'Upload student-specific information and academic records'
    },
    {
      name: 'Courses',
      icon: BookOpenIcon,
      templateType: 'courses' as const,
      description: 'Upload course catalog and schedule information'
    }
  ]

  const handleDownloadTemplate = (templateType: keyof typeof TEMPLATES) => {
    try {
      TemplateService.downloadTemplate(templateType)
      toast.success(`${TEMPLATES[templateType].name} downloaded successfully!`)
    } catch (error) {
      toast.error('Failed to download template')
      console.error('Template download error:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, templateType: keyof typeof TEMPLATES) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)')
      return
    }

    setIsUploading(true)
    setUploadResults(null)

    try {
      // Parse the uploaded file
      const data = await TemplateService.parseUploadedFile(file)

      if (data.length === 0) {
        toast.error('The uploaded file is empty')
        setIsUploading(false)
        return
      }

      // Validate and process data
      const result = await processUploadData(data, templateType)
      setUploadResults(result)

      if (result.success > 0) {
        toast.success(`Successfully processed ${result.success} records`)
      }
      if (result.failed > 0) {
        toast.error(`Failed to process ${result.failed} records`)
      }

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to process uploaded file')
    } finally {
      setIsUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const processUploadData = async (data: any[], templateType: keyof typeof TEMPLATES): Promise<UploadResult> => {
    const result: UploadResult = {
      success: 0,
      failed: 0,
      errors: []
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const rowNumber = i + 2 // +2 because Excel rows start at 1 and we have headers

      try {
        // Validate required fields
        const validationErrors = validateRow(row, templateType, rowNumber)
        if (validationErrors.length > 0) {
          result.errors.push(...validationErrors)
          result.failed++
          continue
        }

        // Transform data based on template type
        const transformedData = transformRowData(row, templateType)

        // Make API call to backend
        const response = await fetch(`http://localhost:5000/api/bulk-upload/${templateType}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify([transformedData])
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        result.success++
      } catch (error) {
        result.failed++
        result.errors.push({
          row: rowNumber,
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown error',
          data: row
        })
      }
    }

    return result
  }

  const validateRow = (row: any, templateType: keyof typeof TEMPLATES, rowNumber: number) => {
    const errors: UploadResult['errors'] = []
    const template = TEMPLATES[templateType]

    // Check required fields based on template type
    const requiredFields = getRequiredFields(templateType)

    for (const field of requiredFields) {
      if (!row[field] || row[field].toString().trim() === '') {
        errors.push({
          row: rowNumber,
          field,
          message: `${field} is required`,
          data: row
        })
      }
    }

    // Validate email format
    if (row.email && !isValidEmail(row.email)) {
      errors.push({
        row: rowNumber,
        field: 'email',
        message: 'Invalid email format',
        data: row
      })
    }

    // Validate date formats
    const dateFields = ['dateOfBirth', 'enrollmentDate', 'expectedGraduation']
    for (const field of dateFields) {
      if (row[field] && !isValidDate(row[field])) {
        errors.push({
          row: rowNumber,
          field,
          message: 'Invalid date format. Use YYYY-MM-DD',
          data: row
        })
      }
    }

    return errors
  }

  const getRequiredFields = (templateType: keyof typeof TEMPLATES): string[] => {
    switch (templateType) {
      case 'users':
        return ['firstName', 'lastName', 'email', 'role']
      case 'students':
        return ['user_email', 'studentId', 'program', 'major', 'enrollmentDate', 'expectedGraduation']
      case 'courses':
        return ['courseCode', 'title', 'description', 'credits', 'department', 'instructor_email']
      default:
        return []
    }
  }

  const transformRowData = (row: any, templateType: keyof typeof TEMPLATES) => {
    switch (templateType) {
      case 'users':
        return {
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          role: row.role,
          phone: row.phone,
          dateOfBirth: row.dateOfBirth,
          gender: row.gender,
          address: {
            street: row.address_street,
            city: row.address_city,
            state: row.address_state,
            zipCode: row.address_zipCode,
            country: row.address_country
          },
          isActive: row.isActive === 'true',
          department: row.department,
          position: row.position
        }

      case 'students':
        return {
          userEmail: row.user_email,
          studentId: row.studentId,
          academicInfo: {
            program: row.program,
            major: row.major,
            minor: row.minor,
            enrollmentDate: row.enrollmentDate,
            expectedGraduation: row.expectedGraduation,
            currentYear: row.currentYear,
            currentSemester: row.currentSemester,
            academicStatus: row.academicStatus,
            gpa: parseFloat(row.gpa) || 0,
            totalCredits: parseInt(row.totalCredits) || 0
          },
          emergencyContact: {
            name: row.emergencyContact_name,
            phone: row.emergencyContact_phone,
            relationship: row.emergencyContact_relationship
          },
          medicalInfo: {
            allergies: row.medicalInfo_allergies,
            medications: row.medicalInfo_medications,
            conditions: row.medicalInfo_conditions
          },
          financialAid: {
            type: row.financialAid_type,
            amount: parseFloat(row.financialAid_amount) || 0
          },
          advisorEmail: row.advisor_email
        }

      case 'courses':
        return {
          courseCode: row.courseCode,
          title: row.title,
          description: row.description,
          credits: parseInt(row.credits),
          level: row.level,
          department: row.department,
          faculty: row.faculty,
          maxEnrollment: parseInt(row.maxEnrollment),
          instructorEmail: row.instructor_email,
          schedule: {
            sessions: [{
              days: row.schedule_days.split(','),
              startTime: row.schedule_startTime,
              endTime: row.schedule_endTime,
              location: {
                building: row.schedule_building,
                room: row.schedule_room
              }
            }]
          },
          prerequisites: row.prerequisites ? row.prerequisites.split(',').map((p: string) => {
            const [course, grade] = p.split(':')
            return { course: course.trim(), minimumGrade: grade?.trim() || 'C' }
          }) : [],
          materials: {
            required: row.materials_required ? row.materials_required.split('|') : [],
            optional: row.materials_optional ? row.materials_optional.split('|') : []
          },
          status: row.status,
          semester: row.semester,
          year: parseInt(row.year)
        }

      default:
        return row
    }
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidDate = (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    return dateRegex.test(date) && !isNaN(Date.parse(date))
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bulk Upload</h1>
        <p className="mt-2 text-gray-600">
          Upload multiple records at once using Excel templates. Perfect for migrating from legacy systems.
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
            {tabs.map((tab, index) => (
              <Tab.Panel key={index}>
                <BulkUploadTab
                  tab={tab}
                  onDownloadTemplate={handleDownloadTemplate}
                  onFileUpload={handleFileUpload}
                  isUploading={isUploading}
                  uploadResults={uploadResults}
                />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  )
}

interface BulkUploadTabProps {
  tab: {
    name: string
    icon: any
    templateType: keyof typeof TEMPLATES
    description: string
  }
  onDownloadTemplate: (templateType: keyof typeof TEMPLATES) => void
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, templateType: keyof typeof TEMPLATES) => void
  isUploading: boolean
  uploadResults: UploadResult | null
}

const BulkUploadTab = ({ tab, onDownloadTemplate, onFileUpload, isUploading, uploadResults }: BulkUploadTabProps) => {
  const template = TEMPLATES[tab.templateType]

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="text-center">
        <tab.icon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">{tab.name} Bulk Upload</h3>
        <p className="mt-1 text-sm text-gray-500">{tab.description}</p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Download Template */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">1</span>
            </div>
            <h4 className="ml-3 text-lg font-medium text-gray-900">Download Template</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Download the Excel template with sample data and validation rules.
          </p>
          <button
            onClick={() => onDownloadTemplate(tab.templateType)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Download {template.name}
          </button>
        </div>

        {/* Step 2: Upload File */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-green-600">2</span>
            </div>
            <h4 className="ml-3 text-lg font-medium text-gray-900">Upload Completed File</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Fill in the template and upload it back to process the records.
          </p>
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => onFileUpload(e, tab.templateType)}
              disabled={isUploading}
              className="hidden"
              id={`file-upload-${tab.templateType}`}
            />
            <label
              htmlFor={`file-upload-${tab.templateType}`}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white cursor-pointer ${
                isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }`}
            >
              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
              {isUploading ? 'Processing...' : 'Upload Excel File'}
            </label>
          </div>
        </div>
      </div>

      {/* Upload Results */}
      {uploadResults && (
        <UploadResults results={uploadResults} />
      )}

      {/* Template Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-800 mb-2">Template Information</h5>
        <div className="text-sm text-blue-700">
          <p><strong>Fields:</strong> {template.headers.length} columns</p>
          <p><strong>Sample Records:</strong> {template.sampleData.length} examples included</p>
          <p><strong>Format:</strong> Excel (.xlsx) with validation rules and instructions</p>
        </div>
      </div>
    </div>
  )
}

interface UploadResultsProps {
  results: UploadResult
}

const UploadResults = ({ results }: UploadResultsProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Upload Results</h4>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center p-4 bg-green-50 rounded-lg">
          <CheckCircleIcon className="h-8 w-8 text-green-500" />
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">Successful</p>
            <p className="text-2xl font-bold text-green-900">{results.success}</p>
          </div>
        </div>

        <div className="flex items-center p-4 bg-red-50 rounded-lg">
          <XCircleIcon className="h-8 w-8 text-red-500" />
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">Failed</p>
            <p className="text-2xl font-bold text-red-900">{results.failed}</p>
          </div>
        </div>
      </div>

      {/* Errors */}
      {results.errors.length > 0 && (
        <div>
          <h5 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
            Errors ({results.errors.length})
          </h5>
          <div className="max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.errors.map((error, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{error.row}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{error.field}</td>
                    <td className="px-3 py-2 text-sm text-red-600">{error.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default BulkUpload
