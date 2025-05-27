import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/hooks/useAuthStore'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Dashboard from '@/pages/Dashboard'
import Users from '@/pages/Users'
import Students from '@/pages/Students'
import Courses from '@/pages/Courses'
import Accounts from '@/pages/Accounts'
import BulkUpload from '@/pages/BulkUpload'
import CourseAllocation from '@/pages/CourseAllocation'
import ResultsUpload from '@/pages/ResultsUpload'
import Unauthorized from '@/pages/Unauthorized'


function App() {
  const { user, isLoading, isAuthenticated, logout } = useAuthStore()

  console.log('🎯 App render - Auth State:', {
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    userRole: user?.role,
    userEmail: user?.email
  })

  // Show loading screen while authentication is being initialized
  if (isLoading) {
    console.log('⏳ App: Showing loading screen')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login routes if user is not authenticated
  if (!isAuthenticated || !user) {
    console.log('🔐 App: User not authenticated, showing login routes')
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Check if user has a valid university role
  const validRoles = [
    'admin', 'vice_chancellor', 'deputy_vice_chancellor_academic',
    'director_academic_planning', 'director_mis', 'hod', 'registrar',
    'finance_officer', 'student_affairs_officer', 'exams_records_officer',
    'academic_secretary', 'lecturer'
  ]

  if (!validRoles.includes(user.role)) {
    console.log('❌ App: Access denied for role:', user.role)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
          <p className="text-sm text-gray-500 mt-2">Your role: {user.role}</p>
          <p className="text-xs text-gray-400 mt-1">Please contact the administrator for access.</p>
          <button
            onClick={() => {
              console.log('🚪 Access denied logout clicked')
              logout()
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  console.log('✅ App: User authenticated and authorized, showing main app')

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes with Role-based Access */}
        <Route
          path="/users/*"
          element={
            <ProtectedRoute requiredPermission={{ resource: 'users', action: 'read' }}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/*"
          element={
            <ProtectedRoute requiredPermission={{ resource: 'students', action: 'read' }}>
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/*"
          element={
            <ProtectedRoute requiredPermission={{ resource: 'courses', action: 'read' }}>
              <Courses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course-allocation"
          element={
            <ProtectedRoute requiredPermission={{ resource: 'courses', action: 'assign_lecturer' }}>
              <CourseAllocation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results-upload"
          element={
            <ProtectedRoute requiredPermission={{ resource: 'results', action: 'upload' }}>
              <ResultsUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts/*"
          element={
            <ProtectedRoute requiredPermission={{ resource: 'finance', action: 'view_payments' }}>
              <Accounts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bulk-upload"
          element={
            <ProtectedRoute allowedRoles={['admin', 'registrar']}>
              <BulkUpload />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
