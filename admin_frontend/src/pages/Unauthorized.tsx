import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/hooks/useAuthStore'
import { getRoleByName } from '@/config/roles'
import {
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

const Unauthorized: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const userRoleInfo = user ? getRoleByName(user.role) : null

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleGoHome = () => {
    navigate('/dashboard')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Access Denied
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You don't have permission to access this resource.
            </p>
            
            {user && userRoleInfo && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Current Role:</span> {userRoleInfo.displayName}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {userRoleInfo.description}
                </p>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                onClick={handleGoBack}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Go Back
              </button>
              
              <button
                onClick={handleGoHome}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                Go to Dashboard
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>If you believe this is an error, please contact your system administrator.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized
