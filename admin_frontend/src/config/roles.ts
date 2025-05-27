// University Role-Based Access Control System
// Based on standard university hierarchies globally

export interface Permission {
  resource: string
  actions: string[]
}

export interface Role {
  id: string
  name: string
  displayName: string
  description: string
  level: number // Higher number = higher authority
  permissions: Permission[]
  allowedRoutes: string[]
  dashboardWidgets: string[]
}

// Define all possible permissions in the system
export const PERMISSIONS = {
  // User Management
  USERS: {
    resource: 'users',
    actions: ['create', 'read', 'update', 'delete', 'assign_roles', 'reset_password']
  },
  
  // Student Management
  STUDENTS: {
    resource: 'students',
    actions: ['create', 'read', 'update', 'delete', 'bulk_upload', 'export', 'view_academic_records']
  },
  
  // Staff Management
  STAFF: {
    resource: 'staff',
    actions: ['create', 'read', 'update', 'delete', 'assign_department', 'view_workload']
  },
  
  // Course Management
  COURSES: {
    resource: 'courses',
    actions: ['create', 'read', 'update', 'delete', 'assign_lecturer', 'view_enrollment']
  },
  
  // Department Management
  DEPARTMENTS: {
    resource: 'departments',
    actions: ['create', 'read', 'update', 'delete', 'manage_staff', 'view_statistics']
  },
  
  // Academic Planning
  ACADEMIC_PLANNING: {
    resource: 'academic_planning',
    actions: ['create_calendar', 'manage_semesters', 'schedule_exams', 'plan_curriculum']
  },
  
  // Results Management
  RESULTS: {
    resource: 'results',
    actions: ['upload', 'read', 'update', 'approve', 'publish', 'generate_transcripts']
  },
  
  // Financial Management
  FINANCE: {
    resource: 'finance',
    actions: ['view_payments', 'process_payments', 'generate_reports', 'manage_fees']
  },
  
  // Student Affairs
  STUDENT_AFFAIRS: {
    resource: 'student_affairs',
    actions: ['manage_activities', 'handle_complaints', 'manage_accommodation', 'disciplinary_actions']
  },
  
  // MIS (Management Information System)
  MIS: {
    resource: 'mis',
    actions: ['generate_reports', 'view_analytics', 'export_data', 'system_configuration']
  },
  
  // Examinations
  EXAMINATIONS: {
    resource: 'examinations',
    actions: ['schedule_exams', 'manage_venues', 'assign_invigilators', 'process_results']
  }
}

// Define university roles with their permissions
export const UNIVERSITY_ROLES: Record<string, Role> = {
  // Highest Level - System Administrator
  admin: {
    id: 'admin',
    name: 'admin',
    displayName: 'System Administrator',
    description: 'Full system access and control',
    level: 100,
    permissions: Object.values(PERMISSIONS), // All permissions
    allowedRoutes: ['*'], // All routes
    dashboardWidgets: [
      'system_overview',
      'user_statistics',
      'academic_overview',
      'financial_summary',
      'recent_activities',
      'system_health'
    ]
  },

  // Senior Management Level
  vice_chancellor: {
    id: 'vice_chancellor',
    name: 'vice_chancellor',
    displayName: 'Vice Chancellor',
    description: 'Chief Executive of the University',
    level: 95,
    permissions: [
      PERMISSIONS.USERS,
      PERMISSIONS.STUDENTS,
      PERMISSIONS.STAFF,
      PERMISSIONS.COURSES,
      PERMISSIONS.DEPARTMENTS,
      PERMISSIONS.ACADEMIC_PLANNING,
      PERMISSIONS.FINANCE,
      PERMISSIONS.MIS
    ],
    allowedRoutes: [
      '/dashboard',
      '/users',
      '/students',
      '/staff',
      '/courses',
      '/departments',
      '/reports',
      '/analytics'
    ],
    dashboardWidgets: [
      'executive_summary',
      'academic_overview',
      'financial_summary',
      'enrollment_trends',
      'performance_metrics'
    ]
  },

  // Academic Leadership
  deputy_vice_chancellor_academic: {
    id: 'deputy_vice_chancellor_academic',
    name: 'deputy_vice_chancellor_academic',
    displayName: 'Deputy Vice Chancellor (Academic)',
    description: 'Oversees all academic activities',
    level: 90,
    permissions: [
      PERMISSIONS.STUDENTS,
      PERMISSIONS.STAFF,
      PERMISSIONS.COURSES,
      PERMISSIONS.DEPARTMENTS,
      PERMISSIONS.ACADEMIC_PLANNING,
      PERMISSIONS.RESULTS,
      PERMISSIONS.EXAMINATIONS
    ],
    allowedRoutes: [
      '/dashboard',
      '/students',
      '/staff',
      '/courses',
      '/departments',
      '/academic-planning',
      '/results',
      '/examinations'
    ],
    dashboardWidgets: [
      'academic_overview',
      'enrollment_statistics',
      'course_performance',
      'faculty_workload',
      'examination_schedule'
    ]
  },

  // Directors Level
  director_academic_planning: {
    id: 'director_academic_planning',
    name: 'director_academic_planning',
    displayName: 'Director of Academic Planning',
    description: 'Plans and coordinates academic programs',
    level: 80,
    permissions: [
      { resource: 'students', actions: ['read', 'view_academic_records'] },
      { resource: 'courses', actions: ['create', 'read', 'update', 'view_enrollment'] },
      { resource: 'departments', actions: ['read', 'view_statistics'] },
      PERMISSIONS.ACADEMIC_PLANNING,
      { resource: 'results', actions: ['read', 'generate_transcripts'] }
    ],
    allowedRoutes: [
      '/dashboard',
      '/courses',
      '/academic-planning',
      '/reports/academic'
    ],
    dashboardWidgets: [
      'academic_calendar',
      'course_planning',
      'enrollment_projections',
      'curriculum_status'
    ]
  },

  director_mis: {
    id: 'director_mis',
    name: 'director_mis',
    displayName: 'Director of MIS',
    description: 'Manages information systems and data analytics',
    level: 80,
    permissions: [
      { resource: 'students', actions: ['read', 'export'] },
      { resource: 'staff', actions: ['read'] },
      { resource: 'courses', actions: ['read'] },
      PERMISSIONS.MIS,
      { resource: 'finance', actions: ['generate_reports'] }
    ],
    allowedRoutes: [
      '/dashboard',
      '/reports',
      '/analytics',
      '/data-management'
    ],
    dashboardWidgets: [
      'system_analytics',
      'data_insights',
      'report_generation',
      'system_performance'
    ]
  },

  // Departmental Level
  hod: {
    id: 'hod',
    name: 'hod',
    displayName: 'Head of Department',
    description: 'Manages departmental activities and staff',
    level: 70,
    permissions: [
      { resource: 'students', actions: ['read', 'view_academic_records'] },
      { resource: 'staff', actions: ['read', 'assign_department', 'view_workload'] },
      { resource: 'courses', actions: ['create', 'read', 'update', 'assign_lecturer'] },
      { resource: 'results', actions: ['read', 'approve'] }
    ],
    allowedRoutes: [
      '/dashboard',
      '/students',
      '/staff/department',
      '/courses/department',
      '/results/department'
    ],
    dashboardWidgets: [
      'department_overview',
      'staff_workload',
      'course_assignments',
      'student_performance'
    ]
  },

  // Administrative Officers
  registrar: {
    id: 'registrar',
    name: 'registrar',
    displayName: 'Registrar',
    description: 'Manages student records and academic administration',
    level: 75,
    permissions: [
      PERMISSIONS.STUDENTS,
      { resource: 'staff', actions: ['read'] },
      { resource: 'courses', actions: ['read', 'view_enrollment'] },
      { resource: 'results', actions: ['read', 'approve', 'publish', 'generate_transcripts'] },
      PERMISSIONS.EXAMINATIONS
    ],
    allowedRoutes: [
      '/dashboard',
      '/students',
      '/courses/enrollment',
      '/results',
      '/examinations',
      '/transcripts'
    ],
    dashboardWidgets: [
      'student_statistics',
      'enrollment_overview',
      'examination_schedule',
      'transcript_requests'
    ]
  },

  finance_officer: {
    id: 'finance_officer',
    name: 'finance_officer',
    displayName: 'Finance Officer',
    description: 'Manages financial transactions and fee collection',
    level: 65,
    permissions: [
      { resource: 'students', actions: ['read'] },
      PERMISSIONS.FINANCE
    ],
    allowedRoutes: [
      '/dashboard',
      '/finance',
      '/payments',
      '/financial-reports'
    ],
    dashboardWidgets: [
      'payment_overview',
      'fee_collection',
      'financial_reports',
      'outstanding_payments'
    ]
  },

  student_affairs_officer: {
    id: 'student_affairs_officer',
    name: 'student_affairs_officer',
    displayName: 'Student Affairs Officer',
    description: 'Handles student welfare and non-academic activities',
    level: 60,
    permissions: [
      { resource: 'students', actions: ['read', 'update'] },
      PERMISSIONS.STUDENT_AFFAIRS
    ],
    allowedRoutes: [
      '/dashboard',
      '/students/affairs',
      '/activities',
      '/accommodation',
      '/complaints'
    ],
    dashboardWidgets: [
      'student_activities',
      'accommodation_status',
      'complaint_tracking',
      'welfare_statistics'
    ]
  },

  exams_records_officer: {
    id: 'exams_records_officer',
    name: 'exams_records_officer',
    displayName: 'Examinations & Records Officer',
    description: 'Manages examinations and academic records',
    level: 65,
    permissions: [
      { resource: 'students', actions: ['read', 'view_academic_records'] },
      { resource: 'courses', actions: ['read'] },
      { resource: 'results', actions: ['upload', 'read', 'update'] },
      PERMISSIONS.EXAMINATIONS
    ],
    allowedRoutes: [
      '/dashboard',
      '/examinations',
      '/results',
      '/academic-records'
    ],
    dashboardWidgets: [
      'examination_overview',
      'results_processing',
      'academic_records',
      'grade_statistics'
    ]
  },

  academic_secretary: {
    id: 'academic_secretary',
    name: 'academic_secretary',
    displayName: 'Academic Secretary',
    description: 'Supports academic administration and coordination',
    level: 55,
    permissions: [
      { resource: 'students', actions: ['read'] },
      { resource: 'staff', actions: ['read'] },
      { resource: 'courses', actions: ['read'] },
      { resource: 'academic_planning', actions: ['create_calendar', 'manage_semesters'] }
    ],
    allowedRoutes: [
      '/dashboard',
      '/academic-calendar',
      '/course-schedules',
      '/academic-coordination'
    ],
    dashboardWidgets: [
      'academic_calendar',
      'meeting_schedules',
      'coordination_tasks',
      'academic_notices'
    ]
  },

  // Faculty Level
  lecturer: {
    id: 'lecturer',
    name: 'lecturer',
    displayName: 'Lecturer',
    description: 'Teaching staff with course and result management access',
    level: 50,
    permissions: [
      { resource: 'students', actions: ['read'] },
      { resource: 'courses', actions: ['read'] },
      { resource: 'results', actions: ['upload', 'read', 'update'] }
    ],
    allowedRoutes: [
      '/dashboard',
      '/my-courses',
      '/results-upload',
      '/student-list'
    ],
    dashboardWidgets: [
      'my_courses',
      'assigned_students',
      'results_pending',
      'teaching_schedule'
    ]
  }
}

// Helper functions
export const getRoleByName = (roleName: string): Role | undefined => {
  return UNIVERSITY_ROLES[roleName]
}

export const hasPermission = (userRole: string, resource: string, action: string): boolean => {
  const role = getRoleByName(userRole)
  if (!role) return false
  
  // Admin has all permissions
  if (userRole === 'admin') return true
  
  return role.permissions.some(permission => 
    permission.resource === resource && permission.actions.includes(action)
  )
}

export const canAccessRoute = (userRole: string, route: string): boolean => {
  const role = getRoleByName(userRole)
  if (!role) return false
  
  // Admin can access all routes
  if (userRole === 'admin' || role.allowedRoutes.includes('*')) return true
  
  return role.allowedRoutes.some(allowedRoute => 
    route.startsWith(allowedRoute) || allowedRoute === route
  )
}

export const getDashboardWidgets = (userRole: string): string[] => {
  const role = getRoleByName(userRole)
  return role?.dashboardWidgets || []
}

export const getRoleLevel = (userRole: string): number => {
  const role = getRoleByName(userRole)
  return role?.level || 0
}

export const canManageRole = (managerRole: string, targetRole: string): boolean => {
  const managerLevel = getRoleLevel(managerRole)
  const targetLevel = getRoleLevel(targetRole)
  
  return managerLevel > targetLevel
}
