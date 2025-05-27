// User Types
export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: 'student' | 'staff' | 'admin'
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  profileImage?: string
  isActive: boolean
  isEmailVerified: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
  fullName: string
}

// Student Types
export interface Student {
  _id: string
  user: User
  studentId: string
  program: string
  year: number
  semester: number
  enrollmentDate: string
  expectedGraduation?: string
  status: 'active' | 'inactive' | 'graduated' | 'suspended' | 'transferred'
  gpa: number
  totalCredits: number
  enrolledCourses: EnrolledCourse[]
  emergencyContact?: {
    name?: string
    relationship?: string
    phone?: string
    email?: string
  }
  tuitionStatus: 'paid' | 'pending' | 'overdue' | 'partial'
  scholarships?: Scholarship[]
  createdAt: string
  updatedAt: string
}

export interface EnrolledCourse {
  course: string | Course
  enrollmentDate: string
  status: 'enrolled' | 'completed' | 'dropped' | 'failed'
  grade?: string
  credits?: number
}

export interface Scholarship {
  name: string
  amount: number
  startDate: string
  endDate: string
}

// Staff Types
export interface Staff {
  _id: string
  user: User
  employeeId: string
  position: string
  department: string
  employmentType: 'full-time' | 'part-time' | 'contract' | 'visiting'
  hireDate: string
  salary?: number
  status: 'active' | 'inactive' | 'on-leave' | 'terminated' | 'retired'
  qualifications: Qualification[]
  teachingCourses: string[] | Course[]
  maxCourseLoad: number
  officeLocation?: {
    building?: string
    room?: string
    floor?: string
  }
  officeHours?: OfficeHour[]
  researchAreas?: string[]
  publications?: Publication[]
  administrativeRoles?: AdministrativeRole[]
  performanceReviews?: PerformanceReview[]
  leaveBalance: {
    annual: number
    sick: number
    personal: number
  }
  createdAt: string
  updatedAt: string
}

export interface Qualification {
  degree: string
  field: string
  institution: string
  year: number
}

export interface OfficeHour {
  day: string
  startTime: string
  endTime: string
}

export interface Publication {
  title: string
  journal?: string
  year: number
  authors: string[]
  doi?: string
}

export interface AdministrativeRole {
  role: string
  startDate: string
  endDate?: string
  isActive: boolean
}

export interface PerformanceReview {
  reviewDate: string
  reviewer: string
  rating: number
  comments?: string
}

// Course Types
export interface Course {
  _id: string
  courseCode: string
  title: string
  description: string
  credits: number
  level: 'undergraduate' | 'graduate' | 'postgraduate'
  department: string
  prerequisites: Prerequisite[]
  schedule: CourseSchedule
  instructor: string | Staff
  assistants: string[] | Staff[]
  maxEnrollment: number
  currentEnrollment: number
  enrolledStudents: CourseEnrollment[]
  status: 'active' | 'inactive' | 'cancelled' | 'completed'
  assessments: Assessment[]
  materials: CourseMaterial[]
  announcements: Announcement[]
  createdAt: string
  updatedAt: string
}

export interface Prerequisite {
  course: string | Course
  minimumGrade: string
}

export interface CourseSchedule {
  semester: 'Fall' | 'Spring' | 'Summer'
  year: number
  sessions: CourseSession[]
}

export interface CourseSession {
  day: string
  startTime: string
  endTime: string
  location?: {
    building?: string
    room?: string
  }
  type: 'lecture' | 'lab' | 'tutorial' | 'seminar'
}

export interface CourseEnrollment {
  student: string | Student
  enrollmentDate: string
  status: 'enrolled' | 'dropped' | 'completed'
}

export interface Assessment {
  type: 'assignment' | 'quiz' | 'midterm' | 'final' | 'project' | 'presentation'
  title: string
  description?: string
  dueDate?: string
  totalMarks?: number
  weightage?: number
}

export interface CourseMaterial {
  title: string
  type: 'textbook' | 'reference' | 'article' | 'video' | 'website' | 'other'
  author?: string
  url?: string
  isRequired: boolean
}

export interface Announcement {
  title: string
  content: string
  date: string
  priority: 'low' | 'medium' | 'high'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  message?: string
}

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
  message?: string
}

// Form Types
export interface StudentFormData {
  firstName: string
  lastName: string
  email: string
  password?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  studentId: string
  program: string
  year: number
  semester: number
  enrollmentDate: string
}

export interface StaffFormData {
  firstName: string
  lastName: string
  email: string
  password?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  employeeId: string
  position: string
  department: string
  employmentType: string
  hireDate: string
  salary?: number
}

export interface CourseFormData {
  courseCode: string
  title: string
  description: string
  credits: number
  level: string
  department: string
  instructor: string
  maxEnrollment: number
  semester: string
  year: number
}
