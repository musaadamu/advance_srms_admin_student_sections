import * as XLSX from 'xlsx'

// Template definitions with validation rules and examples
export const TEMPLATES = {
  users: {
    name: 'Users_Template',
    headers: [
      'firstName',
      'lastName', 
      'email',
      'role',
      'phone',
      'dateOfBirth',
      'gender',
      'address_street',
      'address_city',
      'address_state',
      'address_zipCode',
      'address_country',
      'isActive',
      'department',
      'position'
    ],
    sampleData: [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@university.edu',
        role: 'student',
        phone: '+1234567890',
        dateOfBirth: '1995-05-15',
        gender: 'male',
        address_street: '123 Main St',
        address_city: 'New York',
        address_state: 'NY',
        address_zipCode: '10001',
        address_country: 'USA',
        isActive: 'true',
        department: 'Computer Science',
        position: ''
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@university.edu',
        role: 'staff',
        phone: '+1234567891',
        dateOfBirth: '1985-08-22',
        gender: 'female',
        address_street: '456 Oak Ave',
        address_city: 'Boston',
        address_state: 'MA',
        address_zipCode: '02101',
        address_country: 'USA',
        isActive: 'true',
        department: 'Mathematics',
        position: 'Professor'
      }
    ],
    validationRules: {
      firstName: 'Required. Text only.',
      lastName: 'Required. Text only.',
      email: 'Required. Valid email format.',
      role: 'Required. Values: student, staff, admin',
      phone: 'Optional. Format: +1234567890',
      dateOfBirth: 'Optional. Format: YYYY-MM-DD',
      gender: 'Optional. Values: male, female, other',
      address_street: 'Optional. Street address',
      address_city: 'Optional. City name',
      address_state: 'Optional. State/Province',
      address_zipCode: 'Optional. ZIP/Postal code',
      address_country: 'Optional. Country name',
      isActive: 'Optional. Values: true, false (default: true)',
      department: 'Optional. Department name',
      position: 'Optional. Job position (for staff/admin only)'
    }
  },

  students: {
    name: 'Students_Template',
    headers: [
      'user_email',
      'studentId',
      'program',
      'major',
      'minor',
      'enrollmentDate',
      'expectedGraduation',
      'currentYear',
      'currentSemester',
      'academicStatus',
      'gpa',
      'totalCredits',
      'emergencyContact_name',
      'emergencyContact_phone',
      'emergencyContact_relationship',
      'medicalInfo_allergies',
      'medicalInfo_medications',
      'medicalInfo_conditions',
      'financialAid_type',
      'financialAid_amount',
      'advisor_email'
    ],
    sampleData: [
      {
        user_email: 'john.doe@university.edu',
        studentId: 'STU2024001',
        program: 'Bachelor of Science in Computer Science',
        major: 'Computer Science',
        minor: 'Mathematics',
        enrollmentDate: '2024-09-01',
        expectedGraduation: '2028-05-15',
        currentYear: 'Freshman',
        currentSemester: 'Fall 2024',
        academicStatus: 'Good Standing',
        gpa: '3.75',
        totalCredits: '15',
        emergencyContact_name: 'Mary Doe',
        emergencyContact_phone: '+1234567892',
        emergencyContact_relationship: 'Mother',
        medicalInfo_allergies: 'None',
        medicalInfo_medications: 'None',
        medicalInfo_conditions: 'None',
        financialAid_type: 'Federal Grant',
        financialAid_amount: '5000',
        advisor_email: 'advisor1@university.edu'
      },
      {
        user_email: 'alice.johnson@university.edu',
        studentId: 'STU2024002',
        program: 'Bachelor of Arts in Mathematics',
        major: 'Mathematics',
        minor: 'Physics',
        enrollmentDate: '2023-09-01',
        expectedGraduation: '2027-05-15',
        currentYear: 'Sophomore',
        currentSemester: 'Fall 2024',
        academicStatus: 'Good Standing',
        gpa: '3.85',
        totalCredits: '45',
        emergencyContact_name: 'Robert Johnson',
        emergencyContact_phone: '+1234567893',
        emergencyContact_relationship: 'Father',
        medicalInfo_allergies: 'Peanuts',
        medicalInfo_medications: 'Inhaler',
        medicalInfo_conditions: 'Asthma',
        financialAid_type: 'Scholarship',
        financialAid_amount: '8000',
        advisor_email: 'advisor2@university.edu'
      }
    ],
    validationRules: {
      user_email: 'Required. Must match existing user email.',
      studentId: 'Required. Unique student identifier.',
      program: 'Required. Full program name.',
      major: 'Required. Major field of study.',
      minor: 'Optional. Minor field of study.',
      enrollmentDate: 'Required. Format: YYYY-MM-DD',
      expectedGraduation: 'Required. Format: YYYY-MM-DD',
      currentYear: 'Required. Values: Freshman, Sophomore, Junior, Senior',
      currentSemester: 'Required. Format: Fall/Spring/Summer YYYY',
      academicStatus: 'Required. Values: Good Standing, Probation, Suspension',
      gpa: 'Optional. Decimal number 0.0-4.0',
      totalCredits: 'Optional. Integer number',
      emergencyContact_name: 'Required. Full name',
      emergencyContact_phone: 'Required. Phone number',
      emergencyContact_relationship: 'Required. Relationship to student',
      medicalInfo_allergies: 'Optional. List allergies or "None"',
      medicalInfo_medications: 'Optional. List medications or "None"',
      medicalInfo_conditions: 'Optional. List conditions or "None"',
      financialAid_type: 'Optional. Type of financial aid',
      financialAid_amount: 'Optional. Amount in USD',
      advisor_email: 'Optional. Academic advisor email'
    }
  },

  courses: {
    name: 'Courses_Template',
    headers: [
      'courseCode',
      'title',
      'description',
      'credits',
      'level',
      'department',
      'faculty',
      'maxEnrollment',
      'instructor_email',
      'schedule_days',
      'schedule_startTime',
      'schedule_endTime',
      'schedule_building',
      'schedule_room',
      'prerequisites',
      'materials_required',
      'materials_optional',
      'status',
      'semester',
      'year'
    ],
    sampleData: [
      {
        courseCode: 'CS101',
        title: 'Introduction to Computer Science',
        description: 'Fundamental concepts of computer science including programming basics, algorithms, and data structures.',
        credits: '3',
        level: 'undergraduate',
        department: 'Computer Science',
        faculty: 'Engineering',
        maxEnrollment: '30',
        instructor_email: 'prof.smith@university.edu',
        schedule_days: 'Monday,Wednesday',
        schedule_startTime: '09:00',
        schedule_endTime: '10:30',
        schedule_building: 'Science Building',
        schedule_room: '101',
        prerequisites: '',
        materials_required: 'Introduction to Algorithms by Cormen|Clean Code by Martin',
        materials_optional: 'Code Complete by McConnell',
        status: 'active',
        semester: 'Fall',
        year: '2024'
      },
      {
        courseCode: 'MATH201',
        title: 'Calculus II',
        description: 'Advanced calculus including integration techniques, series, and differential equations.',
        credits: '4',
        level: 'undergraduate',
        department: 'Mathematics',
        faculty: 'Arts and Sciences',
        maxEnrollment: '40',
        instructor_email: 'prof.johnson@university.edu',
        schedule_days: 'Tuesday,Thursday',
        schedule_startTime: '14:00',
        schedule_endTime: '15:30',
        schedule_building: 'Math Building',
        schedule_room: '201',
        prerequisites: 'MATH101:C+',
        materials_required: 'Calculus: Early Transcendentals by Stewart',
        materials_optional: 'Student Solutions Manual',
        status: 'active',
        semester: 'Spring',
        year: '2024'
      }
    ],
    validationRules: {
      courseCode: 'Required. Unique course identifier (e.g., CS101)',
      title: 'Required. Course title',
      description: 'Required. Course description',
      credits: 'Required. Number of credits (1-6)',
      level: 'Required. Values: undergraduate, graduate',
      department: 'Required. Department name',
      faculty: 'Required. Faculty name',
      maxEnrollment: 'Required. Maximum number of students',
      instructor_email: 'Required. Instructor email address',
      schedule_days: 'Required. Days separated by commas (Monday,Wednesday)',
      schedule_startTime: 'Required. Format: HH:MM (24-hour)',
      schedule_endTime: 'Required. Format: HH:MM (24-hour)',
      schedule_building: 'Required. Building name',
      schedule_room: 'Required. Room number',
      prerequisites: 'Optional. Format: COURSE_CODE:MIN_GRADE (MATH101:C+)',
      materials_required: 'Optional. Separate multiple with | (pipe)',
      materials_optional: 'Optional. Separate multiple with | (pipe)',
      status: 'Required. Values: active, inactive, archived',
      semester: 'Required. Values: Fall, Spring, Summer',
      year: 'Required. Year (YYYY)'
    }
  }
}

export class TemplateService {
  static generateTemplate(templateType: keyof typeof TEMPLATES): Blob {
    const template = TEMPLATES[templateType]
    
    // Create workbook
    const wb = XLSX.utils.book_new()
    
    // Create main data sheet
    const wsData = XLSX.utils.json_to_sheet(template.sampleData)
    XLSX.utils.book_append_sheet(wb, wsData, 'Data')
    
    // Create validation rules sheet
    const validationData = Object.entries(template.validationRules).map(([field, rule]) => ({
      Field: field,
      'Validation Rule': rule
    }))
    const wsValidation = XLSX.utils.json_to_sheet(validationData)
    XLSX.utils.book_append_sheet(wb, wsValidation, 'Validation Rules')
    
    // Create instructions sheet
    const instructions = [
      { Instruction: '1. Fill in the Data sheet with your information' },
      { Instruction: '2. Follow the validation rules in the Validation Rules sheet' },
      { Instruction: '3. Do not modify the column headers' },
      { Instruction: '4. Save the file and upload it to the system' },
      { Instruction: '5. Check the upload results for any errors' },
      { Instruction: '' },
      { Instruction: 'Important Notes:' },
      { Instruction: '- Required fields must not be empty' },
      { Instruction: '- Email addresses must be unique' },
      { Instruction: '- Dates must be in YYYY-MM-DD format' },
      { Instruction: '- Boolean values should be "true" or "false"' },
      { Instruction: '- For multiple values, separate with | (pipe character)' }
    ]
    const wsInstructions = XLSX.utils.json_to_sheet(instructions)
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions')
    
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  }
  
  static downloadTemplate(templateType: keyof typeof TEMPLATES): void {
    const template = TEMPLATES[templateType]
    const blob = this.generateTemplate(templateType)
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${template.name}_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
  
  static parseUploadedFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }
}
