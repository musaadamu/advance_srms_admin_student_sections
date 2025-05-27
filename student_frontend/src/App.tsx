import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/hooks/useAuthStore'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Dashboard from '@/pages/Dashboard'
import Courses from '@/pages/Courses'
import Registration from '@/pages/Registration'
import Payments from '@/pages/Payments'
import Results from '@/pages/Results'
import Profile from '@/pages/Profile'
import Schedule from '@/pages/Schedule'
import LoadingSpinner from '@/components/LoadingSpinner'

function App() {
  const { user, isLoading, isAuthenticated, logout } = useAuthStore()

  console.log('🎯 Student App render - Auth State:', {
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    userRole: user?.role,
    userEmail: user?.email
  })

  // Show loading screen while authentication is being initialized
  if (isLoading) {
    console.log('⏳ Student App: Showing loading screen')
    return <LoadingSpinner />
  }

  // Show login routes if user is not authenticated
  if (!isAuthenticated || !user) {
    console.log('🔐 Student App: User not authenticated, showing login routes')
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Check if user has student role or admin role (admins can access student portal)
  if (user.role !== 'student' && user.role !== 'admin') {
    console.log('❌ Student App: Access denied for role:', user.role)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the student portal.</p>
          <p className="text-sm text-gray-500 mt-2">Your role: {user.role}</p>
          <p className="text-xs text-gray-400 mt-1">Allowed roles: student, admin</p>
          <button
            onClick={() => {
              console.log('🚪 Student access denied logout clicked')
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

  console.log('✅ Student App: User authenticated and authorized, showing main app')

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses/*" element={<Courses />} />
        <Route path="/registration/*" element={<Registration />} />
        <Route path="/payments/*" element={<Payments />} />
        <Route path="/results/*" element={<Results />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/profile/*" element={<Profile />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
