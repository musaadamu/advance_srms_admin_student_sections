import {
  HomeIcon,
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CogIcon,
  PresentationChartLineIcon,
  BanknotesIcon,
  HeartIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline'

export interface NavigationItem {
  name: string
  href: string
  icon: any
  current?: boolean
  children?: NavigationItem[]
  requiredRoles?: string[]
  requiredPermission?: {
    resource: string
    action: string
  }
  badge?: string
}

// Define navigation structure based on university roles
export const getNavigationForRole = (userRole: string): NavigationItem[] => {
  const baseNavigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      requiredRoles: ['*'] // All authenticated users
    }
  ]

  // Admin - Full Access
  if (userRole === 'admin') {
    return [
      ...baseNavigation,
      {
        name: 'User Management',
        href: '/users',
        icon: UsersIcon,
        children: [
          { name: 'All Users', href: '/users', icon: UsersIcon },
          { name: 'Staff Management', href: '/users/staff', icon: UserGroupIcon },
          { name: 'Role Assignment', href: '/users/roles', icon: CogIcon },
          { name: 'Password Reset', href: '/users/password-reset', icon: DocumentTextIcon }
        ]
      },
      {
        name: 'Student Management',
        href: '/students',
        icon: AcademicCapIcon,
        children: [
          { name: 'All Students', href: '/students', icon: AcademicCapIcon },
          { name: 'Admissions', href: '/students/admissions', icon: DocumentCheckIcon },
          { name: 'Bulk Upload', href: '/students/bulk-upload', icon: DocumentTextIcon }
        ]
      },
      {
        name: 'Academic Management',
        href: '/academic',
        icon: BookOpenIcon,
        children: [
          { name: 'Courses', href: '/courses', icon: BookOpenIcon },
          { name: 'Departments', href: '/departments', icon: BuildingOfficeIcon },
          { name: 'Course Assignments', href: '/course-assignments', icon: ClipboardDocumentListIcon },
          { name: 'Academic Planning', href: '/academic-planning', icon: CalendarIcon }
        ]
      },
      {
        name: 'Results & Examinations',
        href: '/results',
        icon: DocumentTextIcon,
        children: [
          { name: 'Results Upload', href: '/results-upload', icon: DocumentTextIcon },
          { name: 'Examination Management', href: '/examinations', icon: ClipboardDocumentListIcon },
          { name: 'Transcripts', href: '/transcripts', icon: DocumentCheckIcon }
        ]
      },
      {
        name: 'Financial Management',
        href: '/finance',
        icon: CurrencyDollarIcon,
        children: [
          { name: 'Fee Management', href: '/finance/fees', icon: BanknotesIcon },
          { name: 'Payments', href: '/finance/payments', icon: CurrencyDollarIcon },
          { name: 'Financial Reports', href: '/finance/reports', icon: ChartBarIcon }
        ]
      },
      {
        name: 'Reports & Analytics',
        href: '/reports',
        icon: ChartBarIcon,
        children: [
          { name: 'Academic Reports', href: '/reports/academic', icon: PresentationChartLineIcon },
          { name: 'Financial Reports', href: '/reports/financial', icon: BanknotesIcon },
          { name: 'System Analytics', href: '/reports/analytics', icon: ChartBarIcon }
        ]
      },
      {
        name: 'System Configuration',
        href: '/settings',
        icon: CogIcon
      }
    ]
  }

  // Vice Chancellor - Executive Level
  if (userRole === 'vice_chancellor') {
    return [
      ...baseNavigation,
      {
        name: 'Executive Overview',
        href: '/executive',
        icon: PresentationChartLineIcon
      },
      {
        name: 'Academic Management',
        href: '/academic',
        icon: BookOpenIcon,
        children: [
          { name: 'Departments', href: '/departments', icon: BuildingOfficeIcon },
          { name: 'Academic Planning', href: '/academic-planning', icon: CalendarIcon }
        ]
      },
      {
        name: 'Reports & Analytics',
        href: '/reports',
        icon: ChartBarIcon
      }
    ]
  }

  // HOD - Department Level
  if (userRole === 'hod') {
    return [
      ...baseNavigation,
      {
        name: 'Department Management',
        href: '/department',
        icon: BuildingOfficeIcon,
        children: [
          { name: 'Department Overview', href: '/department/overview', icon: BuildingOfficeIcon },
          { name: 'Staff Management', href: '/department/staff', icon: UserGroupIcon },
          { name: 'Course Management', href: '/department/courses', icon: BookOpenIcon },
          { name: 'Course Assignments', href: '/department/assignments', icon: ClipboardDocumentListIcon }
        ]
      },
      {
        name: 'Students',
        href: '/students/department',
        icon: AcademicCapIcon
      },
      {
        name: 'Results Management',
        href: '/results/department',
        icon: DocumentTextIcon
      }
    ]
  }

  // Registrar - Student Records
  if (userRole === 'registrar') {
    return [
      ...baseNavigation,
      {
        name: 'Student Management',
        href: '/students',
        icon: AcademicCapIcon,
        children: [
          { name: 'All Students', href: '/students', icon: AcademicCapIcon },
          { name: 'Admissions', href: '/students/admissions', icon: DocumentCheckIcon },
          { name: 'Academic Records', href: '/students/records', icon: DocumentTextIcon }
        ]
      },
      {
        name: 'Examinations',
        href: '/examinations',
        icon: ClipboardDocumentListIcon,
        children: [
          { name: 'Exam Scheduling', href: '/examinations/schedule', icon: CalendarIcon },
          { name: 'Results Processing', href: '/examinations/results', icon: DocumentTextIcon }
        ]
      },
      {
        name: 'Transcripts',
        href: '/transcripts',
        icon: DocumentCheckIcon
      }
    ]
  }

  // Finance Officer - Financial Management
  if (userRole === 'finance_officer') {
    return [
      ...baseNavigation,
      {
        name: 'Financial Management',
        href: '/finance',
        icon: CurrencyDollarIcon,
        children: [
          { name: 'Fee Collection', href: '/finance/fees', icon: BanknotesIcon },
          { name: 'Payment Processing', href: '/finance/payments', icon: CurrencyDollarIcon },
          { name: 'Financial Reports', href: '/finance/reports', icon: ChartBarIcon }
        ]
      },
      {
        name: 'Student Accounts',
        href: '/finance/student-accounts',
        icon: AcademicCapIcon
      }
    ]
  }

  // Director Academic Planning
  if (userRole === 'director_academic_planning') {
    return [
      ...baseNavigation,
      {
        name: 'Academic Planning',
        href: '/academic-planning',
        icon: CalendarIcon,
        children: [
          { name: 'Academic Calendar', href: '/academic-planning/calendar', icon: CalendarIcon },
          { name: 'Curriculum Planning', href: '/academic-planning/curriculum', icon: BookOpenIcon },
          { name: 'Course Scheduling', href: '/academic-planning/scheduling', icon: ClipboardDocumentListIcon }
        ]
      },
      {
        name: 'Course Management',
        href: '/courses',
        icon: BookOpenIcon
      }
    ]
  }

  // Director MIS
  if (userRole === 'director_mis') {
    return [
      ...baseNavigation,
      {
        name: 'Data Analytics',
        href: '/analytics',
        icon: ChartBarIcon,
        children: [
          { name: 'System Reports', href: '/analytics/reports', icon: PresentationChartLineIcon },
          { name: 'Data Insights', href: '/analytics/insights', icon: ChartBarIcon },
          { name: 'Export Data', href: '/analytics/export', icon: DocumentTextIcon }
        ]
      },
      {
        name: 'System Management',
        href: '/system',
        icon: CogIcon
      }
    ]
  }

  // Student Affairs Officer
  if (userRole === 'student_affairs_officer') {
    return [
      ...baseNavigation,
      {
        name: 'Student Affairs',
        href: '/student-affairs',
        icon: HeartIcon,
        children: [
          { name: 'Student Activities', href: '/student-affairs/activities', icon: UserGroupIcon },
          { name: 'Accommodation', href: '/student-affairs/accommodation', icon: BuildingOfficeIcon },
          { name: 'Complaints', href: '/student-affairs/complaints', icon: DocumentTextIcon }
        ]
      },
      {
        name: 'Student Welfare',
        href: '/student-welfare',
        icon: HeartIcon
      }
    ]
  }

  // Exams and Records Officer
  if (userRole === 'exams_records_officer') {
    return [
      ...baseNavigation,
      {
        name: 'Examinations',
        href: '/examinations',
        icon: ClipboardDocumentListIcon,
        children: [
          { name: 'Exam Management', href: '/examinations/management', icon: ClipboardDocumentListIcon },
          { name: 'Results Processing', href: '/examinations/results', icon: DocumentTextIcon },
          { name: 'Grade Management', href: '/examinations/grades', icon: DocumentCheckIcon }
        ]
      },
      {
        name: 'Academic Records',
        href: '/academic-records',
        icon: DocumentTextIcon
      }
    ]
  }

  // Academic Secretary
  if (userRole === 'academic_secretary') {
    return [
      ...baseNavigation,
      {
        name: 'Academic Coordination',
        href: '/academic-coordination',
        icon: CalendarIcon,
        children: [
          { name: 'Academic Calendar', href: '/academic-coordination/calendar', icon: CalendarIcon },
          { name: 'Meeting Schedules', href: '/academic-coordination/meetings', icon: ClipboardDocumentListIcon }
        ]
      }
    ]
  }

  // Lecturer - Basic Access
  if (userRole === 'lecturer') {
    return [
      ...baseNavigation,
      {
        name: 'My Courses',
        href: '/my-courses',
        icon: BookOpenIcon
      },
      {
        name: 'Results Upload',
        href: '/results-upload',
        icon: DocumentTextIcon
      },
      {
        name: 'Student Lists',
        href: '/student-lists',
        icon: AcademicCapIcon
      }
    ]
  }

  // Default navigation for unrecognized roles
  return baseNavigation
}

// Helper function to check if navigation item should be visible
export const isNavigationItemVisible = (item: NavigationItem, userRole: string): boolean => {
  if (!item.requiredRoles) return true
  if (item.requiredRoles.includes('*')) return true
  return item.requiredRoles.includes(userRole)
}
