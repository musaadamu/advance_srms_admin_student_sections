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

// Staff Types (for instructor information)
export interface Staff {
  _id: string
  user: User
  employeeId: string
  position: string
  department: string
  officeLocation?: {
    building?: string
    room?: string
    floor?: string
  }
  officeHours?: OfficeHour[]
}

export interface OfficeHour {
  day: string
  startTime: string
  endTime: string
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

// Grade Types
export interface Grade {
  course: Course
  grade: string
  credits: number
  semester: string
  year: number
  gradePoints: number
}

export interface Transcript {
  student: Student
  grades: Grade[]
  overallGPA: number
  totalCredits: number
  semesterGPAs: SemesterGPA[]
}

export interface SemesterGPA {
  semester: string
  year: number
  gpa: number
  credits: number
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
export interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface EmergencyContactData {
  name: string
  relationship: string
  phone: string
  email?: string
}

// Payment Types
export interface Payment {
  _id: string
  student: string | Student
  type: 'tuition' | 'registration' | 'library' | 'laboratory' | 'examination' | 'other'
  amount: number
  currency: string
  description: string
  dueDate: string
  paidDate?: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'cash' | 'check' | 'online'
  transactionId?: string
  semester: string
  academicYear: string
  createdAt: string
  updatedAt: string
}

export interface PaymentSummary {
  totalDue: number
  totalPaid: number
  totalOverdue: number
  upcomingPayments: Payment[]
  recentPayments: Payment[]
}

// Course Registration Types
export interface CourseRegistration {
  _id: string
  student: string | Student
  course: string | Course
  semester: string
  academicYear: string
  registrationDate: string
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted'
  priority: number
  prerequisites: {
    course: string | Course
    grade: string
    satisfied: boolean
  }[]
  createdAt: string
  updatedAt: string
}

export interface RegistrationPeriod {
  _id: string
  name: string
  semester: string
  academicYear: string
  startDate: string
  endDate: string
  isActive: boolean
  allowedYears: number[]
  maxCredits: number
  minCredits: number
}

// Academic Calendar Types
export interface AcademicEvent {
  _id: string
  title: string
  description: string
  type: 'registration' | 'examination' | 'holiday' | 'deadline' | 'orientation' | 'graduation'
  startDate: string
  endDate?: string
  isAllDay: boolean
  location?: string
  targetAudience: ('all' | 'students' | 'staff' | 'faculty')[]
}

// Notification Types
export interface Notification {
  _id: string
  recipient: string | User
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  category: 'academic' | 'financial' | 'administrative' | 'social'
  isRead: boolean
  actionUrl?: string
  createdAt: string
  expiresAt?: string
}

// Dashboard Types
export interface StudentDashboardData {
  student: Student
  enrolledCourses: Course[]
  recentGrades: Grade[]
  upcomingAssessments: Assessment[]
  announcements: Announcement[]
  gpaHistory: SemesterGPA[]
  paymentSummary: PaymentSummary
  notifications: Notification[]
  academicCalendar: AcademicEvent[]
  registrationStatus: {
    isOpen: boolean
    period?: RegistrationPeriod
    registeredCredits: number
    maxCredits: number
  }
}
